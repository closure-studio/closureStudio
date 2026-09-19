import { ref } from "vue";
import type { ApiGameCaptchaInfo } from "@/shared/types/api";
import { CaptchaError, type CaptchaOptions, type CaptchaPhase } from "./sdkLifecycle";

type Phase = CaptchaPhase | "queued" | "awaiting-status" | "cancelled" | "error" | "timed-out" | "unconfirmed" | "server-running" | "server-failed";
export interface CaptchaState { phase: Phase; message: string; serverCode: number }
export interface CaptchaSnapshot { account: string; info: ApiGameCaptchaInfo; code: number }
interface Task {
  account: string; key: string; info: ApiGameCaptchaInfo; controller: AbortController;
  submitted?: number; timer?: ReturnType<typeof setTimeout>; available: boolean;
}
const messages: Record<Phase, string> = {
  queued: "等待其他验证完成", initializing: "正在初始化验证码", "awaiting-user": "请完成人工验证",
  submitting: "正在提交验证", "awaiting-status": "验证已提交，等待服务器状态",
  cancelled: "已取消本地验证", error: "验证失败，请重新读取后重试", "timed-out": "验证等待超时",
  unconfirmed: "等待确认超时，结果仍未知，可重新读取状态", "server-running": "服务器报告运行中",
  "server-failed": "服务器报告登录失败或游戏错误",
};
const keyOf = (info: ApiGameCaptchaInfo) => JSON.stringify([
  info.created, info.gt, info.challenge, info.geetestId, info.riskType, info.captcha_type,
]);
export function createCaptchaCoordinator(
  run: (account: string, info: ApiGameCaptchaInfo, options: CaptchaOptions) => Promise<void>,
) {
  const states = ref<Record<string, CaptchaState>>({});
  const tasks = new Map<string, Task>();
  let queue: Task[] = [];
  let active: Task | undefined;
  let revision = 0;
  let epoch = 0;
  const retrying = new Set<string>();
  const valid = (task: Task) => tasks.get(task.account) === task;
  const state = (task: Task, phase: Phase, message = messages[phase]) => {
    if (valid(task)) states.value[task.account] = { ...states.value[task.account], phase, message };
  };
  const dispose = (task: Task) => {
    clearTimeout(task.timer);
    task.controller.abort();
    queue = queue.filter((item) => item !== task);
  };
  const pump = () => {
    if (active) return;
    const task = queue.shift();
    if (!task) return;
    if (!valid(task) || task.controller.signal.aborted) { pump(); return; }
    active = task;
    state(task, "initializing");
    void Promise.resolve().then(() => {
      if (!valid(task) || task.controller.signal.aborted) throw new CaptchaError("cancelled", "已取消验证");
      return run(task.account, task.info, {
        signal: task.controller.signal,
        onPhase: (phase) => { if (!task.controller.signal.aborted) state(task, phase); },
      });
    }).then(() => {
      if (!valid(task) || task.controller.signal.aborted) return;
      task.submitted = ++revision;
      state(task, "awaiting-status");
      task.timer = setTimeout(() => state(task, "unconfirmed"), 60_000);
    }, (error: unknown) => {
      if (!valid(task) || task.controller.signal.aborted) return;
      state(task, error instanceof CaptchaError ? error.kind : "error",
        error instanceof CaptchaError ? error.message : messages.error);
    }).finally(() => { if (active === task) active = undefined; pump(); });
  };
  const enqueue = (row: CaptchaSnapshot) => {
    const task: Task = { account: row.account, info: { ...row.info }, key: keyOf(row.info), controller: new AbortController(), available: true };
    tasks.set(row.account, task);
    states.value[row.account] = { phase: "queued", message: messages.queued, serverCode: row.code };
    if (!row.info.challenge?.trim() || !(row.info.geetestId?.trim() || row.info.gt?.trim())) {
      state(task, "error", "挑战资料不完整，请重新读取服务器状态"); return;
    }
    queue.push(task);
  };
  const sync = (rows: CaptchaSnapshot[], readRevision?: number) => {
    const accounts = new Set(rows.map((row) => row.account));
    for (const [account, task] of tasks) {
      if (!accounts.has(account)) { tasks.delete(account); dispose(task); delete states.value[account]; }
    }
    for (const row of rows) {
      const task = tasks.get(row.account);
      const hasChallenge = Boolean(row.info.challenge || row.info.geetestId || row.info.gt);
      if (task) {
        task.available = hasChallenge;
        states.value[row.account].serverCode = row.code;
        if (task.submitted !== undefined && readRevision !== undefined && readRevision >= task.submitted) {
          if (row.code === 2 || row.code === -1 || row.code === 3) {
            clearTimeout(task.timer);
            state(task, row.code === 2 ? "server-running" : "server-failed");
          }
        }
        if (!hasChallenge) {
          if (task.submitted === undefined && !task.controller.signal.aborted) {
            dispose(task); state(task, "cancelled", "服务器已撤回挑战，请重新读取状态");
          }
          continue;
        }
        if (task.key === keyOf(row.info)) continue;
        tasks.delete(row.account); dispose(task);
      }
      if (hasChallenge) enqueue(row);
    }
    pump();
  };
  const cancel = (account: string) => {
    const task = tasks.get(account);
    if (!task || task.submitted !== undefined) return;
    const submitting = states.value[account]?.phase === "submitting";
    dispose(task);
    state(task, "cancelled", submitting ? "已停止本地等待，服务器结果未知，请重新读取状态" : messages.cancelled);
  };
  const retry = async (account: string, refresh: () => Promise<boolean>) => {
    if (retrying.has(account)) return;
    retrying.add(account);
    const generation = epoch;
    const before = tasks.get(account);
    try {
      if (!await refresh()) return false;
      if (epoch !== generation) return;
      const task = tasks.get(account);
      if (!task || task !== before || !task.available) return;
      if (["queued", "initializing", "awaiting-user", "submitting", "awaiting-status", "server-running"].includes(states.value[account].phase)) return;
      // 只复用刚刚刷新确认的挑战字段，绝不复用SDK输出。
      tasks.delete(account); dispose(task);
      enqueue({ account, info: task.info, code: states.value[account].serverCode }); pump();
      return true;
    } finally { retrying.delete(account); }
  };
  const reset = () => {
    epoch++; revision++;
    const old = [...tasks.values()]; tasks.clear(); queue = [];
    for (const task of old) dispose(task);
    states.value = {}; retrying.clear();
  };
  return { states, sync, cancel, retry, reset, readBarrier: () => revision };
}
