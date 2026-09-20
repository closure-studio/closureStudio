import { runSdk, type CaptchaSdk } from "./sdkLifecycle";
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
test("提交超过旧30秒期限仍等待原请求，不重发也不释放SDK", async () => {
  jest.useFakeTimers(); const t = setup(); const settled = jest.fn(); void t.result.then(settled);
  t.events.success(); jest.advanceTimersByTime(300_001); await flush();
  expect(settled).not.toHaveBeenCalled(); expect(t.sdk.destroy).not.toHaveBeenCalled();
  expect(t.submit).toHaveBeenCalledTimes(1); expect(jest.getTimerCount()).toBe(0);
  t.controller.abort(); await t.result;
});
test("初始化中挑战失效，迟到对象只销毁不展示或提交", async () => {
  let initialize!: (sdk: CaptchaSdk) => void;
  const controller = new AbortController(); const show = jest.fn(); const submit = jest.fn();
  const result = runSdk(cb => { initialize = cb; }, show, submit, { signal: controller.signal }).catch(error => error);
  controller.abort(); await result;
  const sdk = { onReady: jest.fn(), onSuccess: jest.fn(), onClose: jest.fn(), onError: jest.fn(), getValidate: jest.fn(), destroy: jest.fn() };
  initialize(sdk); expect(sdk.destroy).toHaveBeenCalledTimes(1);
  expect(show).not.toHaveBeenCalled(); expect(submit).not.toHaveBeenCalled(); expect(sdk.onSuccess).not.toHaveBeenCalled();
});
test("重复ready只展示一次，原生关闭在提交期间不重放", async () => {
  const t = setup(); t.events.ready(); t.events.ready(); t.events.success(); t.events.close(); t.events.error(); await flush();
  expect(t.show).toHaveBeenCalledTimes(1); expect(t.submit).toHaveBeenCalledTimes(1); expect(t.sdk.destroy).not.toHaveBeenCalled();
  t.controller.abort(); await t.result;
});
test("关闭后恢复到仍存在的原触发控件", async () => {
  const origin = { isConnected: true, focus: jest.fn() };
  Object.defineProperty(globalThis, "document", { configurable: true, value: { activeElement: origin } });
  const t = setup(); t.events.close(); await t.result; await flush();
  expect(origin.focus).toHaveBeenCalledTimes(1);
});
