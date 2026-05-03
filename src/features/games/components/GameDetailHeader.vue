<template>
  <div class="s-card">
    <div class="flex items-center justify-between mb-4">
      <!-- 返回按钮 - 手机端增大尺寸 -->
      <button
        class="btn btn-ghost lg:btn-sm min-h-12 lg:min-h-8 px-4 lg:px-3"
        @click="handleBack"
      >
        ← 返回
      </button>

      <!-- 账号名 -->
      <div class="text-lg font-bold">{{ game?.status.nick_name || account }}</div>

      <!-- 游戏选择器 -->
      <select
        v-if="gameList.length > 1"
        class="select select-bordered select-sm"
        :value="account"
        @change="handleGameChange"
      >
        <option v-for="g in gameList" :key="g.status.account" :value="g.status.account">
          {{ g.status.nick_name }}
        </option>
      </select>
    </div>

    <!-- 资源信息 - 使用游戏图标 -->
    <div v-if="details" class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <!-- 龙门币 -->
      <div class="flex items-center gap-3">
        <img :src="goldIconUrl" alt="龙门币" class="w-16 h-16" loading="lazy" />
        <div>
          <div class="text-sm text-base-content/70">龙门币</div>
          <div class="text-2xl font-bold font-en">{{ formatLargeNumber(details.status.gold) }}</div>
        </div>
      </div>

      <!-- 合成玉 -->
      <div class="flex items-center gap-3">
        <img :src="diamondShdIconUrl" alt="合成玉" class="w-16 h-16" loading="lazy" />
        <div>
          <div class="text-sm text-base-content/70">合成玉</div>
          <div class="text-2xl font-bold font-en">{{ formatLargeNumber(details.status.diamondShard) }}</div>
        </div>
      </div>

      <!-- 源石 -->
      <div class="flex items-center gap-3">
        <img :src="diamondIconUrl" alt="源石" class="w-16 h-16" loading="lazy" />
        <div>
          <div class="text-sm text-base-content/70">源石</div>
          <div class="text-2xl font-bold font-en">{{ details.status.androidDiamond }}</div>
        </div>
      </div>

      <!-- 当前理智 -->
      <div class="flex items-center gap-3">
        <img :src="apIconUrl" alt="理智" class="w-16 h-16" loading="lazy" />
        <div>
          <div class="text-sm text-base-content/70">当前理智</div>
          <div class="text-2xl font-bold">
            <span class="md:hidden">{{ details.status.ap || 0 }}</span>
            <span class="hidden md:inline">{{ details.status.ap || 0 }} / {{ details.status.maxAp || 0 }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { getGameResourceIconUrl, GameResourceType, formatLargeNumber } from "@/shared/utils/resource";
import type { ApiGameGame, ApiGameDetail } from "@/shared/types/api";
import { ROUTES } from "@/shared/constants/routes";

const { account, game, details, gameList } = defineProps<{
  account: string;
  game: ApiGameGame | undefined;
  details: ApiGameDetail | null;
  gameList: ApiGameGame[];
}>();

const router = useRouter();

// 资源图标 URL
const goldIconUrl = getGameResourceIconUrl(GameResourceType.GOLD);
const diamondShdIconUrl = getGameResourceIconUrl(GameResourceType.DIAMOND_SHD);
const diamondIconUrl = getGameResourceIconUrl(GameResourceType.DIAMOND);
const apIconUrl = getGameResourceIconUrl(GameResourceType.AP_GAMEPLAY);

const handleBack = () => {
  router.back();
};

const handleGameChange = (event: Event) => {
  const newAccount = (event.target as HTMLSelectElement).value;
  router.replace({
    name: ROUTES.GAME_DETAIL.name,
    params: { account: newAccount },
  });
};
</script>
