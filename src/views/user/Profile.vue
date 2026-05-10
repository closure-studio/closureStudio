<template>
  <div class="container w-full md:max-w-4xl mx-auto">
    <!-- <div class="flex w-full flex-col">
      <span class="font-bold text-4xl">可露希尔杂货店</span>
      <div class="divider my-2" />
    </div> -->
    <div class="flex items-start">
      <ul
        class="hidden md:block menu w-12 md:w-[10rem] rounded-box shadow-md mr-4 space-y-2 font-bold s-pro"
      >
        <li v-for="k in menu" :key="k.to">
          <router-link
            :to="k.to"
            :class="{ active: route.path == k.to }"
            class="flex items-center space-x-2"
          >
            <!-- 图标始终显示 -->
            <Icon :icon="k.icon" class="w-6 h-6" />
            <!-- 文本仅在 `md` 及更大屏幕显示，小屏幕隐藏 -->
            <span class="hidden md:block">{{ k.name }}</span>
          </router-link>
        </li>
      </ul>

      <div class="grow shadow-md py-1 px-5 rounded-box profile-swipe-area">
        <div class="md:hidden mb-3">
          <MobileSwipeMenuHeader
            :active-title="activeMenu?.name"
            :active-index="currentMenuIndex"
            :items="menu"
            axis="x"
            swipe-text="左右滑动"
          />
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
          </transition>
        </router-view>
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

.profile-swipe-area {
  touch-action: pan-y;
}
</style>

<script setup lang="ts">
import { useProfileData } from "@/features/profile/composables/useProfileData";
import MobileSwipeMenuHeader from "@/shared/components/ui/MobileSwipeMenuHeader.vue";
import { useSwipeNavigation } from "@/shared/composables/useSwipeNavigation";
import { ROUTES } from "@/constants/routes";
import { useGamesStore } from "@/stores/useGamesStore";
import { Icon } from "@iconify/vue";
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
const route = useRoute();
const router = useRouter();
const gamesStore = useGamesStore();
const { fetchProfileGameList } = useProfileData();
const transitionName = ref("slide-fade");

const menu = [
  {
    name: ROUTES.PROFILE_NETWORK.name,
    icon: "mdi-wifi",
    to: "/profile/network",
  },
  {
    name: ROUTES.PROFILE_ACCOUNT.name,
    icon: "mdi-account-lock",
    to: "/profile/account",
  },
  {
    name: ROUTES.PROFILE_ACKNOWLEDGEMENTS.name,
    icon: "mdi-heart",
    to: "/profile/acknowledgements",
  },
];

const currentMenuIndex = computed(() => {
  const index = menu.findIndex((item) => item.to === route.path);
  return index === -1 ? 0 : index;
});

const activeMenu = computed(() => menu[currentMenuIndex.value]);

const navigateBySwipe = (direction: "left" | "right") => {
  const nextIndex = direction === "left" ? currentMenuIndex.value + 1 : currentMenuIndex.value - 1;
  if (nextIndex < 0 || nextIndex >= menu.length) return;
  transitionName.value = direction === "left" ? "slide-left-fade" : "slide-right-fade";
  router.push(menu[nextIndex].to);
};

useSwipeNavigation({
  axis: "x",
  onSwipe: navigateBySwipe,
});

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
    transitionName.value = nextIndex > previousIndex ? "slide-left-fade" : "slide-right-fade";
  }
);

onMounted(async () => {
  await fetchProfileGameList();
  gamesStore.initializeGameListServerConnection();
});
</script>
