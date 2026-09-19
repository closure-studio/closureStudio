import { runSdk } from "./sdkLifecycle";
const flush = async () => { for (let i = 0; i < 8; i++) await Promise.resolve(); };
function setup() {
  const events: Record<string, () => void> = {};
  const sdk = {
    onReady: (fn: () => void) => { events.ready = fn; },
    onSuccess: (fn: () => void) => { events.success = fn; },
    onClose: (fn: () => void) => { events.close = fn; },
    onError: (fn: () => void) => { events.error = fn; },
    destroy: jest.fn(), getValidate: () => ({}),
  };
  const controller = new AbortController();
  const submit = jest.fn(() => new Promise<void>(() => {}));
  const show = jest.fn();
  const result = runSdk((cb) => cb(sdk), show, submit, { signal: controller.signal }).catch(e => e);
  return { events, sdk, controller, submit, result, show };
}
afterEach(() => { jest.useRealTimers(); Reflect.deleteProperty(globalThis, "document"); });
test("取消提交后迟到成功不会再次发送，并释放计时器", async () => {
  jest.useFakeTimers(); const t = setup(); t.events.success(); t.controller.abort(); t.events.success();
  expect((await t.result).message).toContain("结果未知"); expect(t.submit).toHaveBeenCalledTimes(1);
  expect(t.sdk.destroy).toHaveBeenCalledTimes(1); expect(jest.getTimerCount()).toBe(0);
});
test("提交超时不自动重发", async () => {
  jest.useFakeTimers(); const t = setup(); t.events.success(); jest.advanceTimersByTime(30001);
  expect((await t.result).kind).toBe("timed-out"); expect(t.submit).toHaveBeenCalledTimes(1);
});
test("关闭后恢复到仍存在的原触发控件", async () => {
  const origin = { isConnected: true, focus: jest.fn() };
  Object.defineProperty(globalThis, "document", { configurable: true, value: { activeElement: origin } });
  const t = setup(); t.events.close(); await t.result; await flush();
  expect(origin.focus).toHaveBeenCalledTimes(1);
});
