import {Type} from "../../components/toast/enmu";
import {setMsg} from "../common";

const captchaConfig = {
  config: {
    captchaId: "d8551513acc423d24401e9622cddd45c",
    product: "bind",
  },
  handler: (obj: any) => {},
};

const updateCaptchaHandler = (onSuccess: (geetestResult: string) => void) => {
  captchaConfig.handler = (obj: any) => {
    window.captchaObj = obj;
    obj.appendTo("#captcha").onSuccess(() => {
      const result: object = window.captchaObj.getValidate();
      if (!result) {
        setMsg("请完成验证", Type.Warning);
        return;
      }
      const resultStr = JSON.stringify(result);
      onSuccess(resultStr);
    });
  };
  window.initGeetest4(captchaConfig.config, captchaConfig.handler);
};

export default updateCaptchaHandler;