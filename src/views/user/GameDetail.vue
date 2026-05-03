<template>
  <div class="min-h-screen flex flex-col p-1 lg:p-6">
    <!-- 顶部账号信息卡片 -->
    <GameDetailHeader
      :account="account"
      :game="selectedGame"
      :details="details"
      :game-list="gamesStore.gameList"
    />

    <!-- 主内容区 - 垂直堆叠（移动端）/ 2x2 网格（桌面端） -->
    <div class="flex flex-col lg:grid lg:grid-cols-2 gap-1 lg:gap-6 mt-1 lg:mt-6">
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
        <CharsPanel :chars="chars" :is-loading="isLoadingChars" />
      </div>

      <!-- 4. 道具卡片 -->
      <div class="s-card lg:order-4">
        <h2 class="text-xl font-bold mb-4">道具一览</h2>
        <ItemsPanel />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRoute } from "vue-router";
import { useGamesStore } from "@/stores/useGamesStore";
import { useGameChars } from "@/features/games/composables/useGameChars";
import GameDetailHeader from "@/features/games/components/GameDetailHeader.vue";
import CharsPanel from "@/features/games/components/CharsPanel.vue";
import ItemsPanel from "@/features/games/components/ItemsPanel.vue";
import LogsPanel from "@/features/games/components/LogsPanel.vue";
import ConfigPanel from "@/features/games/components/ConfigPanel.vue";
import apiClient from "@/shared/services/apiClient";
import { setMsg } from "@/shared/utils/toast";
import { Type } from "@/shared/components/toast/enum";
import type { ApiGameLogs, ApiGameDetail } from "@/shared/types/api";

const route = useRoute();
const gamesStore = useGamesStore();

// 路由参数
const account = computed(() => route.params.account as string);

// 当前选中的游戏
const selectedGame = computed(() => gamesStore.findGame(account.value));

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
