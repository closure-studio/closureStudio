import { Type } from "../../components/toast/enum";
import apiClient from "../axios/apiClient";
import { setMsg } from "../common";

// GT4 验证处理函数
export function handleGT4Captcha(
  account: string,
  data: ApiGame.CaptchaInfo,
  resolve: (value: void | PromiseLike<void>) => void,
  reject: (reason?: any) => void,
) {
  // 检查 Geetest v4 是否加载
  if (typeof window.initGeetest4 !== "function") {
    const errorMsg = "Geetest v4 加载失败。请检查网络连接或稍后重试";
    console.error(
      "[Captcha] initGeetest4 is not a function:",
      typeof window.initGeetest4,
    );
    setMsg(errorMsg, Type.Warning);
    reject(new Error(errorMsg));
    return;
  }

  try {
    window.initGeetest4(
      {
        captchaId: data.geetestId!,
        product: "bind",
        riskType: data.riskType?.split('|')[0] || "",
      },
      (captchaObj: any) => {
        if (!captchaObj) {
          const errorMsg = "验证码对象初始化失败";
          console.error("[Captcha] captchaObj is null or undefined");
          setMsg(errorMsg, Type.Warning);
          reject(new Error(errorMsg));
          return;
        }

        // 将验证码挂载到页面（可能需要一个容器元素）
        // 注意：GT4 可能需要不同的挂载方式，这里假设使用 appendTo
        // TODO: 确认 GT4 的正确挂载方式
        captchaObj.appendTo("#captcha");

        captchaObj.onReady(() => {
          try {
            console.log("[Captcha GT4] Captcha ready, starting verification");
            // GT4 可能自动显示，也可能需要手动调用
            if (typeof captchaObj.showCaptcha === "function") {
              captchaObj.showCaptcha();
            }
          } catch (error) {
            console.error("[Captcha GT4] Error during ready:", error);
            setMsg("验证码启动失败", Type.Error);
            reject(error);
          }
        });

        captchaObj.onSuccess(async () => {
          try {
            // ⚠️ 注意：以下代码基于 GT4 API 推测，可能需要根据实际 API 调整
            // GT4 的返回格式可能与 GT3 不同
            const validate = captchaObj.getValidate();
            if (!validate) {
              throw new Error("验证结果为空");
            }

            console.log("[Captcha GT4] Validation successful, submitting...");
            console.log(
              "[Captcha GT4] Validate result (未确认格式):",
              validate,
            );
            setMsg("提交成功，正在登录...", Type.Success);
            // 需要根据后端 API 要求调整
            await apiClient.doUpdateCaptcha(account, {
              challenge: data.challenge || "",
              lot_number: validate.lot_number || "",
              pass_token: validate.pass_token || "",
              gen_time: validate.gen_time || "",
              captcha_output: validate.captcha_output || "",
            });

            captchaObj.destroy();
            console.log("[Captcha GT4] Captcha completed successfully");
            resolve();
          } catch (error) {
            console.error("[Captcha GT4] Error during submission:", error);
            setMsg("验证提交失败: " + (error as Error).message, Type.Error);
            if (captchaObj && typeof captchaObj.destroy === "function") {
              captchaObj.destroy();
            }
            reject(error);
          }
        });

        captchaObj.onError((error: any) => {
          const errorMsg = "验证码加载失败V4";
          console.error("[Captcha GT4] Geetest error:", error);
          setMsg(errorMsg, Type.Warning);
          if (captchaObj && typeof captchaObj.destroy === "function") {
            captchaObj.destroy();
          }
          reject(new Error(errorMsg));
        });
      },
    );
  } catch (error) {
    console.error("[Captcha GT4] Error initializing Geetest:", error);
    setMsg("初始化验证码失败: " + (error as Error).message, Type.Error);
    reject(error);
  }
}
