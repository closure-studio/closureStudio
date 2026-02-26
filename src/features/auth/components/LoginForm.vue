<template>
  <div class="s-login-box">
    <div class="text-center">
      <h1 class="block text-4xl font-bold text-info">用户登录</h1>
    </div>
    <div class="mt-5">
      <a class="btn btn-block btn-info btn-outline" @click="$emit('switch-register')"
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
        <a class="btn btn-block btn-info" @click="onLogin">
          <span v-if="isLoading" class="loading loading-bars"></span>登录</a
        >
        <a class="text-center underline" @click="$emit('switch-forget-account')"
          >忘记了通行证账号?</a
        >
        <a class="text-center underline" @click="$emit('switch-forget-password')"
          >忘记了通行证密码?</a
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LoginParams } from "@/features/auth/composables/useAuthForm";

defineProps<{
  loginParams: LoginParams;
  agreeTerms: boolean;
  isLoading: boolean;
  onLogin: () => void;
}>();

defineEmits<{
  (event: "switch-register"): void;
  (event: "switch-forget-account"): void;
  (event: "switch-forget-password"): void;
  (event: "update:agreeTerms", value: boolean): void;
}>();
</script>
