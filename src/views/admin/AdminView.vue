<template>
  <div class="container w-full md:max-w-4xl mx-auto">
    <div class="flex items-start">
      <ul
        class="hidden md:block menu w-12 md:w-[10rem] rounded-box shadow-md mr-4 space-y-2 font-bold s-pro"
      >
        <li v-for="item in menu" :key="item.to">
          <router-link
            :to="item.to"
            :class="{ active: route.path == item.to }"
            class="flex items-center space-x-2"
          >
            <Icon :icon="item.icon" class="w-6 h-6" />
            <span class="hidden md:block">{{ item.name }}</span>
          </router-link>
        </li>
      </ul>

      <div class="grow shadow-md py-1 px-5 rounded-box admin-swipe-area">
        <div class="md:hidden mb-3">
          <MobileSwipeMenuHeader
            :active-title="activeMenu?.name"
            :active-index="currentMenuIndex"
            :items="menu"
            axis="x"
            swipe-text="左右滑动"
          />
        </div>

        <component :is="activeComponent" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-swipe-area {
  touch-action: pan-y;
}
</style>

<script setup lang="ts">
import MobileSwipeMenuHeader from "@/shared/components/ui/MobileSwipeMenuHeader.vue";
import { ROUTES } from "@/constants/app";
import SystemConfig from "@/components/admin/SystemConfig.vue";
import { Icon } from "@iconify/vue";
import { computed, ref } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

const menu = [
  {
    key: "systemConfig",
    name: "服务器配置",
    icon: "mdi-tune-variant",
    to: ROUTES.ADMIN.path,
    component: SystemConfig,
  },
];

const activeKey = ref(menu[0].key);

const currentMenuIndex = computed(() => {
  const index = menu.findIndex((item) => item.key === activeKey.value || item.to === route.path);
  return index === -1 ? 0 : index;
});

const activeMenu = computed(() => menu[currentMenuIndex.value]);
const activeComponent = computed(() => activeMenu.value.component);
</script>
