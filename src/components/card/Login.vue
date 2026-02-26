<template>
  <dialog id="login" class="modal">
    <Docker />
    <div class="modal-box shadow-lg max-w-md rounded-lg py-8">
      <div v-if="modelType == ModelType.Login" class="s-login-box">
        <div class="text-center">
          <h1 class="block text-4xl font-bold text-info">用户登录</h1>
        </div>
        <div class="mt-5">
          <a class="btn btn-block btn-info btn-outline" @click="modelType = ModelType.Register"
            >没有账号？点击注册！</a
          >
          <div class="divider">OR</div>
          <div class="grid gap-y-4">
            <div class="s-combo">
              <input
                placeholder="请输入您的邮箱"
                class="s-input peer focus:ring-info"
                v-model="loginParams.email"
                autocomplete="email"
              />
              <label class="s-label peer-focus:text-info">可露希尔通行证</label>
            </div>
            <div class="s-combo">
              <input
                class="s-input peer focus:ring-info"
                v-model="loginParams.password"
                type="password"
                autocomplete="current-password"
              />
              <label class="s-label peer-focus:text-info">密码</label>
            </div>

            <div class="form-control">
              <label class="label cursor-pointer">
                <span class="label-text">保存密码（请勿在公共设备上保存）</span>
                <input type="checkbox" class="checkbox checkbox-info" v-model="agreeTerms" />
              </label>
            </div>
            <span class="text-base-content/40 text-center"
              >登录&注册有问题？点击查看
              <a href="/blog/FAQ" target="_blank" class="s-underline">常见问题</a></span
            >
            <a class="btn btn-block btn-info" @click="loginBtn">
              <span v-if="isLoading" class="loading loading-bars"></span>登录</a
            >
            <a class="text-center underline" @click="modelType = ModelType.ForgetAccount"
              >忘记了通行证账号?</a
            >
            <a class="text-center underline" @click="modelType = ModelType.ForgetPassword"
              >忘记了通行证密码?</a
            >
          </div>
        </div>
      </div>
      <div v-else-if="modelType == ModelType.Register" class="s-login-box">
        <div class="text-center">
          <h1 class="block text-4xl font-bold text-info">通行证注册</h1>
        </div>
        <div class="mt-5">
          <a class="btn btn-block btn-info btn-outline" @click="modelType = ModelType.Login"
            >使用通行证登录</a
          >
          <div class="divider">OR</div>
          <div class="grid gap-y-4">
            <div class="s-combo">
              <input
                placeholder="请输入您的邮箱"
                class="s-input peer focus:ring-info"
                v-model="regParams.email"
                autocomplete="email"
              />
              <label class="s-label peer-focus:text-info">可露希尔通行证</label>
            </div>
            <div class="s-combo">
              <input
                class="s-input peer focus:ring-info"
                v-model="regParams.password"
                type="password"
                autocomplete="new-password"
              />
              <label class="s-label peer-focus:text-info">密码</label>
            </div>
            <div class="s-combo">
              <div class="flex space-x-2">
                <input class="s-input peer focus:ring-info" v-model="regParams.code" />
                <button @click="sendCode(regParams.email)" class="btn btn-info btn-sm w-24">
                  <span v-if="isSendCodingIsLoading" class="loading loading-bars loading-md"></span>
                  <span v-if="!isSendCodingIsLoading">获取验证码</span>
                </button>
              </div>

              <label class="s-label peer-focus:text-info">验证码</label>
            </div>
            <div class="form-control">
              <label class="label cursor-pointer">
                <span class="label-text"
                  >我已阅读理解可露希尔小卖部
                  <a href="/blog/Terms&Policies" target="_blank" class="s-underline">用户协议</a>
                </span>
                <input type="checkbox" class="checkbox checkbox-info" v-model="agreeTerms" />
              </label>
            </div>
            <span class="text-base-content/40 text-center"
              >登录&注册有问题？点击查看
              <a href="/blog/FAQ" target="_blank" class="s-underline">常见问题</a></span
            >
            <a class="btn btn-block btn-info" @click="regBtn"
              ><span v-if="isLoading" class="loading loading-bars" />注册</a
            >
          </div>
        </div>
      </div>
      <div v-else-if="modelType == ModelType.ForgetPassword" class="s-login-box">
        <div class="text-center">
          <h1 class="block text-4xl font-bold text-info">密码重置</h1>
        </div>
        <div class="mt-5">
          <a class="btn btn-block btn-info btn-outline" @click="modelType = ModelType.Login"
            >使用通行证登录</a
          >
          <div class="divider">OR</div>
          <div class="grid gap-y-4">
            <div class="s-combo">
              <input
                placeholder="请输入您的邮箱"
                class="s-input peer focus:ring-info"
                v-model="forgetParams.email"
              />
              <label class="s-label peer-focus:text-info">可露希尔通行证</label>
            </div>
            <div class="s-combo">
              <div class="flex space-x-2">
                <input class="s-input peer focus:ring-info" v-model="forgetParams.code" />
                <button @click="sendCode(forgetParams.email)" class="btn btn-info btn-sm w-24">
                  <span v-if="isSendCodingIsLoading" class="loading loading-bars loading-md"></span>
                  <span v-if="!isSendCodingIsLoading">获取验证码</span>
                </button>
              </div>
              <label class="s-label peer-focus:text-info">验证码</label>
            </div>
            <div class="s-combo">
              <input
                class="s-input peer focus:ring-info"
                v-model="forgetParams.newPasswd"
                type="password"
                autocomplete="new-password"
              />
              <label class="s-label peer-focus:text-info">新密码</label>
            </div>
            <a class="btn btn-block btn-info" @click="resetPasswordBtn"
              ><span v-if="isLoading" class="loading loading-bars"></span>重置!</a
            >
          </div>
        </div>
      </div>
      <div v-else-if="modelType == ModelType.ForgetAccount" class="s-login-box">
        <div class="text-center">
          <h1 class="block text-4xl font-bold text-info">找回邮箱</h1>
        </div>
        <div class="mt-5">
          <a class="btn btn-block btn-info btn-outline" @click="modelType = ModelType.Login"
            >使用通行证登录</a
          >
          <div class="divider">OR</div>
          <div class="grid gap-y-4">
            <div class="s-combo">
              <input
                placeholder="请输入您的游戏"
                class="s-input peer focus:ring-info"
                v-model="findAccountParams.gameAccount"
              />
              <label class="s-label peer-focus:text-info">托管游戏账号</label>
            </div>
            <div v-if="!findAccountRespData" class="s-combo">
              <div class="w-full mb-3">
                <label class="label cursor-pointer">
                  <span class="text-xl">官服（安卓 / IOS）</span>
                  <input
                    type="radio"
                    :value="1"
                    v-model="findAccountParams.platform"
                    id="official"
                    class="radio checked:bg-red-500"
                  />
                </label>
                <label class="label cursor-pointer">
                  <span class="text-xl">BiliBili服</span>
                  <input
                    type="radio"
                    :value="2"
                    v-model="findAccountParams.platform"
                    id="bili"
                    class="radio checked:bg-blue-500"
                  />
                </label>
              </div>
              <div class="divider my-2">服务器选择</div>
            </div>
            <div
              v-if="findAccountRespData"
              role="alert"
              class="rounded border-s-4 border-warning bg-warning/10 p-4"
            >
              通行证账号: {{ findAccountRespData }}
            </div>
            <a class="btn btn-block btn-info" @click="handleFindAccountBtnOnClick"
              ><span v-if="isFindAccountLoading" class="loading loading-bars" />查找!</a
            >
          </div>
        </div>
      </div>
    </div>

    <form method="dialog" class="modal-backdrop">
      <button>close</button>
    </form>
  </dialog>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import authClient from "@/shared/services/authClient";
