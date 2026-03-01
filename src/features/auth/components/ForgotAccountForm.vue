<template>
  <div class="s-login-box">
    <div class="text-center">
      <h1 class="block text-4xl font-bold text-info">找回邮箱</h1>
    </div>
    <div class="mt-5">
      <a class="btn btn-block btn-info btn-outline" @click="$emit('switch-login')"
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
        <a class="btn btn-block btn-info" @click="onFindAccount"
          ><span v-if="isFindAccountLoading" class="loading loading-bars" />查找!</a
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FindAccountParams } from "@/features/auth/composables/useAuthForm";

defineProps<{
  findAccountParams: FindAccountParams;
  findAccountRespData: string;
  isFindAccountLoading: boolean;
  onFindAccount: () => void;
}>();

defineEmits<{
  (event: "switch-login"): void;
}>();
</script>
