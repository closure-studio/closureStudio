<template>
  <main class="overflow-x-hidden h-screen w-full flex flex-col">
    <Header />
    <input id="drawer" type="checkbox" class="drawer-toggle" />
    <div class="drawer-content flex-1 mx-4 mb-4">
      <router-view />
    </div>
    <div class="drawer-side z-50">
      <label for="drawer" class="drawer-overlay" />
      <div class="menu p-4 w-72 h-mobile bg-base-100 text-base-content flex flex-col flex-nowrap items-center">
        <div class="hover:animate-spin avatar mt-6 mb-4">
          <div class="w-28 rounded-full">
            <img src="/assets/closure.ico" alt="closure" />
          </div>
        </div>
        <span class="text-3xl font-bold">可露希尔云平台</span>
        <div class="divider my-2" />
        <ul class="w-full text-lg space-y-2">
          <li><router-link to="/" :class="{ 'bg-info': router.currentRoute.value.name === '首页' }">首页</router-link></li>
          <li><router-link to="/dashboard">托管账号</router-link></li>
          <li><router-link :to="dynamicPath"
              :class="{ 'bg-info': router.currentRoute.value.name === '账号安全' }">账号设置</router-link></li>
          <li><router-link to="/admin"
              :class="{ 'bg-info': router.currentRoute.value.name === '系统管理' }">系统管理</router-link></li>
        </ul>
        <div class="flex flex-1" />
        <button class="btn btn-info btn-block btn-outline" @click="logout">退出登录</button>
      </div>
    </div>
  </main>
</template>
<script setup lang="ts">
import Header from "./Header.vue";
import { userStore } from "../../store/user";
import { useRouter } from "vue-router";
import { setMsg } from "../../plugins/common";
import { Type } from "../toast/enum";
import { computed } from "vue";
const user = userStore()
const router = useRouter()
const dynamicPath = computed(() => {
  return user.isVerify ? '/profile/account' : '/profile/smsVerify';
});
const logout = () => {
  user.logout();
  setMsg('已退出登录', Type.Success)
  window.location.reload();
}
</script>
