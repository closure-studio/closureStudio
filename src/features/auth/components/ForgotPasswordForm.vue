<template>
  <div class="s-login-box">
    <div class="text-center">
      <h1 class="block text-4xl font-bold text-info">密码重置</h1>
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
            v-model="forgetParams.email"
          />
          <label class="s-label peer-focus:text-info">可露希尔通行证</label>
        </div>
        <div class="s-combo">
          <div class="flex space-x-2">
            <input class="s-input peer focus:ring-info" v-model="forgetParams.code" />
            <button @click="onSendCode(forgetParams.email)" class="btn btn-info btn-sm w-24">
              <span v-if="isSendCodingIsLoading" class="loading loading-bars loading-md"></span>
              <span v-else>获取验证码</span>
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
        <a class="btn btn-block btn-info" @click="onReset"
          ><span v-if="isLoading" class="loading loading-bars"></span>重置!</a
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ForgetParams } from "@/features/auth/composables/useAuthForm";

defineProps<{
  forgetParams: ForgetParams;
  isLoading: boolean;
  isSendCodingIsLoading: boolean;
  onSendCode: (email: string) => void;
  onReset: () => void;
}>();

defineEmits<{
  (event: "switch-login"): void;
}>();
</script>
