import { createCaptchaCoordinator } from "./coordinator";
import type { ApiGameCaptchaInfo } from "@/shared/types/api";
const challenge = (value = "one"): ApiGameCaptchaInfo => ({ created: 1, captcha_type: "", gt: "gt", challenge: value });
const row = (account: string, value = "one") => ({ account, info: challenge(value) });
const flush = async () => { for (let i = 0; i < 15; i++) await Promise.resolve(); };
function setup() {
  const runs: { account: string; info: ApiGameCaptchaInfo; signal?: AbortSignal; resolve: () => void; reject: (error: Error) => void }[] = [];
  const run = jest.fn((account: string, info: ApiGameCaptchaInfo, options: { signal?: AbortSignal }) => new Promise<void>((resolve, reject) => {
    runs.push({ account, info, signal: options.signal, resolve, reject });
    options.signal?.addEventListener("abort", () => reject(new Error("aborted")), { once: true });
  }));
  const c = createCaptchaCoordinator(run);
  return { c, runs, run };
}
afterEach(() => jest.useRealTimers());
test("三账号串行，失败和结束的同挑战不因轮询重弹", async () => {
  const { c, runs } = setup(); c.sync([row("A"), row("B"), row("C")]); await flush();
  expect(runs.map((r) => r.account)).toEqual(["A"]);
  runs[0].reject(new Error("closed")); await flush(); expect(runs.map((r) => r.account)).toEqual(["A", "B"]);
  c.sync([row("A"), row("B"), row("C")]); runs[1].resolve(); await flush();
  expect(runs.map((r) => r.account)).toEqual(["A", "B", "C"]);
  runs[2].resolve(); await flush(); c.sync([row("A"), row("B"), row("C")]); await flush();
  expect(runs).toHaveLength(3); c.reset();
});
test.each(["challenge", "gt", "created", "geetestId", "riskType", "captcha_type"] as const)("身份字段%s变化替换任务，旧完成无效", async (field) => {
  const { c, runs } = setup(); c.sync([row("A")]); await flush();
  const next = row("A"); Object.assign(next.info, { [field]: field === "created" ? 2 : "new" });
  c.sync([next]); await flush(); expect(runs).toHaveLength(2);
  expect(runs[0].signal?.aborted).toBe(true);
  runs[0].resolve(); await flush(); c.sync([next]); expect(runs).toHaveLength(2); c.reset();
});
test.each(["resolve", "reject"] as const)("已%s任务重试先读，GET失败或抛错均不重试", async (end) => {
  const { c, runs } = setup(); c.sync([row("A")]); await flush(); runs[0][end](new Error("failed")); await flush();
  c.sync([row("A")]); await flush(); expect(runs).toHaveLength(1);
  await c.retry("A", async () => false); expect(runs).toHaveLength(1);
  await expect(c.retry("A", async () => { throw new Error("GET failed"); })).rejects.toThrow("GET failed");
  expect(runs).toHaveLength(1);
  await c.retry("A", async () => { c.sync([row("A")]); return true; }); await flush();
  expect(runs).toHaveLength(2); expect(runs[1].info).toEqual(challenge()); c.reset();
});
test("刷新产生新挑战且立即结束也只入队一次", async () => {
  const { c, runs } = setup(); c.sync([row("A")]); await flush(); runs[0].reject(new Error("closed")); await flush();
  await c.retry("A", async () => {
    c.sync([row("A", "new")]); await flush(); runs[1].reject(new Error("closed")); await flush(); return true;
  });
  await flush(); expect(runs).toHaveLength(2); expect(runs[1].info.challenge).toBe("new"); c.reset();
});
test("刷新期间结束的在途任务不被同一次登录重复入队", async () => {
  const { c, runs } = setup(); c.sync([row("A")]); await flush();
  await c.retry("A", async () => { runs[0].reject(new Error("closed")); await flush(); c.sync([row("A")]); return true; });
  await flush(); expect(runs).toHaveLength(1); c.reset();
});
test.each(["gone", "empty", "incomplete", "reset"])("重试刷新后%s不得重开旧SDK", async (mode) => {
  const { c, runs } = setup(); c.sync([row("A")]); await flush(); runs[0].reject(new Error("closed")); await flush();
  await c.retry("A", async () => {
    if (mode === "reset") c.reset();
    else c.sync(mode === "gone" ? [] : [{ account: "A", info: { created: 1, captcha_type: "", ...(mode === "incomplete" ? { gt: "gt" } : {}) } }]);
    return true;
  });
  await flush(); expect(runs).toHaveLength(1); c.reset();
});
test("重复重试并发只刷新一次，排队任务不重复", async () => {
  const { c, runs } = setup(); c.sync([row("A"), row("B")]); await flush();
  let finish!: (ok: boolean) => void;
  const refresh = jest.fn(() => new Promise<boolean>((resolve) => { finish = resolve; }));
  const pending = c.retry("B", refresh); await c.retry("B", refresh);
  expect(refresh).toHaveBeenCalledTimes(1); finish(true); await pending;
  runs[0].resolve(); await flush(); expect(runs.map(r => r.account)).toEqual(["A", "B"]); c.reset();
});
test("账号移除和reset使当前与排队任务失效", async () => {
  const { c, runs } = setup(); c.sync([row("A"), row("B"), row("C")]); await flush();
  c.sync([row("B"), row("C")]); await flush(); expect(runs[0].signal?.aborted).toBe(true);
  c.reset(); runs[1].resolve(); await flush(); expect(runs.map(r => r.account)).toEqual(["A", "B"]);
});
test("挑战短暂消失后同一失败挑战恢复也不自动重弹", async () => {
  const { c, runs } = setup(); c.sync([row("A")]); await flush(); runs[0].reject(new Error("closed")); await flush();
  c.sync([{ account: "A", info: { created: 1, captcha_type: "" } }]);
  c.sync([row("A")]); await flush(); expect(runs).toHaveLength(1);
  await c.retry("A", async () => { c.sync([row("A")]); return true; }); await flush();
  expect(runs).toHaveLength(2); c.reset();
});
test("提交结束不创建结果观察计时器也不自动重放", async () => {
  jest.useFakeTimers(); const { c, runs } = setup(); c.sync([row("A")]); await flush(); runs[0].resolve(); await flush();
  expect(jest.getTimerCount()).toBe(0); jest.advanceTimersByTime(600_001);
  c.sync([row("A")]); await flush(); expect(runs).toHaveLength(1); c.reset();
});
