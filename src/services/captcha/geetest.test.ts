jest.mock("@/services/apiClient", () => ({
  __esModule: true, default: { doUpdateCaptcha: jest.fn() },
}));
jest.mock("@/utils/toast", () => ({ setMsg: jest.fn() }));

import apiClient from "@/services/apiClient";
import { handleGT3Captcha } from "./geetestV3";
import { handleGT4Captcha } from "./geetestV4";

const data = { challenge: "challenge", gt: "gt", geetestId: "gt4", created: 1, captcha_type: "" };
const valid = {
  geetest_challenge: "challenge", geetest_validate: "valid", geetest_seccode: "sec",
  captcha_id: "gt4", lot_number: "lot", pass_token: "pass", gen_time: "123", captcha_output: "output",
};
const flush = async () => { for (let i = 0; i < 8; i++) await Promise.resolve(); };

describe.each([handleGT3Captcha, handleGT4Captcha])("验证码生命周期 %p", (handler) => {
  let events: Record<string, () => void>;
  let obj: ReturnType<typeof makeObj>;
  let init: jest.Mock;
  function makeObj() {
    return {
      onReady: (fn: () => void) => { events.ready = fn; },
      onSuccess: (fn: () => void) => { events.success = fn; },
      onError: (fn: () => void) => { events.error = fn; },
      onClose: (fn: () => void) => { events.close = fn; },
      verify: jest.fn(), showCaptcha: jest.fn(), appendTo: jest.fn(),
      destroy: jest.fn(), getValidate: jest.fn<unknown, []>(() => valid),
    };
  }
  beforeEach(() => {
    jest.useFakeTimers(); jest.clearAllMocks(); events = {}; obj = makeObj();
    init = jest.fn((_config, callback) => callback(obj));
    Object.defineProperty(globalThis, "window", { configurable: true, value: { initGeetest: init, initGeetest4: init } });
    jest.mocked(apiClient.doUpdateCaptcha).mockResolvedValue({ code: 1, data: null, message: "ok" });
  });
  afterEach(() => { jest.useRealTimers(); Reflect.deleteProperty(globalThis, "window"); });
  function begin() {
    const resolve = jest.fn(); const reject = jest.fn();
    handler("G123", data, resolve, reject);
    return { resolve, reject };
  }
  test.each([0, 1])("仅业务接受才结算成功 code=%i", async (code) => {
    jest.mocked(apiClient.doUpdateCaptcha).mockResolvedValue({ code, data: null, message: "rejected" });
    const { resolve, reject } = begin(); events.success(); await flush();
    expect(apiClient.doUpdateCaptcha).toHaveBeenCalledTimes(1);
    expect(obj.destroy).toHaveBeenCalledTimes(1);
    expect(code === 1 ? resolve : reject).toHaveBeenCalledTimes(1);
    expect(code === 1 ? reject : resolve).not.toHaveBeenCalled();
  });
  test.each([null, {}, { ...valid, geetest_seccode: "", pass_token: "" }])("不提交缺字段结果 %p", async (result) => {
    obj.getValidate.mockReturnValue(result);
    const { reject } = begin(); events.success(); await flush();
    expect(reject).toHaveBeenCalledTimes(1); expect(apiClient.doUpdateCaptcha).not.toHaveBeenCalled();
    expect(obj.destroy).toHaveBeenCalledTimes(1);
  });
  test.each(["close", "error"])("%s 清理且迟到成功不能提交", async (event) => {
    const { reject, resolve } = begin(); events[event]?.(); events.success(); await flush();
    expect(reject).toHaveBeenCalledTimes(1); expect(resolve).not.toHaveBeenCalled();
    expect(apiClient.doUpdateCaptcha).not.toHaveBeenCalled(); expect(obj.destroy).toHaveBeenCalledTimes(1);
  });
  test("重复成功只发一个提交，成功后关闭不改变结果", async () => {
    const { resolve, reject } = begin(); events.success(); events.success(); events.close?.(); await flush();
    expect(apiClient.doUpdateCaptcha).toHaveBeenCalledTimes(1);
    expect(resolve).toHaveBeenCalledTimes(1); expect(reject).not.toHaveBeenCalled();
  });
  test("SDK未初始化也会到期，迟到对象只销毁", async () => {
    init.mockImplementation(() => {}); const { reject } = begin();
    jest.advanceTimersByTime(15_001); await flush();
    expect(reject).toHaveBeenCalledTimes(1);
    init.mock.calls[0][1](obj); expect(obj.destroy).toHaveBeenCalledTimes(1);
    expect(obj.verify).not.toHaveBeenCalled(); expect(obj.showCaptcha).not.toHaveBeenCalled();
  });
  test("人工等待到期并释放定时器", async () => {
    const { reject } = begin(); events.ready(); jest.advanceTimersByTime(300_001); await flush();
    expect(reject).toHaveBeenCalledTimes(1); expect(obj.destroy).toHaveBeenCalledTimes(1);
    expect(jest.getTimerCount()).toBe(0);
  });
  test("SDK缺失不提交", async () => {
    Reflect.deleteProperty(window, "initGeetest"); Reflect.deleteProperty(window, "initGeetest4");
    const { reject } = begin(); await flush();
    expect(reject).toHaveBeenCalledTimes(1); expect(apiClient.doUpdateCaptcha).not.toHaveBeenCalled();
  });
  test("提交网络错误提示结果未知，不自动重发", async () => {
    jest.mocked(apiClient.doUpdateCaptcha).mockRejectedValue(new Error("network"));
    const { reject } = begin(); events.success(); await flush();
    expect(reject.mock.calls[0][0].message).toContain("结果未知");
    expect(apiClient.doUpdateCaptcha).toHaveBeenCalledTimes(1);
  });
  test("销毁异常不阻止结算", async () => {
    obj.destroy.mockImplementation(() => { throw new Error("destroy"); });
    const { reject } = begin(); events.error(); await flush(); expect(reject).toHaveBeenCalledTimes(1);
  });
  test("SDK初始化异常立即结算", async () => {
    init.mockImplementation(() => { throw new Error("init"); });
    const { reject } = begin(); await flush(); expect(reject).toHaveBeenCalledTimes(1);
  });
});
