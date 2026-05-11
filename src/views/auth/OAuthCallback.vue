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
import authClient from "@/shared/services/authClient";
import oauthClient from "@/shared/services/oauthClient";
import { setMsg } from "@/shared/utils/toast";
import { Type } from "@/constants/ui";
import { ROUTES } from "@/constants/app";

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
    // 从 URL 获取 code 和 state
    // 用户拒绝授权时 Linux.do 返回 error 参数
    const oauthError = route.query.error as string;
    if (oauthError) {
      error.value = oauthError === "access_denied" ? "您已取消授权" : `授权失败：${oauthError}`;
      isLoading.value = false;
      return;
    }

    const code = route.query.code as string;
    const state = route.query.state as string;

    if (!code || !state) {
      error.value = "缺少必要的授权参数";
      isLoading.value = false;
      return;
    }

    // 验证 state
    const oauthState = oauthClient.getAndValidateState(state);
    if (!oauthState) {
      error.value = "授权验证失败，请重试";
      isLoading.value = false;
      return;
    }

    // 调用后端 API 交换 token
    const response = await authClient.loginWithLinuxDo({
      code,
      redirect_uri: oauthState.redirectUri,
    });

    if (response.data && response.data.token) {
      // 登录成功
      setMsg("登录成功", Type.Success);
      userStore.login(response.data.token);
      router.push({ name: ROUTES.DASHBOARD.name });
    } else {
      error.value = response.message || "登录失败，请重试";
      isLoading.value = false;
    }
  } catch (err: unknown) {
    console.error("OAuth callback error:", err);
    error.value = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "登录失败，请重试";
    isLoading.value = false;
  }
});
</script>
