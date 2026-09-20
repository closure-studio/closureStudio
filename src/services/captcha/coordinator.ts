import type { ApiGameCaptchaInfo } from "@/shared/types/api";
import { CaptchaError, type CaptchaOptions } from "./sdkLifecycle";

export interface CaptchaSnapshot { account: string; info: ApiGameCaptchaInfo }
interface Task {
  account: string;
  key: string;
  info: ApiGameCaptchaInfo;
  controller: AbortController;
  finished: boolean;
  available: boolean;
}
const keyOf = (info: ApiGameCaptchaInfo) => JSON.stringify([
  info.created, info.gt, info.challenge, info.geetestId, info.riskType, info.captcha_type,
]);
const complete = (info: ApiGameCaptchaInfo) => Boolean(info.challenge?.trim() && (info.geetestId?.trim() || info.gt?.trim()));

export function createCaptchaCoordinator(
  run: (account: string, info: ApiGameCaptchaInfo, options: CaptchaOptions) => Promise<void>,
) {
  const tasks = new Map<string, Task>();
  let queue: Task[] = [];
  let active: Task | undefined;
  const retrying = new Set<string>();
  const valid = (task: Task) => tasks.get(task.account) === task;
  const dispose = (task: Task) => {
    task.controller.abort();
    queue = queue.filter((item) => item !== task);
  };
  const pump = () => {
    if (active) return;
    const task = queue.shift();
    if (!task) return;
    if (!valid(task) || task.controller.signal.aborted) { pump(); return; }
    active = task;
    void Promise.resolve().then(() => {
      if (!valid(task) || task.controller.signal.aborted) throw new CaptchaError("cancelled", "挑战已失效");
      return run(task.account, task.info, { signal: task.controller.signal });
    }).catch(() => {
      // 失败反馈由调用方提供；保留挑战身份，避免轮询反复弹窗。
    }).finally(() => {
      task.finished = true;
      if (active === task) active = undefined;
      pump();
    });
  };
  const enqueue = (row: CaptchaSnapshot) => {
    const task: Task = {
      account: row.account, info: { ...row.info }, key: keyOf(row.info),
      controller: new AbortController(), finished: !complete(row.info), available: complete(row.info),
    };
    tasks.set(row.account, task);
    if (!task.finished) queue.push(task);
  };
  const sync = (rows: CaptchaSnapshot[]) => {
    const accounts = new Set(rows.map((row) => row.account));
    for (const [account, task] of tasks) {
      if (!accounts.has(account)) { tasks.delete(account); dispose(task); }
    }
    for (const row of rows) {
      const task = tasks.get(row.account);
      const hasChallenge = Boolean(row.info.challenge || row.info.geetestId || row.info.gt);
      if (task) {
        task.available = complete(row.info);
        if (!hasChallenge) {
          dispose(task);
          task.finished = true;
          continue;
        }
        if (task.key === keyOf(row.info)) continue;
        tasks.delete(row.account); dispose(task);
      }
      if (hasChallenge) enqueue(row);
    }
    pump();
  };
  const retry = async (account: string, refresh: () => Promise<boolean>) => {
    if (retrying.has(account)) return;
    retrying.add(account);
    const before = tasks.get(account);
    const wasFinished = before?.finished;
    try {
      if (!await refresh()) return false;
      const task = tasks.get(account);
      // 新挑战已由sync入队；即使它在GET返回前结束，也不得再次入队。
      if (!wasFinished || !task || task !== before || !task.available) return;
      tasks.delete(account); dispose(task);
      enqueue({ account, info: task.info }); pump();
      return true;
    } finally { retrying.delete(account); }
  };
  const reset = () => {
    const old = [...tasks.values()]; tasks.clear(); queue = [];
    for (const task of old) dispose(task);
  };
  return { sync, retry, reset };
}
