export interface CaptchaOptions {
  // 仅用于挑战替换、账号移除及队列重置，不提供用户取消入口。
  signal?: AbortSignal;
}
export class CaptchaError extends Error {
  constructor(public readonly kind: "cancelled" | "error", message: string) {
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
    const destroy = (object: S) => { try { object.destroy?.(); } catch { /* 清理失败仍须释放队列。 */ } };
    const finish = (error?: unknown, result?: T) => {
      if (settled) return;
      settled = true;
      options.signal?.removeEventListener("abort", abort);
      if (sdk) destroy(sdk);
      if (origin?.isConnected) origin.focus?.({ preventScroll: true });
      if (error) reject(error); else resolve(result as T);
    };
    const abort = () => finish(new CaptchaError("cancelled", submitting
      ? "已停止本地等待，服务器结果未知，请重新读取状态" : "已取消验证"));
    options.signal?.addEventListener("abort", abort, { once: true });
    if (options.signal?.aborted) { abort(); return; }
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
            try {
              const value = object.getValidate();
              Promise.resolve(submit(value)).then((result) => finish(undefined, result), finish);
            } catch (error) { finish(error); }
          });
          sdk.onReady(() => {
            if (settled || submitting || ready) return;
            ready = true;
            try { show(object); } catch { finish(new CaptchaError("error", "验证码展示失败")); }
          });
        } catch (error) { finish(error); }
      });
    } catch (error) { finish(error); }
  });
}
