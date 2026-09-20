jest.mock("@/utils/toast", () => ({ setMsg: jest.fn() }));
jest.mock("@/services/apiClient", () => ({ __esModule: true, default: { doUpdateCaptcha: jest.fn() } }));
import { arknightsGameCaptcha, startCaptcha } from "./captcha";
import apiClient from "@/services/apiClient";
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
afterEach(() => { jest.useRealTimers(); Reflect.deleteProperty(globalThis, "window"); });
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
test("reCAPTCHA和业务请求超过旧期限仍可完成且不重放", async () => {
  jest.useFakeTimers();
  let tokenReady!: (token: string) => void;
  let responseReady!: (response: { code: number; message: string; data: null }) => void;
  window.grecaptcha = { ...google(), execute: jest.fn(() => new Promise<string>((resolve) => { tokenReady = resolve; })) };
  const call = jest.fn(() => new Promise<{ code: number; message: string; data: null }>((resolve) => { responseReady = resolve; }));
  const settled = jest.fn(); const result = startCaptcha(call); void result.then(settled, settled);
  await flush(); jest.advanceTimersByTime(15_001); await flush();
  expect(settled).not.toHaveBeenCalled(); expect(call).not.toHaveBeenCalled();
  tokenReady("fresh-google"); await flush(); jest.advanceTimersByTime(30_001); await flush();
  expect(settled).not.toHaveBeenCalled(); expect(call).toHaveBeenCalledTimes(1);
  responseReady({ code: 1, message: "ok", data: null }); await expect(result).resolves.toMatchObject({ code: 1 });
  expect(call).toHaveBeenCalledWith("fresh-google"); expect(init).not.toHaveBeenCalled();
});
test.each(["close", "error"])("游戏验证%s后操作验证才展示，旧回调不能提交", async (event) => {
  jest.mocked(apiClient.doUpdateCaptcha).mockClear();
  const game = arknightsGameCaptcha("A", { created: 1, captcha_type: "", challenge: "c", geetestId: "id" }).catch(error => error);
  const call = jest.fn(async () => ({ code: 1, message: "ok", data: null }));
  const operation = startCaptcha(call); await flush();
  expect(init).toHaveBeenCalledTimes(1); const old = { ...events }; old[event](); await game; await flush();
  expect(init).toHaveBeenCalledTimes(2); old.success();
  expect(apiClient.doUpdateCaptcha).not.toHaveBeenCalled();
  events.success(); await operation; expect(call).toHaveBeenCalledTimes(1);
});
test("操作验证先展示，游戏排队失效不阻塞后续操作", async () => {
  const call = jest.fn(async () => ({ code: 1, message: "ok", data: null }));
  const first = startCaptcha(call); const controller = new AbortController();
  const skipped = arknightsGameCaptcha("A", { created: 1, captcha_type: "", challenge: "c", geetestId: "id" }, { signal: controller.signal }).catch(error => error);
  const last = startCaptcha(call); await flush(); expect(init).toHaveBeenCalledTimes(1);
  controller.abort(); await skipped; events.success(); await first; await flush();
  expect(init).toHaveBeenCalledTimes(2); events.success(); await last; expect(call).toHaveBeenCalledTimes(2);
});
test("业务网络错误不降级重放", async () => {
  window.grecaptcha = google();
  const call = jest.fn(async () => { throw new Error("network"); });
  await expect(startCaptcha(call)).rejects.toThrow("network"); expect(init).not.toHaveBeenCalled(); expect(call).toHaveBeenCalledTimes(1);
});
