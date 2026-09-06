<template>
  <div
    v-if="isLoading"
    class="grid grid-cols-[repeat(auto-fill,minmax(113px,1fr))] gap-x-1 gap-y-2 md:grid-cols-[repeat(auto-fill,minmax(144px,1fr))] md:gap-x-3 md:gap-y-3.5"
    aria-busy="true"
    aria-label="干员加载中"
  >
    <div
      v-for="i in 12"
      :key="i"
      class="flex min-w-0 items-center gap-0.5 rounded p-0.5 md:gap-2"
      aria-hidden="true"
    >
      <div class="skeleton size-16 shrink-0 rounded" />
      <div class="flex h-16 min-w-0 flex-1 flex-col justify-between">
        <div
          v-for="row in 3"
          :key="row"
          class="flex items-center justify-between gap-0.5"
        >
          <div class="skeleton h-2.5 w-[1.375rem] md:h-3" />
          <div class="skeleton h-2.5 w-4 md:h-3" />
        </div>
      </div>
    </div>
  </div>

  <div v-else-if="!chars.length" class="text-center py-20" role="status">
    <p class="text-base-content/60">暂无干员数据</p>
  </div>

  <ul
    v-else
    class="grid grid-cols-[repeat(auto-fill,minmax(113px,1fr))] gap-x-1 gap-y-2 md:grid-cols-[repeat(auto-fill,minmax(144px,1fr))] md:gap-x-3 md:gap-y-3.5"
    aria-label="六星干员"
  >
    <li v-for="char in chars" :key="char.charId" class="min-w-0">
      <CharCard :char="char" @select="openCharDetail" />
    </li>
  </ul>

  <AdaptiveDialog
    v-model:open="isDetailOpen"
    :title="selectedCharName"
    surface-background="#212121"
  >
    <CharDetail v-if="selectedChar" :account="account" :char="selectedChar" />
  </AdaptiveDialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { assets } from "@/services/assets";
import AdaptiveDialog from "@/shared/components/overlay/AdaptiveDialog.vue";
import CharCard from "./CharCard.vue";
import CharDetail from "./CharDetail.vue";
import type { ApiGameChar } from "@/shared/types/api";

defineProps<{
  account: string;
  chars: ApiGameChar[];
  isLoading: boolean;
}>();

const selectedChar = ref<ApiGameChar | null>(null);
const isDetailOpen = ref(false);
const selectedCharName = computed(() =>
  selectedChar.value
    ? assets.value.getCharName(selectedChar.value.charId)
    : "干员详情",
);

const openCharDetail = (char: ApiGameChar) => {
  selectedChar.value = char;
  isDetailOpen.value = true;
};

watch(isDetailOpen, (isOpen) => {
  if (!isOpen) selectedChar.value = null;
});
</script>
