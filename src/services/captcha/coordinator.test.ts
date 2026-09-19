import { createCaptchaCoordinator } from "./coordinator";
import type { ApiGameCaptchaInfo } from "@/shared/types/api";
const challenge = (value = "one"): ApiGameCaptchaInfo => ({ created: 1, captcha_type: "", gt: "gt", challenge: value });
const row = (account: string, value = "one", code = 1) => ({ account, info: challenge(value), code });
const flush = async () => { for (let i = 0; i < 15; i++) await Promise.resolve(); };
function setup() {
  const runs: { account: string; signal?: AbortSignal; resolve: () => void; reject: (error: Error) => void }[] = [];
  const run = jest.fn((account: string, _info: ApiGameCaptchaInfo, options: { signal?: AbortSignal }) => new Promise<void>((resolve, reject) => {
    runs.push({ account, signal: options.signal, resolve, reject });
    options.signal?.addEventListener("abort", () => reject(new Error("aborted")), { once: true });
  }));
  const c = createCaptchaCoordinator(run);
  return { c, runs, run };
}
afterEach(() => jest.useRealTimers());
test("三账号串行，取消同挑战不因轮询重弹", async () => {
  const { c, runs } = setup(); c.sync([row("A"), row("B"), row("C")]); await flush();
  expect(runs.map((r) => r.account)).toEqual(["A"]);
  c.cancel("A"); await flush(); expect(runs.map((r) => r.account)).toEqual(["A", "B"]);
  c.sync([row("A"), row("B"), row("C")]); runs[1].resolve(); await flush();
  expect(runs.map((r) => r.account)).toEqual(["A", "B", "C"]);
  expect(c.states.value.A.phase).toBe("cancelled"); c.reset();
});
test("created相同但challenge变化会替换，旧响应不能覆盖", async () => {
  const { c, runs } = setup(); c.sync([row("A")]); await flush();
  c.sync([row("A", "two")]); await flush(); expect(runs).toHaveLength(2);
  runs[0].resolve(); await flush(); expect(c.states.value.A.phase).not.toBe("awaiting-status");
  runs[1].resolve(); await flush(); expect(c.states.value.A.phase).toBe("awaiting-status"); c.reset();
});
test("成功提交后不以原运行状态或挑战消失冒充确认", async () => {
  const { c, runs } = setup(); c.sync([row("A", "one", 2)]); await flush();
  const oldRead = c.readBarrier(); runs[0].resolve(); await flush();
  expect(c.states.value.A.phase).toBe("awaiting-status");
  c.sync([row("A", "one", 2)], oldRead); expect(c.states.value.A.phase).toBe("awaiting-status");
  c.sync([{ account: "A", code: 0, info: { created: 1, captcha_type: "" } }], c.readBarrier());
  expect(c.states.value.A.phase).toBe("awaiting-status");
  c.sync([row("A", "one", 2)], c.readBarrier()); expect(c.states.value.A.phase).toBe("server-running"); c.reset();
});
test("失败不重弹，重试先读取，读取失败不再验证", async () => {
  const { c, runs } = setup(); c.sync([row("A")]); await flush(); runs[0].reject(new Error("failed")); await flush();
  c.sync([row("A")]); await flush(); expect(runs).toHaveLength(1);
  await c.retry("A", async () => false); expect(runs).toHaveLength(1);
  await c.retry("A", async () => true); await flush(); expect(runs).toHaveLength(2); c.reset();
});
test("重试刷新发现挑战消失不重开旧SDK", async () => {
  const { c, runs } = setup(); c.sync([row("A")]); await flush(); c.cancel("A"); await flush();
  await c.retry("A", async () => { c.sync([{ account: "A", code: 0, info: { created: 1, captcha_type: "" } }]); return true; });
  await flush(); expect(runs).toHaveLength(1); c.reset();
});
test("账号删除和重置失效所有待办，旧完成不得恢复状态", async () => {
  const { c, runs } = setup(); c.sync([row("A"), row("B")]); await flush();
  c.sync([row("B")]); await flush(); expect(runs[0].signal?.aborted).toBe(true);
  c.reset(); runs[1].resolve(); await flush(); expect(c.states.value).toEqual({});
});
test("确认超时保留未知，不重放登录或验证", async () => {
  jest.useFakeTimers(); const { c, runs } = setup(); c.sync([row("A")]); await flush(); runs[0].resolve(); await flush();
  jest.advanceTimersByTime(60_001); expect(c.states.value.A.phase).toBe("unconfirmed");
  expect(runs).toHaveLength(1); c.reset(); expect(jest.getTimerCount()).toBe(0);
});
test("后端明确失败单独展示，缺字段不打开SDK", async () => {
  const { c, runs } = setup(); c.sync([row("A"), { account: "B", info: { created: 1, captcha_type: "", geetestId: "id" }, code: 1 }]);
  await flush(); expect(c.states.value.B.phase).toBe("error"); runs[0].resolve(); await flush();
  c.sync([row("A", "one", -1)], c.readBarrier()); expect(c.states.value.A.phase).toBe("server-failed"); c.reset();
});
