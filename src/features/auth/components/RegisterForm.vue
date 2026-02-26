<template>
  <div class="s-login-box">
    <div class="text-center">
      <h1 class="block text-4xl font-bold text-info">通行证注册</h1>
    </div>
    <div class="mt-5">
      <a class="btn btn-block btn-info btn-outline" @click="$emit('switch-login')"
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
            <button @click="onSendCode(regParams.email)" class="btn btn-info btn-sm w-24">
              <span v-if="isSendCodingIsLoading" class="loading loading-bars loading-md"></span>
              <span v-else>获取验证码</span>
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
            <input
              type="checkbox"
              class="checkbox checkbox-info"
              :checked="agreeTerms"
              @change="$emit('update:agreeTerms', ($event.target as HTMLInputElement).checked)"
            />
          </label>
        </div>
        <span class="text-base-content/40 text-center"
          >登录&注册有问题？点击查看
          <a href="/blog/FAQ" target="_blank" class="s-underline">常见问题</a></span
        >
        <a class="btn btn-block btn-info" @click="onRegister"
          ><span v-if="isLoading" class="loading loading-bars" />注册</a
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RegisterParams } from "@/features/auth/composables/useAuthForm";

defineProps<{
  regParams: RegisterParams;
  agreeTerms: boolean;
  isLoading: boolean;
  isSendCodingIsLoading: boolean;
  onSendCode: (email: string) => void;
  onRegister: () => void;
}>();

defineEmits<{
  (event: "switch-login"): void;
  (event: "update:agreeTerms", value: boolean): void;
}>();
</script>
