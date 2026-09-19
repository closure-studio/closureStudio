jest.mock("@/utils/toast", () => ({ setMsg: jest.fn() }));
jest.mock("@/services/apiClient", () => ({ __esModule: true, default: { doUpdateCaptcha: jest.fn() } }));
import { startCaptcha } from "./captcha";
const valid = { captcha_id: "id", lot_number: "lot", pass_token: "pass", gen_time: "123", captcha_output: "out" };
const google = () => ({ execute: jest.fn(async () => "google"), ready: jest.fn(), render: jest.fn(), reset: jest.fn() });
const flush = async () => { for (let i = 0; i < 12; i++) await Promise.resolve(); };
let events: Record<string, () => void>;
let init: jest.Mock;
beforeEach(() => {
  events = {};
  init = jest.fn((_config, cb) => cb({
    onReady: (fn: () => void) => { events.ready = fn; },
    onSuccess: (fn: () => void) => { events.success = fn; },
    onError: (fn: () => void) => { events.error = fn; },
    onClose: (fn: () => void) => { events.close = fn; },
    showCaptcha: jest.fn(), destroy: jest.fn(), getValidate: () => valid,
  }));
  Object.defineProperty(globalThis, "window", { configurable: true, value: { initGeetest4: init } });
});
afterEach(() => Reflect.deleteProperty(globalThis, "window"));
test("只有GT4也可人工验证，重复成功只执行业务一次", async () => {
  const call = jest.fn(async () => ({ code: 1, message: "ok", data: null }));
  const result = startCaptcha(call); await flush();
  expect(init).toHaveBeenCalledTimes(1); events.success(); events.success();
  await expect(result).resolves.toMatchObject({ code: 1 }); expect(call).toHaveBeenCalledTimes(1);
});
test.each([-1100, 0, 1])("只有-1100降级 code=%s", async (code) => {
  window.grecaptcha = google();
  const call = jest.fn().mockResolvedValueOnce({ code }).mockResolvedValueOnce({ code: 1 });
  const result = startCaptcha(call); await flush();
  expect(init).toHaveBeenCalledTimes(code === -1100 ? 1 : 0);
  if (code === -1100) events.success();
  await result; expect(call).toHaveBeenCalledTimes(code === -1100 ? 2 : 1);
});
test("业务网络错误不降级重放", async () => {
  window.grecaptcha = google();
  const call = jest.fn(async () => { throw new Error("network"); });
  await expect(startCaptcha(call)).rejects.toThrow("network"); expect(init).not.toHaveBeenCalled(); expect(call).toHaveBeenCalledTimes(1);
});