import registryClient from "@/shared/services/registryClient";
import { startCaptcha } from "../../plugins/captcha/captcha";
import { setMsg } from "@/shared/utils/toast";
import { userStore } from "../../store/user";
import { checkIsEmail, getEmailUsernameLength } from "@/shared/utils/regex";
import Docker from "@/shared/components/toast/Docker.vue";
import { Type } from "@/shared/components/toast/enum";

enum ModelType {
  Login,
  Register,
  ForgetPassword,
  ForgetAccount,
}
const modelType = ref<ModelType>(ModelType.Login);
const loginParams = ref({
  email: "",
  password: "",
});
const forgetParams = ref({
  email: "",
  code: "",
  newPasswd: "",
});
const regParams = ref({
  email: "",
  password: "",
  code: "",
  noise: "",
  sign: "",
});
const findAccountParams = ref({
  gameAccount: "",
  platform: 1,
});
const user = userStore();
const router = useRouter();
const isLoading = ref(false);
const agreeTerms = ref(false);
const isSendCodingIsLoading = ref(false);
const isFindAccountLoading = ref(false);
const findAccountRespData = ref("");
const loginBtn = () => {
  if (isLoading.value) return;
  isLoading.value = true;
  authClient
    .login(loginParams.value)
    .then((res) => {
      if (res.data) {
        setMsg("登录成功", Type.Success);
        user.login(res.data.token);
        router.push("/dashboard");
        return;
      }
      setMsg(res.message, Type.Info);
    })
    .finally(() => {
      isLoading.value = false;
    });
};

