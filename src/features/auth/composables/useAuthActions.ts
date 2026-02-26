import type { Ref } from "vue";
import { ref } from "vue";
import { useRouter } from "vue-router";
import authClient from "@/shared/services/authClient";
import { setMsg } from "@/shared/utils/toast";
import { Type } from "@/shared/components/toast/enum";
import { buildGameAccount } from "@/shared/utils/account";
import { checkIsEmail, getEmailUsernameLength } from "@/shared/utils/regex";
import { useCaptcha } from "@/shared/composables/useCaptcha";
import { useUserStore } from "@/stores/useUserStore";
import {
  AuthModelType,
  type FindAccountParams,
  type ForgetParams,
  type LoginParams,
  type RegisterParams,
} from "./useAuthForm";

interface AuthActionOptions {
  modelType: Ref<AuthModelType>;
  loginParams: Ref<LoginParams>;
  forgetParams: Ref<ForgetParams>;
  regParams: Ref<RegisterParams>;
  findAccountParams: Ref<FindAccountParams>;
  agreeTerms: Ref<boolean>;
  findAccountRespData: Ref<string>;
}

export function useAuthActions(options: AuthActionOptions) {
  const {
    modelType,
    loginParams,
    forgetParams,
    regParams,
    findAccountParams,
    agreeTerms,
    findAccountRespData,
  } = options;

  const user = useUserStore();
  const router = useRouter();
  const captcha = useCaptcha();

  const isLoading = ref(false);
  const isSendCodingIsLoading = ref(false);
  const isFindAccountLoading = ref(false);

  const loginBtn = async () => {
    if (isLoading.value) return;
    isLoading.value = true;
    try {
      const res = await authClient.login(loginParams.value);
      if (res.data) {
        setMsg("登录成功", Type.Success);
        user.login(res.data.token);
        router.push("/dashboard");
        return;
      }
      setMsg(res.message, Type.Info);
    } finally {
      isLoading.value = false;
    }
  };

  const sendCode = async (email: string) => {
    if (isSendCodingIsLoading.value) return;
    if (!email) {
      setMsg("请填写邮箱", Type.Warning);
      return;
    }
    if (!checkIsEmail(email)) {
      setMsg("邮箱格式不正确", Type.Warning);
      return;
    }

    try {
      isSendCodingIsLoading.value = true;
      const resp = await authClient.sendCodeOnRegister({ email });
      if (resp.code === 0) {
        setMsg(resp.message || "发送失败", Type.Warning);
      } else {
        setMsg("发送成功", Type.Success);
      }
    } catch {
      setMsg("请刷新页面重试", Type.Warning);
    } finally {
      isSendCodingIsLoading.value = false;
    }
  };

  const regBtn = async () => {
    if (isLoading.value) return;
    if (!regParams.value.email || !regParams.value.password || !regParams.value.code) {
      setMsg("请填写完整信息", Type.Warning);
      return;
    }
    if (!agreeTerms.value) {
      setMsg("请阅读并同意用户协议", Type.Warning);
      return;
    }
    if (!checkIsEmail(regParams.value.email)) {
      setMsg("邮箱格式不正确", Type.Warning);
      return;
    }
    if (getEmailUsernameLength(regParams.value.email) > 20) {
      setMsg("邮箱用户名长度不能超过20个字符", Type.Warning);
      return;
    }
    if (getEmailUsernameLength(regParams.value.email) < 6) {
      setMsg("邮箱用户名长度不能少于6个字符", Type.Warning);
      return;
    }

    if (!window.idaks || !window.skadi) {
      setMsg("初始化失败，请刷新页面重试", Type.Warning);
      return;
    }

    isLoading.value = true;
    try {
      regParams.value.noise = window.idaks.join("");
      regParams.value.sign = window.skadi(
        regParams.value.email + "&" + regParams.value.password + "&" + regParams.value.noise
      );

      const res = await authClient.register(regParams.value);
      if (res.code === 0 || !res.data) {
        setMsg(res.message || "注册失败", Type.Warning);
        return;
      }

      setMsg("注册成功", Type.Success);
      user.login(res.data.token);
      router.push("/dashboard");
    } finally {
      isLoading.value = false;
    }
  };

  const resetPasswordBtn = async () => {
    if (isLoading.value) return;
    if (!forgetParams.value.email || !forgetParams.value.code || !forgetParams.value.newPasswd) {
      setMsg("请填写完整信息", Type.Warning);
      return;
    }
    if (!checkIsEmail(forgetParams.value.email)) {
      setMsg("邮箱格式不正确", Type.Warning);
      return;
    }

    isLoading.value = true;
    try {
      const res = await authClient.resetPassword(forgetParams.value);
      if (res.code === 0) {
        setMsg(res.message || "重置失败", Type.Warning);
        return;
      }
      setMsg("重置成功", Type.Success);
      modelType.value = AuthModelType.Login;
    } finally {
      isLoading.value = false;
    }
  };

  const handleFindAccountBtnOnClick = async () => {
    if (isFindAccountLoading.value) return;
    if (!findAccountParams.value.gameAccount) {
      setMsg("请填写账号", Type.Warning);
      return;
    }

    try {
      isFindAccountLoading.value = true;
      const account = buildGameAccount(
        findAccountParams.value.gameAccount,
        findAccountParams.value.platform
      );
      const resp = await captcha.findAccount(account);
      if (resp.code === 0) {
        setMsg(resp.message || "查询失败", Type.Warning);
      }
      if (resp.code === 1 && resp.data) {
        findAccountRespData.value = resp.data.account;
      }
    } catch {
      setMsg("请刷新页面重试", Type.Warning);
    } finally {
      isFindAccountLoading.value = false;
    }
  };

  return {
    isLoading,
    isSendCodingIsLoading,
    isFindAccountLoading,
    loginBtn,
    sendCode,
    regBtn,
    resetPasswordBtn,
    handleFindAccountBtnOnClick,
  };
}
