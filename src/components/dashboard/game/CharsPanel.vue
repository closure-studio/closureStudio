<template>
  <!-- 加载骨架屏 -->
  <div v-if="isLoading" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    <div v-for="i in 12" :key="i" class="char-card-skeleton">
      <div class="skeleton aspect-square w-full rounded-md"></div>
    </div>
  </div>

  <!-- 空状态 -->
  <div v-else-if="!chars.length" class="text-center py-20">
    <p class="text-base-content/60">暂无干员数据</p>
  </div>

  <!-- 干员网格 -->
  <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    <CharCard v-for="char in chars" :key="char.charId" :char="char" />
  </div>
</template>

<script setup lang="ts">
import CharCard from "./CharCard.vue";
import type { ApiGameChar } from "@/shared/types/api";

defineProps<{
  chars: ApiGameChar[];
  isLoading: boolean;
}>();
</script>
