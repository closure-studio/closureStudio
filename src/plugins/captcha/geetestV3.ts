import { Type } from "../../components/toast/enum";
import apiClient from "../axios/apiClient";
import { setMsg } from "../common";

// GT3 验证处理函数
export function handleGT3Captcha(
  account: string,
  data: ApiGame.CaptchaInfo,
  resolve: (value: void | PromiseLike<void>) => void,
  reject: (reason?: any) => void,
) {
  // 检查 Geetest v3 是否加载
  if (typeof window.initGeetest !== "function") {
    const errorMsg = "Geetest v3 加载失败。请检查网络连接或稍后重试";
    console.error(
      "[Captcha] initGeetest is not a function:",
      typeof window.initGeetest,
    );
    setMsg(errorMsg, Type.Warning);
    reject(new Error(errorMsg));
    return;
  }

  try {
    window.initGeetest(
      {
        gt: data.gt!,
        challenge: data.challenge!,
        offline: false,
        product: "bind",
        width: "300px",
        https: true,
      },
      (captchaObj: any) => {
        if (!captchaObj) {
          const errorMsg = "验证码对象初始化失败";
          console.error("[Captcha] captchaObj is null or undefined");
          setMsg(errorMsg, Type.Warning);
          reject(new Error(errorMsg));
          return;
        }

        captchaObj.onReady(() => {
          try {
            console.log("[Captcha GT3] Captcha ready, starting verification");
            captchaObj.verify();
          } catch (error) {
            console.error("[Captcha GT3] Error during verify:", error);
            setMsg("验证码启动失败", Type.Error);
            reject(error);
          }
        });

        captchaObj.onSuccess(async () => {
          try {
            const validate = captchaObj.getValidate();
            if (!validate) {
              throw new Error("验证结果为空");
            }

            console.log("[Captcha GT3] Validation successful, submitting...");
            setMsg("提交成功，正在登录...", Type.Success);

            await apiClient.doUpdateCaptcha(account, {
              challenge: data.challenge!,
              geetest_challenge: validate.geetest_challenge,
              geetest_seccode: validate.geetest_seccode,
              geetest_validate: validate.geetest_validate,
            });

            captchaObj.destroy();
            console.log("[Captcha GT3] Captcha completed successfully");
            resolve();
          } catch (error) {
            console.error("[Captcha GT3] Error during submission:", error);
            setMsg("验证提交失败: " + (error as Error).message, Type.Error);
            if (captchaObj && typeof captchaObj.destroy === "function") {
              captchaObj.destroy();
            }
            reject(error);
          }
        });

        captchaObj.onError((error: any) => {
          const errorMsg = "验证码加载失败V3";
          console.error("[Captcha GT3] Geetest error:", error);
          setMsg(errorMsg, Type.Warning);
          if (captchaObj && typeof captchaObj.destroy === "function") {
            captchaObj.destroy();
          }
          reject(new Error(errorMsg));
        });
      },
    );
  } catch (error) {
    console.error("[Captcha GT3] Error initializing Geetest:", error);
    setMsg("初始化验证码失败: " + (error as Error).message, Type.Error);
    reject(error);
  }
}
