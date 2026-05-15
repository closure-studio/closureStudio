<template>
  <main :key="$route.fullPath" class="overflow-x-hidden h-screen w-full flex flex-col">
    <Header />
    <input id="drawer" v-model="isDrawerOpen" type="checkbox" class="drawer-toggle" />
    <div class="drawer-content flex-1 mx-4 mb-4">
      <router-view />
    </div>
    <div class="drawer-side z-50">
      <label for="drawer" class="drawer-overlay" />
      <div
        class="menu p-4 w-72 h-mobile bg-base-100 text-base-content flex flex-col flex-nowrap items-center"
      >
        <div class="hover:animate-spin avatar mt-6 mb-4">
          <div class="w-28 rounded-full">
            <img src="/assets/closure.ico" alt="closure" />
          </div>
        </div>
        <span class="text-3xl font-bold">可露希尔云平台</span>
        <div class="divider my-2" />
        <ul class="w-full text-lg space-y-2">
          <li v-for="item in navItems" :key="item.path">
            <router-link
              :to="item.path"
              :class="{ 'bg-info': isActive(item) }"
              @click="closeDrawer"
              >{{ item.name }}</router-link
            >
          </li>
        </ul>
        <div class="flex flex-1" />
        <button class="btn btn-info btn-block btn-outline" @click="logout">退出登录</button>
      </div>
    </div>
  </main>
</template>
<script setup lang="ts">
import { ROUTES } from "@/constants/app";
import { setMsg } from "@/utils/toast";
import { useGamesStore } from "@/stores/useGamesStore";
import { useUserStore } from "@/stores/useUserStore";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { Type } from "@/constants/ui";
import { canAccessSystemAdmin } from "@/utils/permission";
import Header from "./Header.vue";

const user = useUserStore();
const gamesStore = useGamesStore();
const router = useRouter();
const isDrawerOpen = ref(false);

interface NavItem {
  name: string;
  path: string;
}

const navItems = computed(() => {
  const items: NavItem[] = [ROUTES.HOME, ROUTES.DASHBOARD, ROUTES.REPLAY_HUB, ROUTES.PROFILE];
  if (canAccessSystemAdmin(user.info.permission)) {
    items.push(ROUTES.ADMIN);
  }
  return items;
});

const isActive = (item: NavItem) =>
  router.currentRoute.value.name === item.name || router.currentRoute.value.path === item.path;

const closeDrawer = () => {
  isDrawerOpen.value = false;
};

const logout = () => {
  gamesStore.$reset();
  user.logout();
  setMsg("已退出登录", Type.Success);
  window.location.reload();
};
</script>
