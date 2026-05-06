<template>
  <div class="container w-full md:max-w-8xl mx-auto">
    <div class="flex items-start">
      <ul
        class="hidden md:block menu w-[12rem] shrink-0 rounded-box shadow-md mr-4 space-y-2 font-bold s-pro"
      >
        <li v-for="item in menuItems" :key="item.key">
          <a
            :class="{ active: currentKey === item.key }"
            class="flex items-center space-x-2"
            @click="switchTo(item.key)"
          >
            <Icon :icon="item.icon" class="w-6 h-6" />
            <span class="hidden md:block">{{ item.name }}</span>
          </a>
        </li>
      </ul>

      <div class="grow min-w-0 overflow-hidden py-1 px-1 md:px-5 replay-swipe-area">
        <div class="md:hidden mb-3">
          <MobileSwipeMenuHeader
            :active-title="activeItem?.name"
            :active-index="currentIndex"
            :items="menuItems"
            axis="x"
            swipe-text="左右滑动"
          />
        </div>

        <transition :name="transitionName">
          <component :is="activeComponent" :key="currentKey" />
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

.replay-swipe-area {
  touch-action: pan-y;
}
</style>

<script setup lang="ts">
import ReplayBroadcast from "@/features/replay/components/ReplayBroadcast.vue";
import ReplayHub from "@/features/replay/components/ReplayHub.vue";
import ReplayMine from "@/features/replay/components/ReplayMine.vue";
import MobileSwipeMenuHeader from "@/shared/components/ui/MobileSwipeMenuHeader.vue";
import { useSwipeNavigation } from "@/shared/composables/useSwipeNavigation";
import { Icon } from "@iconify/vue";
import { computed, ref } from "vue";

type MenuKey = "hub" | "mine" | "share";

const menuItems: { key: MenuKey; name: string; icon: string }[] = [
  { key: "hub", name: "录像中心", icon: "mdi-television-play" },
  { key: "share", name: "我要分享", icon: "mdi-share-variant-outline" },
  { key: "mine", name: "我的录像", icon: "mdi-video-outline" },
];

const componentMap: Record<MenuKey, unknown> = {
  hub: ReplayHub,
  mine: ReplayMine,
  share: ReplayBroadcast,
};

const currentKey = ref<MenuKey>("hub");
const transitionName = ref("slide-fade");

const currentIndex = computed(() => menuItems.findIndex((item) => item.key === currentKey.value));

const activeItem = computed(() => menuItems[currentIndex.value]);
const activeComponent = computed(() => componentMap[currentKey.value]);

const switchTo = (key: MenuKey, direction?: "left" | "right") => {
  if (key === currentKey.value) return;
  if (direction) {
    transitionName.value = direction === "left" ? "slide-left-fade" : "slide-right-fade";
  } else {
    transitionName.value = "slide-fade";
  }
  currentKey.value = key;
};

const navigateBySwipe = (direction: "left" | "right") => {
  const offset = direction === "left" ? 1 : -1;
  const nextIndex = (currentIndex.value + offset + menuItems.length) % menuItems.length;
  switchTo(menuItems[nextIndex].key, direction);
};

useSwipeNavigation({
  axis: "x",
  onSwipe: navigateBySwipe,
});
</script>
