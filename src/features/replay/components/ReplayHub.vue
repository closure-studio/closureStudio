<template>
  <div class="space-y-4 p-2 replay-avatar-root">
    <!-- 搜索 & 排序栏 -->
    <div class="flex flex-col gap-2 sm:flex-row sm:items-center bg-white/8 border border-white/12 rounded-xl p-3">
      <label
        class="input flex items-center gap-2 flex-1 bg-white/5 border-white/10 focus-within:border-info/50 transition-colors"
      >
        <Icon icon="mdi-magnify" class="w-4 h-4 text-info/70" />
        <input v-model="searchQuery" type="text" class="grow" placeholder="搜索关卡 ID 或博士名…" />
      </label>
      <div class="flex gap-1">
        <button
          v-for="opt in sortOptions"
          :key="opt.key"
          class="btn btn-sm transition-all duration-200"
          :class="
            sortKey === opt.key
              ? 'btn-info btn-outline border-info/30 bg-info/10 text-info'
              : 'btn-ghost text-base-content/50 hover:text-base-content/80'
          "
          @click="onSortChange(opt.key)"
        >
          <Icon :icon="opt.icon" class="w-3.5 h-3.5" />
          {{ opt.label }}
        </button>
      </div>
    </div>

    <!-- 加载中 -->
    <div v-if="store.isLoadingRecords" class="flex justify-center py-12">
      <span class="loading loading-spinner loading-md text-info" />
    </div>

    <!-- 列表 -->
    <div v-else-if="paged.length" class="space-y-2">
      <RecordCard
        v-for="record in paged"
        :key="record.id"
        :record="record"
        :expanded="expandedId === record.id"
        :show-actions="true"
        @toggle="toggle(record.id)"
        @rate="(r) => onRate(record, r)"
      />
    </div>

    <!-- 空状态 -->
    <div v-else class="text-center py-16 text-base-content/30">
      <div class="inline-flex flex-col items-center gap-3">
        <div class="w-16 h-16 rounded-2xl bg-white/8 border border-white/12 flex items-center justify-center">
          <Icon icon="mdi-video-off-outline" class="w-8 h-8" />
        </div>
        <p class="text-sm">没有找到相关录像</p>
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="totalPages > 1" class="flex justify-center items-center gap-3 pt-3">
      <button
        class="w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-200"
        :class="
          currentPage === 1
            ? 'border-base-content/8 text-base-content/20 cursor-not-allowed'
            : 'border-info/20 text-info/50 hover:border-info/50 hover:text-info hover:bg-info/8'
        "
        :disabled="currentPage === 1"
        @click="goPage(currentPage - 1)"
      >
        <Icon icon="mdi-chevron-left" class="w-4 h-4" />
      </button>

      <div class="flex items-center gap-1">
        <span class="text-sm font-medium text-info/80">{{ currentPage }}</span>
        <span class="text-xs text-base-content/25 mx-0.5">/</span>
        <span class="text-sm text-base-content/35">{{ totalPages }}</span>
      </div>

      <button
        class="w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-200"
        :class="
          currentPage === totalPages
            ? 'border-base-content/8 text-base-content/20 cursor-not-allowed'
            : 'border-info/20 text-info/50 hover:border-info/50 hover:text-info hover:bg-info/8'
        "
        :disabled="currentPage === totalPages"
        @click="goPage(currentPage + 1)"
      >
        <Icon icon="mdi-chevron-right" class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.expand-enter-active,
.expand-leave-active {
  transition:
    opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}
.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>

<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { computed, onMounted, onBeforeUnmount, ref, watch } from "vue";
import { useReplayStore } from "@/stores/useReplayStore";
import type { RecordDTO } from "@/shared/types/replay";
import RecordCard from "./RecordCard.vue";

const store = useReplayStore();
const PAGE_LIMIT = 20;

// ---- 搜索 & 排序 ----
const searchQuery = ref("");
const sortKey = ref<"createdAt" | "netScore">("createdAt");
const sortOptions = [
  { key: "createdAt" as const, label: "最新发布", icon: "mdi-clock-outline" },
  { key: "netScore" as const, label: "最高评分", icon: "mdi-star-outline" },
];

const onSortChange = (key: typeof sortKey.value) => {
  sortKey.value = key;
  currentPage.value = 1;
};

// ---- 分页 ----
const pageSize = ref(calcPageSize());
const currentPage = ref(1);

function calcPageSize(): number {
  const available = window.innerHeight - 200;
  return Math.max(4, Math.floor(available / 80));
}

const filtered = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  return store.records
    .filter((r) => !q || r.stageId.toLowerCase().includes(q) || r.nickName.toLowerCase().includes(q))
    .slice()
    .sort((a, b) =>
      sortKey.value === "netScore"
        ? (b.netScore ?? 0) - (a.netScore ?? 0)
        : b.createdAt - a.createdAt
    );
});

const totalPages = computed(() => Math.max(1, Math.ceil(store.recordsTotal / pageSize.value)));
const paged = computed(() =>
  filtered.value.slice((currentPage.value - 1) * pageSize.value, currentPage.value * pageSize.value)
);

watch([searchQuery, sortKey], () => { currentPage.value = 1; });

const goPage = (page: number) => {
  currentPage.value = page;
  store.fetchRecords({
    offset: (page - 1) * PAGE_LIMIT,
    limit: PAGE_LIMIT,
    stageId: searchQuery.value || undefined,
  });
};

// ---- 展开 ----
const expandedId = ref<string | null>(null);
const toggle = (id: string) => {
  expandedId.value = expandedId.value === id ? null : id;
};

// ---- 评分 ----
const onRate = async (record: RecordDTO, val: 1 | -1) => {
  if (record.myRating === val) {
    await store.deleteMyRating(record.id);
  } else {
    await store.rateRecord(record.id, { rating: val });
  }
};

onMounted(() => {
  store.fetchRecords({ offset: 0, limit: PAGE_LIMIT });
  const onResize = () => {
    pageSize.value = calcPageSize();
    if (currentPage.value > totalPages.value) currentPage.value = 1;
  };
  window.addEventListener("resize", onResize);
  onBeforeUnmount(() => window.removeEventListener("resize", onResize));
});
</script>