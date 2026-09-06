jest.mock("@/services/apiClient", () => ({
  __esModule: true,
  default: { doUpdateCaptcha: jest.fn() },
}));
jest.mock("@/utils/toast", () => ({ setMsg: jest.fn() }));

import apiClient from "@/services/apiClient";
import { setMsg } from "@/utils/toast";
import { Type } from "@/constants/ui";
import { handleGT3Captcha } from "./geetestV3";
import { handleGT4Captcha } from "./geetestV4";

describe.each([handleGT3Captcha, handleGT4Captcha])(
  "game captcha submission %p",
  (handler) => {
    let onSuccess: () => Promise<void>;
    const captchaObj = {
      onReady: jest.fn(),
      onError: jest.fn(),
      onSuccess: (callback: () => Promise<void>) => {
        onSuccess = callback;
      },
      appendTo: jest.fn(),
      destroy: jest.fn(),
      getValidate: () => ({
        geetest_challenge: "challenge",
        geetest_validate: "valid",
      }),
    };

    beforeEach(() => {
      jest.clearAllMocks();
      jest.spyOn(console, "log").mockImplementation(() => {});
      jest.spyOn(console, "error").mockImplementation(() => {});
      const init = (
        _config: unknown,
        callback: (obj: typeof captchaObj) => void,
      ) => callback(captchaObj);
      Object.defineProperty(globalThis, "window", {
        configurable: true,
        value: { initGeetest: init, initGeetest4: init },
      });
    });

    afterEach(() => {
      Reflect.deleteProperty(globalThis, "window");
      jest.restoreAllMocks();
    });

    test.each([0, 1])(
      "code=%i 决定成功或失败，完成后释放验证码",
      async (code) => {
        jest
          .mocked(apiClient.doUpdateCaptcha)
          .mockResolvedValue({
            code,
            data: null,
            message: "duplicate challenge",
          });
        const resolve = jest.fn();
        const reject = jest.fn();
        handler(
          "G123",
          {
            challenge: "challenge",
            gt: "gt",
            geetestId: "gt4",
            created: 1,
            captcha_type: "",
          },
          resolve,
          reject,
        );
        await onSuccess();
        expect(apiClient.doUpdateCaptcha).toHaveBeenCalledWith(
          "G123",
          expect.objectContaining({ challenge: "challenge" }),
        );
        expect(captchaObj.destroy).toHaveBeenCalledTimes(1);
        if (code === 1) {
          expect(resolve).toHaveBeenCalledTimes(1);
          expect(reject).not.toHaveBeenCalled();
          expect(setMsg).toHaveBeenCalledWith(
            "提交成功，正在登录...",
            Type.Success,
          );
        } else {
          expect(resolve).not.toHaveBeenCalled();
          expect(reject).toHaveBeenCalledWith(new Error("duplicate challenge"));
          expect(setMsg).not.toHaveBeenCalledWith(
            expect.anything(),
            Type.Success,
          );
        }
      },
    );
  },
);
