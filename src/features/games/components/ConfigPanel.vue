<template>
  <div class="flex flex-col">
    <GameConfig :account="account" :inline="true" />
  </div>
</template>

<script setup lang="ts">
import GameConfig from '@/features/games/components/GameConfig.vue';
import type { ApiGameDetail } from '@/shared/types/api';

defineProps<{
  account: string;
  details: ApiGameDetail | null;
}>();
</script>
