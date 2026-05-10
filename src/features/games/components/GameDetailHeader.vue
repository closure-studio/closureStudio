<template>
  <div class="s-card">
    <!-- 资源信息 - 使用游戏图标 -->
    <div v-if="details" class="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
      <!-- 龙门币 -->
      <div class="flex items-center gap-2 md:gap-3 min-w-0">
        <img
          :src="goldIconUrl"
          alt="龙门币"
          class="w-12 h-12 md:w-16 md:h-16 flex-shrink-0"
          loading="lazy"
        />
        <div class="min-w-0">
          <div class="text-sm text-base-content/70">龙门币</div>
          <div class="text-xl md:text-2xl font-bold font-en whitespace-nowrap">
            {{ formatLargeNumber(details.status.gold) }}
          </div>
        </div>
      </div>

      <!-- 合成玉 -->
      <div class="flex items-center gap-2 md:gap-3 min-w-0">
        <img
          :src="diamondShdIconUrl"
          alt="合成玉"
          class="w-12 h-12 md:w-16 md:h-16 flex-shrink-0"
          loading="lazy"
        />
        <div class="min-w-0">
          <div class="text-sm text-base-content/70">合成玉</div>
          <div class="text-xl md:text-2xl font-bold font-en whitespace-nowrap">
            {{ formatLargeNumber(details.status.diamondShard) }}
          </div>
        </div>
      </div>

      <!-- 源石 -->
      <div class="flex items-center gap-2 md:gap-3 min-w-0">
        <img
          :src="diamondIconUrl"
          alt="源石"
          class="w-12 h-12 md:w-16 md:h-16 flex-shrink-0"
          loading="lazy"
        />
        <div class="min-w-0">
          <div class="text-sm text-base-content/70">源石</div>
          <div class="text-xl md:text-2xl font-bold font-en whitespace-nowrap">
            {{ details.status.androidDiamond }}
          </div>
        </div>
      </div>

      <!-- 当前理智 -->
      <div class="flex items-center gap-2 md:gap-3 min-w-0">
        <img
          :src="apIconUrl"
          alt="理智"
          class="w-12 h-12 md:w-16 md:h-16 flex-shrink-0"
          loading="lazy"
        />
        <div class="min-w-0">
          <div class="text-sm text-base-content/70">当前理智</div>
          <div class="text-xl md:text-2xl font-bold whitespace-nowrap">
            <span class="md:hidden">{{ details.status.ap || 0 }}</span>
            <span class="hidden md:inline"
              >{{ details.status.ap || 0 }} / {{ details.status.maxAp || 0 }}</span
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { GameResourceType } from "@/constants/game";
import { getGameResourceIconUrl, formatLargeNumber } from "@/shared/utils/resource";
import type { ApiGameGame, ApiGameDetail } from "@/shared/types/api";

defineProps<{
  account: string;
  game: ApiGameGame | undefined;
  details: ApiGameDetail | null;
}>();

// 资源图标 URL
const goldIconUrl = getGameResourceIconUrl(GameResourceType.GOLD);
const diamondShdIconUrl = getGameResourceIconUrl(GameResourceType.DIAMOND_SHD);
const diamondIconUrl = getGameResourceIconUrl(GameResourceType.DIAMOND);
const apIconUrl = getGameResourceIconUrl(GameResourceType.AP_GAMEPLAY);
</script>
