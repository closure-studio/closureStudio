import type { ApiGameCaptchaInfo } from "@/shared/types/api";
import apiClient from "@/services/apiClient";
import { API_RESPONSE_CODE } from "@/constants/api";
import { CaptchaError, runSdk, validationFields, gt4Fields, type CaptchaOptions, type CaptchaSdk } from "./sdkLifecycle";

interface GeetestV4Obj extends CaptchaSdk { showCaptcha: () => void }
export function handleGT4Captcha(
  account: string,
  data: ApiGameCaptchaInfo,
  resolve: (value: void | PromiseLike<void>) => void,
  reject: (reason?: unknown) => void,
  options: CaptchaOptions = {},
) {
  if (typeof window.initGeetest4 !== "function" || !data.geetestId || !data.challenge) {
    reject(new Error("Geetest v4 未加载或挑战资料不完整"));
    return;
  }
  void runSdk<void, GeetestV4Obj>(
    (callback) => window.initGeetest4({
      captchaId: data.geetestId!, product: "bind", riskType: data.riskType,
    }, callback),
    (sdk) => sdk.showCaptcha(),
    async (value) => {
      const response = await apiClient.doUpdateCaptcha(account, {
        challenge: data.challenge!, ...validationFields(value, gt4Fields),
      }, { signal: options.signal, timeout: 30_000 }).catch(() => {
        throw new CaptchaError("error", "提交未能确认，服务器结果未知，请重新读取状态");
      });
      if (response.code !== API_RESPONSE_CODE.SUCCESS) throw new Error("验证码提交未被接受，请重新读取状态后重试");
    }, options,
  ).then(resolve, reject);
}