const sendCode = async (email: string) => {
  if (isSendCodingIsLoading.value) return;
  if (email === "") {
    setMsg("请填写邮箱", Type.Warning);
    return;
  }
  if (!checkIsEmail(email)) {
    setMsg("邮箱格式不正确", Type.Warning);
    return;
  }
  try {
    isSendCodingIsLoading.value = true;
    const parm = {
      email: email,
    };
    const resp = await authClient.sendCodeOnRegister(parm);
    if (resp.code === 0) {
      setMsg(resp.message || "发送失败", Type.Warning);
    } else {
      setMsg("发送成功", Type.Success);
    }
  } catch (e) {
    console.error(e);
    setMsg("请刷新页面重试", Type.Warning);
  } finally {
    isSendCodingIsLoading.value = false;
  }
};

const regBtn = () => {
  if (isLoading.value) return;
  // check is email format
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
  isLoading.value = true;
  // @ts-ignore
  regParams.value.noise = window.idaks?.join("");
  // @ts-ignore
  regParams.value.sign = window.skadi(
    regParams.value.email + "&" + regParams.value.password + "&" + regParams.value.noise
  );
  authClient
    .register(regParams.value)
    .then((res) => {
      if (res.code === 0 || !res.data) {
        setMsg(res.message || "注册失败", Type.Warning);
        return;
      }
      setMsg("注册成功", Type.Success);
      user.login(res.data.token);
      router.push("/dashboard");
    })
    .finally(() => {
      isLoading.value = false;
    });
};
const resetPasswordBtn = () => {
  if (isLoading.value) return;
  if (!forgetParams.value.email || !forgetParams.value.code || !forgetParams.value.newPasswd) {
    setMsg("请填写完整信息", Type.Warning);
    return;
  }
  if (!checkIsEmail(forgetParams.value.email)) {
    setMsg("邮箱格式不正确", Type.Warning);
    return;
  }
  authClient
    .resetPassword(forgetParams.value)
    .then((res) => {
      if (res.code === 0) {
        setMsg(res.message || "重置失败", Type.Warning);
        return;
      }
      setMsg("重置成功", Type.Success);
      modelType.value = ModelType.Login;
    })
    .finally(() => {
      isLoading.value = false;
    });
};

const handleFindAccountBtnOnClick = async () => {
  if (isFindAccountLoading.value) return;
  if (findAccountParams.value.gameAccount === "") {
    setMsg("请填写账号", Type.Warning);
    return;
  }
  try {
    isFindAccountLoading.value = true;
    const gameAccount = findAccountParams.value.gameAccount;
    const gamePlatform = findAccountParams.value.platform;
    const resp = await startCaptcha(FindAccountWithCaptcha(gameAccount, gamePlatform));
    if (resp.code === 0) {
      setMsg(resp.message || "查询失败", Type.Warning);
    }
    if (resp.code === 1 && resp.data) {
      findAccountRespData.value = resp.data.account;
    }
  } catch (error) {
    console.error(error);
    setMsg("请刷新页面重试", Type.Warning);
  } finally {
    isFindAccountLoading.value = false;
  }
};

const FindAccountWithCaptcha = (gameAccount: string, platform: number) => {
  let account = "";
  if (platform === 1) {
    // 官服
    account = "G" + gameAccount;
  }
  if (platform === 2) {
    // B站服
    account = "B" + gameAccount;
  }
  return async (captchaToken: string) => {
    return await registryClient.doFindAccount(account, captchaToken);
  };
};
</script>
