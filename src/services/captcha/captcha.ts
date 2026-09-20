import type { RequestResult } from "@/shared/types/service";
import type { ApiGameCaptchaInfo } from "@/shared/types/api";
import { handleGT3Captcha } from "./geetestV3";
import { handleGT4Captcha } from "./geetestV4";
import { captchaDisplayLease } from "./displayLease";
import { CaptchaError, runSdk, validationFields, gt4Fields, type CaptchaOptions, type CaptchaSdk } from "./sdkLifecycle";

const googleRecaptchaSiteKey = "6LfrMU0mAAAAADoo9vRBTLwrt5mU0HvykuR3l8uN";
const captchaId = "3d50c20b712aaf5c4390a663f1912941";

export function startCaptcha<T>(myFunc: (token: string) => Promise<RequestResult<T>>): Promise<RequestResult<T>> {
  return captchaDisplayLease.run(async () => {
    if (window.grecaptcha) {
      const token = await window.grecaptcha.execute(googleRecaptchaSiteKey, { action: "submit" });
      if (!token) throw new Error("reCAPTCHA token is empty");
      const response = await myFunc(token);
      if (response.code !== -1100) return response;
    }
    if (typeof window.initGeetest4 !== "function") throw new Error("Geetest v4 加载失败，请重试");
    const response = await runSdk<RequestResult<T>, CaptchaSdk & { showCaptcha: () => void }>(
      (callback) => window.initGeetest4({ captchaId, product: "bind" }, callback),
      (sdk) => sdk.showCaptcha(),
      (value) => myFunc(JSON.stringify(validationFields(value, gt4Fields))),
    );
    if (response.code === -1100) throw new Error("Geetest人机验证失败");
    return response;
  });
}

export const arknightsGameCaptcha = (account: string, data: ApiGameCaptchaInfo, options: CaptchaOptions = {}): Promise<void> =>
  captchaDisplayLease.run(() => new Promise<void>((resolve, reject) => {
    if (data.geetestId) handleGT4Captcha(account, data, resolve, reject, options);
    else if (data.gt && data.challenge) handleGT3Captcha(account, data, resolve, reject, options);
    else reject(new CaptchaError("error", "挑战资料不完整，请重新读取状态"));
  }), options.signal);
