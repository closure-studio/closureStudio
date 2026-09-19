import { ref } from "vue";
import type { RequestResult } from "@/shared/types/service";
import type { ApiGameCaptchaInfo } from "@/shared/types/api";
import { handleGT3Captcha } from "./geetestV3";
import { handleGT4Captcha } from "./geetestV4";
import { captchaDisplayLease } from "./displayLease";
import { CaptchaError, runSdk, validationFields, gt4Fields, type CaptchaOptions, type CaptchaSdk } from "./sdkLifecycle";

const googleRecaptchaSiteKey = "6LfrMU0mAAAAADoo9vRBTLwrt5mU0HvykuR3l8uN";
const captchaId = "3d50c20b712aaf5c4390a663f1912941";
const operations = new Set<AbortController>();
export const operationCaptcha = ref(false);
let currentOperation: AbortController | undefined;
export function cancelOperationCaptcha() { currentOperation?.abort(); }
export function resetCaptchaOperations() { for (const controller of operations) controller.abort(); }

// 不重放超时或取消的业务请求；服务端可能已经执行，只停止本地等待。
function bounded<T>(work: () => Promise<T>, signal: AbortSignal, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    let timer: ReturnType<typeof setTimeout> | undefined = undefined;
    const abort = () => finish(new CaptchaError("cancelled", "已停止本地等待，服务器结果未知，请重新读取状态"));
    const finish = (error?: unknown, result?: T) => {
      clearTimeout(timer); signal.removeEventListener("abort", abort);
      if (error) reject(error); else resolve(result as T);
    };
    signal.addEventListener("abort", abort, { once: true });
    if (signal.aborted) { abort(); return; }
    timer = setTimeout(() => finish(new CaptchaError("timed-out", "等待超时，结果未知，请重新读取状态")), ms);
    try { Promise.resolve(work()).then((result) => finish(undefined, result), finish); } catch (error) { finish(error); }
  });
}
export async function startCaptcha<T>(myFunc: (token: string) => Promise<RequestResult<T>>): Promise<RequestResult<T>> {
  const controller = new AbortController();
  operations.add(controller);
  try {
    return await captchaDisplayLease.run(async () => {
      currentOperation = controller; operationCaptcha.value = true;
      try {
        const execute = (token: string) => bounded(() => myFunc(token), controller.signal, 30_000);
        if (window.grecaptcha) {
          const token = await bounded(() => window.grecaptcha.execute(googleRecaptchaSiteKey, { action: "submit" }), controller.signal, 15_000);
          if (!token) throw new Error("reCAPTCHA token is empty");
          const response = await execute(token);
          if (response.code !== -1100) return response;
        }
        if (controller.signal.aborted) throw new CaptchaError("cancelled", "已取消验证");
        if (typeof window.initGeetest4 !== "function") throw new Error("Geetest v4 加载失败，请重试");
        const response = await runSdk<RequestResult<T>, CaptchaSdk & { showCaptcha: () => void }>(
          (callback) => window.initGeetest4({ captchaId, product: "bind" }, callback),
          (sdk) => sdk.showCaptcha(),
          (value) => execute(JSON.stringify(validationFields(value, gt4Fields))),
          { signal: controller.signal },
        );
        if (response.code === -1100) throw new Error("Geetest人机验证失败");
        return response;
      } finally { currentOperation = undefined; operationCaptcha.value = false; }
    }, controller.signal);
  } finally { operations.delete(controller); }
}

export const arknightsGameCaptcha = (account: string, data: ApiGameCaptchaInfo, options: CaptchaOptions = {}): Promise<void> =>
  captchaDisplayLease.run(() => new Promise<void>((resolve, reject) => {
    if (data.geetestId) handleGT4Captcha(account, data, resolve, reject, options);
    else if (data.gt && data.challenge) handleGT3Captcha(account, data, resolve, reject, options);
    else reject(new CaptchaError("error", "挑战资料不完整，请重新读取状态"));
  }), options.signal);
