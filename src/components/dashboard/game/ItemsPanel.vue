<template>
  <div
    v-if="isLoading"
    class="grid grid-cols-[repeat(auto-fill,minmax(72px,1fr))] gap-x-1 gap-y-2 py-1 tracking-normal"
    aria-busy="true"
    aria-label="道具加载中"
  >
    <div v-for="index in 12" :key="index" class="flex min-w-0 flex-col items-center text-center" aria-hidden="true">
      <div class="skeleton mb-1 size-16 shrink-0 rounded-md" />
      <div class="flex min-h-6 w-full items-center justify-center">
        <div class="skeleton h-4 w-12" />
      </div>
      <div class="mt-0.5 flex min-h-4 w-full justify-center pt-1">
        <div class="skeleton h-3 w-16" />
      </div>
    </div>
  </div>
  <p v-else-if="error" class="py-12 text-center text-sm text-error" role="status">
    道具数据加载失败
  </p>
  <p v-else-if="!inventory" class="py-12 text-center text-sm text-base-content/60" role="status">
    暂无道具数据
  </p>
  <p v-else-if="!items.length" class="py-12 text-center text-sm text-base-content/60" role="status">
    暂无道具
  </p>
  <ul
    v-else
    class="grid grid-cols-[repeat(auto-fill,minmax(72px,1fr))] gap-x-1 gap-y-2 py-1 tracking-normal"
    aria-label="道具库存"
  >
    <li
      v-for="item in items"
      :key="item.id"
      class="relative z-0 flex min-w-0 flex-col items-center rounded text-center transition duration-200 ease-out hover:z-10 hover:shadow-xl motion-safe:hover:-translate-y-1 motion-safe:hover:scale-105"
    >
      <div class="mb-1 flex size-16 shrink-0 items-center justify-center">
        <img
          v-if="item.icon && !failedImages.has(item.icon)"
          :src="item.icon"
          class="size-full object-contain"
          alt=""
          loading="lazy"
          width="64"
          height="64"
          @error="failedImages.add(item.icon)"
        />
        <Icon v-else icon="mdi:package-variant" class="text-3xl text-base-content/30" aria-hidden="true" />
      </div>
      <span class="min-h-6 w-full text-base/6 font-semibold tabular-nums wrap-anywhere">{{ numberFormat.format(item.quantity) }}</span>
      <span class="mt-0.5 min-h-4 w-full text-xs/4 text-base-content/65 wrap-anywhere">{{ item.name }}</span>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { Icon } from "@iconify/vue";
import { assets } from "@/services/assets";
import type { ApiGameDetail } from "@/shared/types/api";

const props = defineProps<{
  inventory?: ApiGameDetail["inventory"];
  isLoading: boolean;
  error: boolean;
}>();

const failedImages = ref(new Set<string>());
const numberFormat = new Intl.NumberFormat("zh-CN");
const hiddenItemIdPrefix = "act";
const items = computed(() =>
  Object.entries(props.inventory ?? {})
    .filter(([id]) => !id.startsWith(hiddenItemIdPrefix))
    .sort(([a], [b]) => a.localeCompare(b, "en", { numeric: true }))
    .map(([id, quantity]) => ({
      id,
      quantity,
      name: assets.value.items.value[id]?.name || id,
      icon: assets.value.getItemLink(id),
    }))
);
</script>
