<template>
  <div class="container w-full md:max-w-8xl mx-auto">
    <div class="flex items-start">
      <ul class="hidden md:block menu w-[12rem] shrink-0 rounded-box shadow-md mr-4 space-y-2 font-bold s-pro">
        <li v-for="item in menuItems" :key="item.key">
          <a :class="{ active: currentKey === item.key }" class="flex items-center space-x-2"
            @click="switchTo(item.key)">
            <Icon :icon="item.icon" class="w-6 h-6" />
            <span class="hidden md:block">{{ item.name }}</span>
          </a>
        </li>
      </ul>

      <div class="grow min-w-0 overflow-hidden py-1 px-5 replay-swipe-area">
        <div class="md:hidden mb-3">
          <div class="mobile-menu-header">
            <span class="mobile-menu-title">{{ activeItem?.name }}</span>
          </div>
          <div class="mt-2.5 flex items-center justify-center gap-2">
            <span v-for="(item, index) in menuItems" :key="item.key"
              class="h-1.5 rounded-full transition-all duration-300"
              :class="index === currentIndex ? 'w-5 bg-info' : 'w-2 bg-base-content/20'" />
          </div>
          <div class="mt-1.5 text-center text-xs text-base-content/55 swipe-hint">↑↓ 滑动切换</div>
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
.slide-up-fade-enter-active,
.slide-up-fade-leave-active,
.slide-down-fade-enter-active,
.slide-down-fade-leave-active {
  transition:
    transform 0.42s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.32s ease;
}

.slide-fade-enter-from,
.slide-up-fade-enter-from {
  transform: translateY(2.5rem);
  opacity: 0;
}

.slide-fade-leave-to,
.slide-up-fade-leave-to {
  transform: translateY(-2.5rem);
  opacity: 0;
}

.slide-down-fade-enter-from {
  transform: translateY(-2.5rem);
  opacity: 0;
}

.slide-down-fade-leave-to {
  transform: translateY(2.5rem);
  opacity: 0;
}

.replay-swipe-area {
  touch-action: pan-y;
}

.mobile-menu-header {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 0.55rem;
  padding: 0.1rem 0.2rem;
}

.mobile-menu-title {
  font-size: 1.08rem;
  font-weight: 700;
  letter-spacing: 0.01em;
  color: color-mix(in oklab, var(--color-base-content) 94%, transparent);
}

.swipe-hint {
  animation: swipeHintFloat 1.8s ease-in-out infinite;
}

@keyframes swipeHintFloat {

  0%,
  100% {
    transform: translateY(0);
    opacity: 0.65;
  }

  50% {
    transform: translateY(-0.2rem);
    opacity: 1;
  }
}
</style>

<script setup lang="ts">
import ReplayHub from "@/features/replay/components/ReplayHub.vue";
import ReplayMine from "@/features/replay/components/ReplayMine.vue";
import ReplayShare from "@/features/replay/components/ReplayShare.vue";
import { Icon } from "@iconify/vue";
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

type MenuKey = "hub" | "share" | "mine";

const menuItems: { key: MenuKey; name: string; icon: string }[] = [
  { key: "hub", name: "录像中心", icon: "mdi-television-play" },
  { key: "share", name: "分享录像", icon: "mdi-share-variant" },
  { key: "mine", name: "我的录像", icon: "mdi-video-outline" },
];

const componentMap: Record<MenuKey, unknown> = {
  hub: ReplayHub,
  share: ReplayShare,
  mine: ReplayMine,
};

const currentKey = ref<MenuKey>("hub");
const transitionName = ref("slide-fade");
const touchStartY = ref<number | null>(null);
const touchStartX = ref<number | null>(null);
const touchStartTarget = ref<EventTarget | null>(null);
const previousHtmlOverscrollBehaviorY = ref("");
const previousBodyOverscrollBehaviorY = ref("");

