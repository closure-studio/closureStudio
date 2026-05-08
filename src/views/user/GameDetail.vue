<template>
  <div class="min-h-screen flex flex-col gap-1 lg:gap-6 p-1 lg:p-6 game-detail-swipe-area">
    <!-- 游戏选择器：桌面端保留按钮设计，移动端改为滑动切换 -->
    <div class="hidden md:block">
      <GameSelector :account="account" :game-list="gamesStore.gameList" />
    </div>

    <div v-if="gamesStore.gameList.length > 1" class="md:hidden mb-2">
      <MobileSwipeMenuHeader
        :active-title="activeGameTitle"
        :active-index="currentGameIndex"
        :items="gameSelectorItems"
        axis="x"
        swipe-text="左右滑动切换游戏"
      />
    </div>

    <!-- 顶部账号信息卡片 -->
    <GameDetailHeader :account="account" :game="selectedGame" :details="details" />

    <!-- 主内容区 - 垂直堆叠（移动端）/ 2x2 网格（桌面端） -->
    <div class="flex flex-col lg:grid lg:grid-cols-2 gap-1 lg:gap-6">
      <!-- 1. 配置卡片 -->
      <div class="s-card lg:order-1">
        <h2 class="text-xl font-bold mb-4">托管配置</h2>
        <ConfigPanel :account="account" :details="details" />
      </div>

      <!-- 2. 游戏日志卡片 -->
      <div class="s-card lg:order-2">
        <h2 class="text-xl font-bold mb-4">游戏日志</h2>
        <LogsPanel
          :logs="gameLogs.logs"
          :has-more="gameLogs.hasMore"
          :is-loading="isLoadingGameLogs"
          @load-more="getLogs"
        />
      </div>

      <!-- 3. 干员卡片 -->
      <div class="s-card lg:order-3">
        <h2 class="text-xl font-bold mb-4">干员一览</h2>
        <CharsPanel :chars="sixStarChars" :is-loading="isLoadingChars" />
      </div>

      <!-- 4. 道具卡片 -->
      <div class="s-card lg:order-4">
        <h2 class="text-xl font-bold mb-4">道具一览</h2>
        <ItemsPanel />
      </div>
    </div>
  </div>
</template>

<style scoped>
.game-detail-swipe-area {
  touch-action: pan-y;
}
</style>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useGamesStore } from "@/stores/useGamesStore";
import { useGameChars } from "@/features/games/composables/useGameChars";
import GameDetailHeader from "@/features/games/components/GameDetailHeader.vue";
import GameSelector from "@/features/games/components/GameSelector.vue";
import CharsPanel from "@/features/games/components/CharsPanel.vue";
import ItemsPanel from "@/features/games/components/ItemsPanel.vue";
import LogsPanel from "@/features/games/components/LogsPanel.vue";
import ConfigPanel from "@/features/games/components/ConfigPanel.vue";
import apiClient from "@/shared/services/apiClient";
import MobileSwipeMenuHeader from "@/shared/components/ui/MobileSwipeMenuHeader.vue";
import { useSwipeNavigation } from "@/shared/composables/useSwipeNavigation";
import { ROUTES } from "@/shared/constants/routes";
import { setMsg } from "@/shared/utils/toast";
import { Type } from "@/shared/components/toast/enum";
import { assets } from "@/plugins/assets/assets";
import type { ApiGameDetail, ApiGameGame, ApiGameLogs } from "@/shared/types/api";

const route = useRoute();
const router = useRouter();
const gamesStore = useGamesStore();

const gameDisplayName = (game: ApiGameGame) =>
  game.status.nick_name ? `Dr. ${game.status.nick_name}` : game.status.account;

// 路由参数
const account = computed(() => route.params.account as string);

// 当前选中的游戏
const selectedGame = computed(() => gamesStore.findGame(account.value));

const gameSelectorItems = computed(() =>
  gamesStore.gameList.map((game) => ({
    key: game.status.account,
    name: gameDisplayName(game),
  }))
);

const currentGameIndex = computed(() =>
  gamesStore.gameList.findIndex((game) => game.status.account === account.value)
);

const activeGameTitle = computed(() =>
  selectedGame.value ? gameDisplayName(selectedGame.value) : account.value
);

// 游戏详情
const details = ref<ApiGameDetail | null>(null);

// 游戏日志
const gameLogs = ref<ApiGameLogs>({
  logs: [],
  hasMore: false,
});
const isLoadingGameLogs = ref(false);

// 使用 composable 获取干员数据
const { chars, isLoading: isLoadingChars } = useGameChars(account);

// 仅展示 6 星（rarity === 5）干员
const sixStarChars = computed(() =>
  chars.value.filter((c) => assets.value.getCharRarity(c.charId) === 5)
);

const navigateBySwipe = (direction: "left" | "right") => {
  const nextIndex = direction === "left" ? currentGameIndex.value + 1 : currentGameIndex.value - 1;
  const nextGame = gamesStore.gameList[nextIndex];
  if (!nextGame || nextGame.status.account === account.value) return;

  router.replace({
    name: ROUTES.GAME_DETAIL.name,
    params: { account: nextGame.status.account },
  });
};

useSwipeNavigation({
  axis: "x",
  onSwipe: navigateBySwipe,
});

// 获取游戏详情
const getGameDetails = async () => {
  try {
    const res = await apiClient.fetchGameDetails(account.value);
    if (res.data) {
      details.value = res.data;
    } else {
      setMsg(res.message, Type.Warning);
    }
  } catch (error) {
    console.error("Failed to fetch game details:", error);
  }
};

// 获取游戏日志
const getLogs = async () => {
  if (isLoadingGameLogs.value) return;
  isLoadingGameLogs.value = true;
  const lastLogId = gameLogs.value.logs[gameLogs.value.logs.length - 1]?.id || 0;

  try {
    const res = await apiClient.fetchGameLogs(account.value, lastLogId);
    if (res.data) {
      gameLogs.value.logs.push(...res.data.logs);
      gameLogs.value.hasMore = res.data.hasMore;
    } else {
      setMsg(res.message, Type.Warning);
    }
  } catch (error) {
    console.error("Failed to fetch game logs:", error);
  } finally {
    isLoadingGameLogs.value = false;
  }
};

// 监听账号变化
watch(
  account,
  (newAccount) => {
    if (newAccount) {
      // 重置状态
      details.value = null;
      gameLogs.value = { logs: [], hasMore: false };

      // 加载数据
      getGameDetails();
      getLogs();
    }
  },
  { immediate: true }
);
</script>
