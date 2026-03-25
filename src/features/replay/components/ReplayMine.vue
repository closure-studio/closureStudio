<template>
  <div class="space-y-4 p-2">
    <!-- 头部说明 -->
    <div class="bg-white/8 border border-white/12 rounded-xl p-4">
      <div class="flex items-center gap-3 mb-2">
        <Icon icon="mdi-video-outline" class="w-5 h-5 text-info" />
        <span class="font-bold text-base-content/90">我的作战录像</span>
      </div>
      <p class="text-xs text-base-content/50 leading-relaxed">
        查看你发布的所有录像。录像提交后进入待审核状态，审核通过后将对所有博士公开。
      </p>
    </div>

    <!-- 状态筛选 -->
    <div class="flex gap-1 flex-wrap">
      <button
        v-for="opt in statusOptions"
        :key="opt.value"
        class="btn btn-sm transition-all duration-200"
        :class="
          filterStatus === opt.value
            ? 'btn-info btn-outline border-info/30 bg-info/10 text-info'
            : 'btn-ghost text-base-content/50 hover:text-base-content/80'
        "
        @click="filterStatus = opt.value"
      >
        {{ opt.label }}
        <span class="badge badge-xs ml-1">{{ countByStatus(opt.value) }}</span>
      </button>
    </div>

    <!-- 加载中 -->
    <div v-if="store.isLoadingMyRecords" class="flex justify-center py-12">
      <span class="loading loading-spinner loading-md text-info" />
    </div>

    <!-- 录像列表 -->
    <div v-else-if="filtered.length" class="space-y-2">
      <div
        v-for="record in paged"
        :key="record.id"
        class="group rounded-xl border border-white/10 bg-white/6 p-4 transition-all duration-200 hover:bg-white/10 hover:border-white/18"
      >
        <div class="flex items-start gap-3">
          <!-- 状态色点 -->
          <div class="w-2 h-2 rounded-full mt-2 shrink-0" :class="statusDotClass(record.status)" />

          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="font-bold text-base-content/90">{{ record.stageId }}</span>
              <span class="badge badge-sm" :class="statusBadgeClass(record.status)">
                {{ statusLabel(record.status) }}
              </span>
            </div>
            <div class="text-xs text-base-content/45 mt-1.5 flex items-center flex-wrap gap-x-4 gap-y-1">
              <span>{{ formatTime(record.createdAt, 'yyyy-MM-dd HH:mm') }}</span>
              <span class="flex items-center gap-1">
                <Icon icon="mdi-sword-cross" class="w-3 h-3" />
                {{ record.successBattleCount }}/{{ record.totalBattleCount }} 胜
              </span>
              <span v-if="record.netScore != null" class="flex items-center gap-1">
                <Icon icon="mdi-thumb-up-outline" class="w-3 h-3" />
                净评分 {{ record.netScore >= 0 ? '+' : '' }}{{ record.netScore }}
              </span>
              <span v-if="record.usageCount != null" class="flex items-center gap-1">
                <Icon icon="mdi-download-outline" class="w-3 h-3" />
                采用 {{ record.usageCount }} 次
              </span>
            </div>
            <p v-if="record.displayInfo" class="text-xs text-base-content/40 mt-1.5 line-clamp-1">
              {{ record.displayInfo }}
            </p>
          </div>

          <!-- 删除按钮 -->
          <button
            class="btn btn-xs btn-ghost text-base-content/35 hover:text-error hover:bg-error/10 transition-colors shrink-0"
            :disabled="isDeleting === record.id"
            @click="onDelete(record.id)"
          >
            <span v-if="isDeleting === record.id" class="loading loading-spinner loading-xs" />
            <Icon v-else icon="mdi-trash-can-outline" class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="text-center py-16 text-base-content/30">
      <div class="inline-flex flex-col items-center gap-3">
        <div class="w-16 h-16 rounded-2xl bg-white/8 border border-white/12 flex items-center justify-center">
          <Icon icon="mdi-video-off-outline" class="w-8 h-8" />
        </div>
        <p class="text-sm">
          {{ filterStatus === 'all' ? '还没有发布过录像' : '该状态下没有录像' }}
        </p>
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="totalPages > 1" class="flex justify-center items-center gap-3 pt-2">
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

<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { computed, onMounted, ref } from "vue";
import { useReplayStore } from "@/stores/useReplayStore";
import { formatTime } from "@/shared/utils/format";
import type { RecordStatus } from "@/shared/types/replay";

const store = useReplayStore();
const PAGE_SIZE = 10;

// ---- 状态筛选 ----
type FilterStatus = "all" | RecordStatus;
const filterStatus = ref<FilterStatus>("all");

const statusOptions: { value: FilterStatus; label: string }[] = [
  { value: "all", label: "全部" },
  { value: 0,   label: "待审核" },
  { value: 1,   label: "已发布" },
  { value: 2,   label: "已隐藏" },
];

const countByStatus = (val: FilterStatus) =>
  val === "all"
    ? store.myRecords.length
    : store.myRecords.filter((r) => r.status === val).length;

const filtered = computed(() =>
  filterStatus.value === "all"
    ? store.myRecords
    : store.myRecords.filter((r) => r.status === filterStatus.value)
);

// ---- 分页 ----
const currentPage = ref(1);
const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / PAGE_SIZE)));
const paged = computed(() =>
  filtered.value.slice((currentPage.value - 1) * PAGE_SIZE, currentPage.value * PAGE_SIZE)
);

const goPage = (page: number) => {
  currentPage.value = page;
};

// ---- 删除 ----
const isDeleting = ref<string | null>(null);
const onDelete = async (id: string) => {
  if (!confirm("确定删除该录像？此操作不可撤销。")) return;
  isDeleting.value = id;
  // TODO: 后端部署后替换为 store.deleteRecord(id)
  await new Promise((r) => setTimeout(r, 500));
  const idx = store.myRecords.findIndex((r) => r.id === id);
  if (idx !== -1) store.myRecords.splice(idx, 1);
  isDeleting.value = null;
};

// ---- 工具 ----
const statusLabel = (s: RecordStatus) =>
  (["待审核", "已发布", "已隐藏"] as const)[s];

const statusBadgeClass = (s: RecordStatus) =>
  (["badge-warning", "badge-success", "badge-error"] as const)[s];

const statusDotClass = (s: RecordStatus) =>
  (["bg-warning", "bg-success", "bg-error"] as const)[s];

onMounted(() => {
  store.fetchMyRecords();
});
</script>