<template>
  <Docker />
  <div id="captcha" :class="{ 'h-0': true }">
    <Geetest />
  </div>
  <router-view v-slot="{ Component }">
    <keep-alive>
      <component :is="Component" />
    </keep-alive>
  </router-view>
  <BrowserInfo />
</template>
<script setup lang="ts">
import { onMounted } from "vue";
import Geetest from "./components/Geetest.vue";
import BrowserInfo from "./components/toast/BrowserInfo.vue";
import Docker from "./components/toast/Docker.vue";
import { loadAssets } from "./plugins/assets/assets";
import { isLarge, loadTheme } from "./plugins/common";
loadTheme()
loadAssets()
const page = () => {
  isLarge.value = document.documentElement.clientWidth >= 1024;
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}
onMounted(() => {
  page()
  window.onresize = page;
});
</script>