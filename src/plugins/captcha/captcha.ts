import { Type } from "../../components/toast/enum";
import apiClient from "../axios/apiClient";
import { setMsg } from "../common";

const googleRecaptchaSiteKey = "6LfrMU0mAAAAADoo9vRBTLwrt5mU0HvykuR3l8uN";

const captchaConfig = {
  config: {
    captchaId: "3d50c20b712aaf5c4390a663f1912941",
    product: "bind",
  },
  handler: (obj: any) => {},
};
export async function startCaptcha<T>(
  myFunc: (captchaToken: string) => Promise<Service.RequestResult<T>>
): Promise<Service.RequestResult<T>> {
  try {
    if (!window.grecaptcha && !window.initGeetest4) {
      setMsg(
        "Google reCaptcha 和 Geetest 都加载失败了，麻烦你发个工单吧",
        Type.Warning
      );
      throw new Error("人机验证加载失败");
    }
    if (window.grecaptcha) {
      const recaptchaResult = await startRecaptcha(myFunc);
      if (recaptchaResult.code === -1100) {
        setMsg("reCaptcha人机验证失败", Type.Warning);
        setMsg("Geetest人机验证开始", Type.Info);
        const geetestResult = await startGeeTest(myFunc);
        if (geetestResult.code === -1100) {
          throw new Error("Geetest人机验证失败");
        }
        return geetestResult;
      }
      return recaptchaResult;
    }
    // @ts-ignore
    if (window["initGeetest"] === undefined) {
      setMsg("不知道为什么, Geetest加载失败。麻烦你发个工单吧", Type.Warning);
      throw new Error("Geetest加载失败");
    }
    return await startGeeTest(myFunc);
  } catch (error) {
    setMsg("人机验证大失败", Type.Error);
    throw error;
  }
}

async function startRecaptcha<T>(
  myFunc: (captchaToken: string) => Promise<Service.RequestResult<T>>
): Promise<Service.RequestResult<T>> {
  const token = await window.grecaptcha.execute(googleRecaptchaSiteKey, {
    action: "submit",
  });
  if (!token) {
    throw new Error("reCAPTCHA token is empty");
  }
  return await myFunc(token);
}

async function startGeeTest<T>(
  myFunc: (captchaToken: string) => Promise<Service.RequestResult<T>>
): Promise<Service.RequestResult<T>> {
  // 创建一个新的 Promise 来控制整个 Geetest 流程
  return new Promise<Service.RequestResult<T>>((resolve, reject) => {
    let myFuncResult: Service.RequestResult<T> | null = null; // 存储 myFunc 的执行结果

    // 初始化 Geetest 验证组件
    window.initGeetest4(captchaConfig.config, (obj: any) => {
      window.captchaObj = obj;
      obj.appendTo("#captcha");

      // 当验证码组件准备就绪时显示验证码
      obj.onReady(() => {
        window.captchaObj.showCaptcha();
      });

      // 当用户完成验证时处理结果
      obj.onSuccess(async () => {
        const result = window.captchaObj.getValidate();
        if (result) {
          const geeTestResultStr = JSON.stringify(result); // 将验证结果序列化为字符串
          try {
            myFuncResult = await myFunc(geeTestResultStr); // 调用传入的异步函数，并等待其执行完毕
            resolve(myFuncResult); // 执行成功时，直接 resolve
          } catch (e) {
            reject(new Error(`执行 myFunc 时出错: ${(e as Error).message}`)); // 异常时 reject 错误信息
          } finally {
            obj.destroy(); // 无论如何，最终都销毁验证码组件
          }
        } else {
          setMsg("请完成验证", Type.Warning);
          reject(new Error("请完成验证")); // 验证结果为空时，直接 reject
        }
      });

      // 监听验证失败
      obj.onError(() => {
        reject(new Error("验证码加载失败，请稍后再试")); // 验证码加载失败时，直接 reject 错误信息
      });
    });
  });
}

export const arknigthsGameCaptcha = (
  account: string,
  data: ApiGame.CaptchaInfo
) => {
  // @ts-ignore
  if (window["initGeetest"] === undefined) {
    setMsg("不知道为什么，Geetest加载失败。麻烦你发个工单吧", Type.Warning);
    return;
  }
  setMsg("加载验证码中...", Type.Info);
  // @ts-ignore
  window.initGeetest(
    {
      gt: data.gt,
      challenge: data.challenge,
      offline: false,
      product: "bind",
      width: "300px",
      https: true,
    },
    (captchaObj: any) => {
      captchaObj.onReady(() => {
        captchaObj.verify();
      });
      captchaObj.onSuccess(() => {
        const validate = captchaObj.getValidate();
        setMsg("提交成功，正在登录...", Type.Success);
        apiClient
          .doUpdateCaptcha(account, {
            challenge: data.challenge,
            geetest_challenge: validate.geetest_challenge,
            geetest_seccode: validate.geetest_seccode,
            geetest_validate: validate.geetest_validate,
          })
          .then();
        captchaObj.destroy(); // 这里是销毁实例，处理完逻辑最终销毁
      });
      captchaObj.onError(() => {
        setMsg("验证码加载失败", Type.Warning);
      });
    }
  );
};
