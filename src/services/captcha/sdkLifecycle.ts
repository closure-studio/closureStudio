export type CaptchaPhase = "initializing" | "awaiting-user" | "submitting";
export interface CaptchaOptions {
  signal?: AbortSignal;
  onPhase?: (phase: CaptchaPhase) => void;
}
export class CaptchaError extends Error {
  constructor(public readonly kind: "cancelled" | "timed-out" | "error", message: string) {
    super(message);
    this.name = "CaptchaError";
  }
}
export interface CaptchaSdk {
  onReady: (callback: () => void) => unknown;
  onSuccess: (callback: () => void) => unknown;
  onError: (callback: (error: unknown) => void) => unknown;
  onClose: (callback: () => void) => unknown;
  getValidate: () => unknown;
  destroy?: () => void;
}
export function validationFields(value: unknown, keys: readonly string[]): Record<string, string> {
  if (!value || typeof value !== "object") throw new CaptchaError("error", "验证结果不完整，请重新验证");
  const record = value as Record<string, unknown>;
  const result: Record<string, string> = {};
  for (const key of keys) {
    if (typeof record[key] !== "string" || !record[key].trim()) {
      throw new CaptchaError("error", "验证结果不完整，请重新验证");
    }
    result[key] = record[key];
  }
  return result;
}
export const gt3Fields = ["geetest_challenge", "geetest_validate", "geetest_seccode"];
export const gt4Fields = ["captcha_id", "lot_number", "pass_token", "gen_time", "captcha_output"];

// 所有事件只结算一次；销毁可能触发关闭事件，先失效再销毁。
export function runSdk<T, S extends CaptchaSdk>(
  initialize: (callback: (sdk: S) => void) => void,
  show: (sdk: S) => void,
  submit: (value: unknown) => Promise<T>,
  options: CaptchaOptions = {},
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const origin = typeof document !== "undefined" ? document.activeElement as HTMLElement | null : null;
    let sdk: S | undefined;
    let settled = false;
    let submitting = false;
    let ready = false;
    let timer: ReturnType<typeof setTimeout>;
    const destroy = (object: S) => { try { object.destroy?.(); } catch { /* 清理失败仍须释放队列。 */ } };
    const finish = (error?: unknown, result?: T) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      options.signal?.removeEventListener("abort", abort);
      if (sdk) destroy(sdk);
      if (origin?.isConnected) origin.focus?.({ preventScroll: true });
      if (error) reject(error); else resolve(result as T);
    };
    const abort = () => finish(new CaptchaError("cancelled", submitting
      ? "已停止本地等待，服务器结果未知，请重新读取状态" : "已取消验证"));
    const deadline = (ms: number, message: string) => {
      clearTimeout(timer);
      timer = setTimeout(() => finish(new CaptchaError("timed-out", message)), ms);
    };
    options.signal?.addEventListener("abort", abort, { once: true });
    if (options.signal?.aborted) { abort(); return; }
    options.onPhase?.("initializing");
    deadline(15_000, "验证码初始化超时，请重试");
    try {
      initialize((object) => {
        if (settled || sdk) { if (object && object !== sdk) destroy(object); return; }
        sdk = object;
        try {
          if (!sdk) throw new CaptchaError("error", "验证码初始化失败");
          sdk.onClose(() => { if (!submitting) abort(); });
          sdk.onError(() => { if (!submitting) finish(new CaptchaError("error", "验证码加载失败，请重试")); });
          sdk.onSuccess(() => {
            if (settled || submitting) return;
            submitting = true;
            deadline(30_000, "提交等待超时，服务器结果未知，请重新读取状态");
            try {
              const value = object.getValidate();
              options.onPhase?.("submitting");
              Promise.resolve(submit(value)).then((result) => finish(undefined, result), finish);
            } catch (error) { finish(error); }
          });
          sdk.onReady(() => {
            if (settled || submitting || ready) return;
            ready = true;
            deadline(300_000, "人工验证等待超时，可手动重试");
            options.onPhase?.("awaiting-user");
            try { show(object); } catch { finish(new CaptchaError("error", "验证码展示失败")); }
          });
        } catch (error) { finish(error); }
      });
    } catch (error) { finish(error); }
  });
}
