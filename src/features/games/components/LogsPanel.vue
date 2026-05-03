<template>
  <div class="flex flex-col">
    <div class="overflow-y-auto max-h-96">
      <table class="text-[1rem] w-full">
        <tbody>
          <tr v-for="log in logs" :key="log.id">
            <td class="text-info whitespace-nowrap">{{ formatTime(log.ts, "HH:mm") }}</td>
            <td class="pl-2">{{ log.content }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <button
      :disabled="!hasMore || isLoading"
      class="btn btn-info btn-outline btn-block mt-4"
      @click="$emit('load-more')"
    >
      {{ isLoading ? "加载中..." : "加载更多" }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { formatTime } from '@/shared/utils/format';
import type { ApiGameLogEntry } from '@/shared/types/api';

defineProps<{
  logs: ApiGameLogEntry[];
  hasMore: boolean;
  isLoading: boolean;
}>();

defineEmits<{
  'load-more': [];
}>();
</script>
