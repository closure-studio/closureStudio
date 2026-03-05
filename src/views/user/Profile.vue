<template>
  <div class="container w-full md:max-w-4xl mx-auto">
    <!-- <div class="flex w-full flex-col">
      <span class="font-bold text-4xl">可露希尔杂货店</span>
      <div class="divider my-2" />
    </div> -->
    <div class="mt-2 flex items-start">
      <ul class="hidden md:block menu w-12 md:w-[10rem] rounded-box shadow-md mr-4 space-y-2 font-bold s-pro">
        <li v-for="k in menu" :key="k.to">
          <router-link :to="k.to" :class="{ active: route.path == k.to }" class="flex items-center space-x-2">
            <!-- 图标始终显示 -->
            <Icon :icon="k.icon" class="w-6 h-6" />
            <!-- 文本仅在 `md` 及更大屏幕显示，小屏幕隐藏 -->
            <span class="hidden md:block">{{ k.name }}</span>
          </router-link>
        </li>
      </ul>

      <div class="grow shadow-md py-1 px-5 rounded-box profile-swipe-area">
        <div class="md:hidden mb-3">
          <div class="mobile-menu-header">
            <span class="mobile-menu-title">{{ activeMenu?.name }}</span>
          </div>
          <div class="mt-2.5 flex items-center justify-center gap-2">
            <span v-for="(item, index) in menu" :key="item.to" class="h-1.5 rounded-full transition-all duration-300"
              :class="index === currentMenuIndex ? 'w-5 bg-info' : 'w-2 bg-base-content/20'" />
          </div>
          <div class="mt-1.5 text-center text-xs text-base-content/55 swipe-hint">↑↓ 滑动切换</div>
        </div>
        <!-- <div class="p-2 flex items-center">
          <div class="avatar mr-3">
            <div class="w-16 rounded-full">
              <img src="/assets/closure.ico" alt="avatar" />
            </div>
          </div>
          <div class="font-bold flex flex-col">
            <span class="text-3xl">博士！</span>
            <span class="text-base-content/50">今天是你加入可露希尔俱乐部第 {{ days }} 天!</span>
          </div>
        </div> -->
        <router-view v-slot="{ Component }">
          <transition :name="transitionName">
            <component :is="Component" v-if="Component" />
            <div v-else>
              <div v-if="user.user.Info.status === 1" role="alert"
                class="rounded border-s-4 border-success bg-info/10 p-4 mt-4">
                <strong class="block font-bold text-lg">你已完成身份绑定，可正常使用可露希尔云服务</strong>
                <p class="mt-4 text-sm">
                  <a class="btn btn-info btn-sm px-4 btn-outline">你的绑定手机号是：可露希尔也不知道(&gt;﹏&lt;)</a>
                </p>
              </div>
              <div v-if="user.user.Info.status <= 0" role="alert"
                class="rounded border-s-4 border-warning bg-warning/10 p-4 mt-4">
                <strong class="block font-bold text-lg">你还没有绑定手机号，请先添加游戏/启动游戏</strong>
                <p class="mt-4 text-sm">
                  <router-link to="/dashboard" class="btn btn-info btn-sm px-4 btn-outline btn-block">点击传送</router-link>
                </p>
              </div>
              <span class="text-2xl font-bold">你是可露希尔旗舰店<a class="text-info">{{ levels[gameList.length] }}级</a>会员</span>
              <div class="text-xl">可在平台内添加托管 {{ 3 - gameList.length }} 个游戏账号</div>
              <div class="grid grid-cols-2 gap-4 mt-2">
                <GameAccount v-for="(v, k) in gameList" :key="k" :gameAccount="v.game_config.account" />
              </div>
              <div class="divider my-2" />
              <span class="text-info text-lg">托管额度已全部使用，无法添加更多账号；<br />若想增加额度，请<b
                  class="text-base-content s-underline">验证账号所有权</b>（尚未开放）</span>
            </div>
          </transition>
        </router-view>
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

.profile-swipe-area {
  touch-action: pan-y;
}

.mobile-menu-header {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 0.55rem;
  padding: 0.1rem 0.2rem;
}

.mobile-menu-label {
  font-size: 0.66rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: color-mix(in oklab, var(--color-base-content) 44%, transparent);
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
import GameAccount from "@/features/games/components/GameAccount.vue";
import { useProfileData } from "@/features/profile/composables/useProfileData";
import { ROUTE_NAMES } from "@/shared/constants/routes";
import { useGamesStore } from "@/stores/useGamesStore";
import { useUserStore } from "@/stores/useUserStore";
import { Icon } from "@iconify/vue";
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
const route = useRoute();
const router = useRouter();
const user = useUserStore();
const gamesStore = useGamesStore();
const levels = ["杰斯顿", "深海杰斯顿", "海上杰斯顿", "空中杰斯顿", "兽主杰斯顿"];
const { gameList, fetchProfileGameList } = useProfileData();
const transitionName = ref("slide-fade");
const touchStartY = ref<number | null>(null);
const touchStartX = ref<number | null>(null);
const touchStartTarget = ref<EventTarget | null>(null);

const menu = [
  {
    name: ROUTE_NAMES.PROFILE,
    icon: "mdi-information",
    to: "/profile",
  },
  {
    name: ROUTE_NAMES.PROFILE_NETWORK,
    icon: "mdi-wifi",
    to: "/profile/network",
  },
  {
    name: ROUTE_NAMES.PROFILE_ACCOUNT,
    icon: "mdi-account-lock",
    to: "/profile/account",
  },
  {
    name: ROUTE_NAMES.PROFILE_SMS_VERIFY,
    icon: "mdi-shield-check",
    to: "/profile/smsVerify",
  },
];

const SWIPE_THRESHOLD = 40;
const isMobile = () => window.matchMedia("(max-width: 767px)").matches;

const currentMenuIndex = computed(() => {
  const index = menu.findIndex((item) => item.to === route.path);
  return index === -1 ? 0 : index;
});

const activeMenu = computed(() => menu[currentMenuIndex.value]);

const navigateBySwipe = (direction: "up" | "down") => {
  if (!isMobile()) return;
  const nextIndex = direction === "up" ? currentMenuIndex.value + 1 : currentMenuIndex.value - 1;
  if (nextIndex < 0 || nextIndex >= menu.length) return;
  transitionName.value = direction === "up" ? "slide-up-fade" : "slide-down-fade";
  router.push(menu[nextIndex].to);
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
  touchStartY.value = event.changedTouches[0]?.clientY ?? null;
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
  const endY = event.changedTouches[0]?.clientY ?? touchStartY.value;
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

watch(
  () => route.path,
  (nextPath, previousPath) => {
    if (!previousPath) {
      transitionName.value = "slide-fade";
      return;
    }
    const nextIndex = menu.findIndex((item) => item.to === nextPath);
    const previousIndex = menu.findIndex((item) => item.to === previousPath);
    if (nextIndex === -1 || previousIndex === -1 || nextIndex === previousIndex) {
      transitionName.value = "slide-fade";
      return;
    }
    transitionName.value = nextIndex > previousIndex ? "slide-up-fade" : "slide-down-fade";
  }
);

onMounted(async () => {
  window.addEventListener("touchstart", onTouchStart, { passive: true });
  window.addEventListener("touchend", onTouchEnd, { passive: true });
  await fetchProfileGameList();
  gamesStore.initializeGameListServerConnection();
});

onBeforeUnmount(() => {
  window.removeEventListener("touchstart", onTouchStart);
  window.removeEventListener("touchend", onTouchEnd);
});
</script>
