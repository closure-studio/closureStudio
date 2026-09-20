import type { ApiGameCaptchaInfo } from "@/shared/types/api";
import apiClient from "@/services/apiClient";
import { API_RESPONSE_CODE } from "@/constants/api";
import { CaptchaError, runSdk, validationFields, gt3Fields, type CaptchaOptions, type CaptchaSdk } from "./sdkLifecycle";

interface GeetestV3Obj extends CaptchaSdk { verify: () => void }
export function handleGT3Captcha(
  account: string,
  data: ApiGameCaptchaInfo,
  resolve: (value: void | PromiseLike<void>) => void,
  reject: (reason?: unknown) => void,
  options: CaptchaOptions = {},
) {
  if (typeof window.initGeetest !== "function" || !data.gt || !data.challenge) {
    reject(new Error("Geetest v3 未加载或挑战资料不完整"));
    return;
  }
  void runSdk<void, GeetestV3Obj>(
    (callback) => window.initGeetest({
      gt: data.gt!, challenge: data.challenge!, offline: false,
      product: "bind", width: "300px", https: true,
    }, callback),
    (sdk) => sdk.verify(),
    async (value) => {
      const response = await apiClient.doUpdateCaptcha(account, {
        challenge: data.challenge!, ...validationFields(value, gt3Fields),
      }).catch(() => {
        throw new CaptchaError("error", "提交未能确认，服务器结果未知，请重新读取状态");
      });
      if (response.code !== API_RESPONSE_CODE.SUCCESS) throw new Error("验证码提交未被接受，请重新读取状态后重试");
    }, options,
  ).then(resolve, reject);
}
