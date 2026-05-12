<template>
  <Docker />
  <CaptchaMount />
  <router-view v-slot="{ Component }">
    <keep-alive>
      <component :is="Component" />
    </keep-alive>
  </router-view>
  <BrowserInfo />
</template>
<script setup lang="ts">
import { onMounted } from "vue";
import CaptchaMount from "@/shared/components/captcha/CaptchaMount.vue";
import BrowserInfo from "@/shared/components/toast/BrowserInfo.vue";
import Docker from "@/shared/components/toast/Docker.vue";
import { loadAssets } from "@/services/assets";
import { isLarge } from "@/utils/toast";
import { useTheme } from "@/shared/composables/useTheme";
const { initTheme } = useTheme();
initTheme();
loadAssets();
const page = () => {
  isLarge.value = document.documentElement.clientWidth >= 1024;
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
};
onMounted(() => {
  page();
  window.onresize = page;
});
</script>
