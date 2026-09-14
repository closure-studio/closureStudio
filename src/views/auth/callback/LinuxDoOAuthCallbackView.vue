<template>
  <div class="flex items-center justify-center min-h-screen">
    <div class="text-center">
      <div v-if="isLoading">
        <span class="loading loading-spinner loading-lg text-info"></span>
        <p class="mt-4 text-lg">正在登录...</p>
      </div>
      <div v-else-if="error" class="max-w-md">
        <div class="alert alert-error">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{{ error }}</span>
        </div>
        <a class="btn btn-info mt-4" @click="goToHome">返回首页</a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useUserStore } from "@/stores/useUserStore";
import authClient from "@/services/authClient";
import oauthClient from "@/services/oauthClient";
import { setMsg } from "@/utils/toast";
import { Type } from "@/constants/ui";
import { ROUTES } from "@/constants/app";
import { handleLinuxDoOAuthCallback } from "./linuxDoOAuthCallback";

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const isLoading = ref(true);
const error = ref("");

const goToHome = () => {
  router.push({ name: ROUTES.HOME.name });
};

onMounted(async () => {
  try {
    const outcome = await handleLinuxDoOAuthCallback(route.query, {
      discardCodeVerifier: () => oauthClient.discardCodeVerifier(),
      exchange: (input) => authClient.loginWithLinuxDo(input),
      login: (token) => userStore.login(token),
      replaceDashboard: async () => {
        await router.replace({ name: ROUTES.DASHBOARD.name });
      },
      takeCodeVerifier: () => oauthClient.takeCodeVerifier(),
    });

    if (outcome.kind === "success") {
      setMsg("登录成功", Type.Success);
      return;
    }
    error.value = outcome.kind === "invalid-params"
      ? "缺少或包含无效的授权参数"
      : outcome.kind === "missing-verifier"
        ? "授权验证失败，请重试"
        : outcome.kind === "cancelled"
          ? "您已取消授权"
          : outcome.kind === "provider-failed"
            ? "Linux DO 授权失败，请重试"
            : outcome.message || "登录失败，请重试";
    isLoading.value = false;
  } catch {
    error.value = "登录失败，请重试";
    isLoading.value = false;
  }
});
</script>
