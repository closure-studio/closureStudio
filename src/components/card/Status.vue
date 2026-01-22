<template>
  <div class="my-5 bg-info/5 shadow-md px-4 py-5 flex flex-col relative rounded-lg">
    <span class="font-bold text-2xl">欢迎来到可露希尔线上零售店</span>
    <div class="mt-8">
      <div class="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 font-bold text-xl md:text-2xl z-10 relative">
        <span>当前版本：{{ version }} <span class="text-sm opacity-60 font-normal">(居然还能跑)</span></span>
        <div class="flex items-center gap-2 cursor-pointer group w-fit" @click="refreshVersion">
          <span>最新版本：</span>
          <span v-if="isLoading" class="loading loading-dots loading-md text-info"></span>
          <span v-else class="text-info group-hover:underline decoration-wavy decoration-2 underline-offset-4">{{
            latestVersion }}</span>
          <span v-if="!isLoading"
            class="text-sm opacity-60 font-normal group-hover:text-info transition-colors">(点我看看新货)</span>
        </div>
      </div>
      <img
        class="absolute right-0 bottom-0 w-28 md:w-36 opacity-10 md:opacity-50 rounded-t-full rounded-bl-full pointer-events-none"
        src="/assets/closure.ico" alt="start">
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { checkVersion } from '../../checkVersion';

const version = import.meta.env.VITE_APP_VERSION;
const latestVersion = ref<number | string>('?');
const isLoading = ref(false);

const refreshVersion = async () => {
  if (isLoading.value) return;
  isLoading.value = true;
  try {
    const v = await checkVersion();
    latestVersion.value = v;
  } catch (e) {
    latestVersion.value = '获取失败';
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  refreshVersion();
});
</script>