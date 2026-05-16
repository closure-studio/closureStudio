<template>
  <div class="container w-full md:max-w-4xl mx-auto">
    <div class="flex items-start">
      <ul
        class="hidden md:block menu w-12 md:w-[10rem] rounded-box shadow-md mr-4 space-y-2 font-bold s-pro"
      >
        <li v-for="item in menu" :key="item.key">
          <a
            :class="{ active: activeKey === item.key }"
            class="flex items-center space-x-2"
            @click="switchTo(item.key)"
          >
            <Icon :icon="item.icon" class="w-6 h-6" />
            <span class="hidden md:block">{{ item.name }}</span>
          </a>
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

        <transition :name="transitionName">
          <component :is="activeComponent" :key="activeKey" />
        </transition>
      </div>
    </div>
  </div>
</template>

<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active,
.slide-left-fade-enter-active,
.slide-left-fade-leave-active,
.slide-right-fade-enter-active,
.slide-right-fade-leave-active {
  transition:
    transform 0.42s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.32s ease;
}

.slide-fade-enter-from,
.slide-left-fade-enter-from {
  transform: translateX(2.5rem);
  opacity: 0;
}

.slide-fade-leave-to,
.slide-left-fade-leave-to {
  transform: translateX(-2.5rem);
  opacity: 0;
}

.slide-right-fade-enter-from {
  transform: translateX(-2.5rem);
  opacity: 0;
}

.slide-right-fade-leave-to {
  transform: translateX(2.5rem);
  opacity: 0;
}

.admin-swipe-area {
  touch-action: pan-y;
}
</style>

<script setup lang="ts">
import MobileSwipeMenuHeader from "@/shared/components/ui/MobileSwipeMenuHeader.vue";
import { useSwipeNavigation } from "@/shared/composables/useSwipeNavigation";
import SystemConfig from "@/components/admin/SystemConfig.vue";
import UserManagement from "@/components/admin/UserManagement.vue";
import { Icon } from "@iconify/vue";
import { computed, ref } from "vue";

type AdminMenuKey = "systemConfig" | "userManagement";

const menu: { key: AdminMenuKey; name: string; icon: string; component: unknown }[] = [
  {
    key: "systemConfig",
    name: "后台设置",
    icon: "mdi-tune-variant",
    component: SystemConfig,
  },
  {
    key: "userManagement",
    name: "用户管理",
    icon: "mdi-account-cog",
    component: UserManagement,
  },
];

const activeKey = ref<AdminMenuKey>("systemConfig");
const transitionName = ref("slide-fade");

const currentMenuIndex = computed(() => {
  const index = menu.findIndex((item) => item.key === activeKey.value);
  return index === -1 ? 0 : index;
});

const activeMenu = computed(() => menu[currentMenuIndex.value]);
const activeComponent = computed(() => activeMenu.value.component);

const switchTo = (key: AdminMenuKey, direction?: "left" | "right") => {
  if (key === activeKey.value) return;
  transitionName.value = direction
    ? direction === "left"
      ? "slide-left-fade"
      : "slide-right-fade"
    : "slide-fade";
  activeKey.value = key;
};

const navigateBySwipe = (direction: "left" | "right") => {
  const offset = direction === "left" ? 1 : -1;
  const nextIndex = (currentMenuIndex.value + offset + menu.length) % menu.length;
  switchTo(menu[nextIndex].key, direction);
};

useSwipeNavigation({
  axis: "x",
  onSwipe: navigateBySwipe,
});
</script>