const SWIPE_THRESHOLD = 40;
const isMobile = () => window.matchMedia("(max-width: 767px)").matches;

const currentIndex = computed(() =>
  menuItems.findIndex((item) => item.key === currentKey.value)
);

const activeItem = computed(() => menuItems[currentIndex.value]);
const activeComponent = computed(() => componentMap[currentKey.value]);

const switchTo = (key: MenuKey, direction?: "up" | "down") => {
  if (key === currentKey.value) return;
  if (direction) {
    transitionName.value = direction === "up" ? "slide-up-fade" : "slide-down-fade";
  } else {
    transitionName.value = "slide-fade";
  }
  currentKey.value = key;
};

const navigateBySwipe = (direction: "up" | "down") => {
  if (!isMobile()) return;
  const nextIndex = direction === "up" ? currentIndex.value + 1 : currentIndex.value - 1;
  if (nextIndex < 0 || nextIndex >= menuItems.length) return;
  switchTo(menuItems[nextIndex].key, direction);
};

const canScrollInGestureDirection = (target: EventTarget | null, deltaY: number) => {
  let current = target instanceof Element ? target : null;
  while (current) {
    const styles = window.getComputedStyle(current);
    const overflowY = styles.overflowY;
    const isScrollable =
      (overflowY === "auto" || overflowY === "scroll") &&
      current.scrollHeight > current.clientHeight + 1;
    if (isScrollable) {
      const canScrollDown = current.scrollTop + current.clientHeight < current.scrollHeight - 1;
      const canScrollUp = current.scrollTop > 1;
      if ((deltaY > 0 && canScrollDown) || (deltaY < 0 && canScrollUp)) {
        return true;
      }
    }
    current = current.parentElement;
  }
  return false;
};

const onTouchStart = (event: TouchEvent) => {
  if (!isMobile()) return;
  const firstTouch = event.changedTouches[0];
  if (!firstTouch) return;
  touchStartX.value = firstTouch.clientX;
  touchStartY.value = firstTouch.clientY;
  touchStartTarget.value = event.target;
};

const onTouchEnd = (event: TouchEvent) => {
  if (!isMobile() || touchStartY.value === null) return;
  const firstTouch = event.changedTouches[0];
  if (!firstTouch || touchStartX.value === null) {
    touchStartTarget.value = null;
    return;
  }
  const deltaX = touchStartX.value - firstTouch.clientX;
  const endY = firstTouch.clientY;
  const deltaY = touchStartY.value - endY;
  touchStartY.value = null;
  touchStartX.value = null;
  if (Math.abs(deltaY) <= Math.abs(deltaX)) {
    touchStartTarget.value = null;
    return;
  }
  if (Math.abs(deltaY) < SWIPE_THRESHOLD) {
    touchStartTarget.value = null;
    return;
  }
  if (canScrollInGestureDirection(touchStartTarget.value, deltaY)) {
    touchStartTarget.value = null;
    return;
  }
  touchStartTarget.value = null;
  navigateBySwipe(deltaY > 0 ? "up" : "down");
};

onMounted(() => {
  window.addEventListener("touchstart", onTouchStart, { passive: true });
  window.addEventListener("touchend", onTouchEnd, { passive: true });
  previousHtmlOverscrollBehaviorY.value = document.documentElement.style.overscrollBehaviorY;
  previousBodyOverscrollBehaviorY.value = document.body.style.overscrollBehaviorY;
  document.documentElement.style.overscrollBehaviorY = "none";
  document.body.style.overscrollBehaviorY = "none";
});

onBeforeUnmount(() => {
  window.removeEventListener("touchstart", onTouchStart);
  window.removeEventListener("touchend", onTouchEnd);
  document.documentElement.style.overscrollBehaviorY = previousHtmlOverscrollBehaviorY.value;
  document.body.style.overscrollBehaviorY = previousBodyOverscrollBehaviorY.value;
});
</script>
