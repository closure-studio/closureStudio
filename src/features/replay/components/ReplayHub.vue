<template>
  <div class="space-y-4 p-2">
    <!-- 搜索 & 排序栏 -->
    <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
      <label class="input input-bordered flex items-center gap-2 flex-1">
        <Icon icon="mdi-magnify" class="w-4 h-4 opacity-60" />
        <input
          v-model="searchQuery"
          type="text"
          class="grow"
          placeholder="搜索录像标题或描述…"
        />
      </label>
      <select v-model="sortKey" class="select select-bordered w-full sm:w-44">
        <option value="publishedAt">按发布时间</option>
        <option value="rating">按评分</option>
      </select>
    </div>

    <!-- 列表 -->
    <div v-if="paged.length" class="space-y-2">
      <div
        v-for="replay in paged"
        :key="replay.id"
        class="card border border-base-content/10 bg-base-200/60 shadow-sm transition-all duration-200"
        :class="{ 'shadow-md': expandedId === replay.id }"
      >
        <!-- 折叠行 -->
        <div
          class="card-body p-3 cursor-pointer select-none"
          @click="toggle(replay.id)"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-bold truncate">{{ replay.title }}</span>
                <div class="flex items-center gap-1">
                  <span class="badge badge-sm" :class="ratingBadgeClass(replay.ratingScore)">
                    {{ replay.ratingScore.toFixed(1) }}
                  </span>
                </div>
              </div>
              <div class="text-xs text-base-content/55 mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5">
                <span>{{ replay.author }}</span>
                <span>{{ formatDate(replay.publishedAt) }}</span>
                <span>{{ replay.likeCount }} 好评 / {{ replay.dislikeCount }} 差评</span>
              </div>
              <!-- 干员列表 (折叠时摘要) -->
              <div class="mt-1.5 flex flex-wrap gap-1">
                <span
                  v-for="op in replay.operators.slice(0, 5)"
                  :key="op"
                  class="badge badge-outline badge-xs"
                >{{ op }}</span>
                <span
                  v-if="replay.operators.length > 5"
                  class="badge badge-ghost badge-xs"
                >+{{ replay.operators.length - 5 }}</span>
              </div>
            </div>
            <Icon
              :icon="expandedId === replay.id ? 'mdi-chevron-up' : 'mdi-chevron-down'"
              class="w-5 h-5 shrink-0 mt-0.5 opacity-60"
            />
          </div>
        </div>

        <!-- 展开详情 -->
        <transition name="expand">
          <div v-if="expandedId === replay.id" class="px-3 pb-3">
            <div class="divider my-1" />
            <p class="text-sm text-base-content/80 leading-relaxed mb-3">{{ replay.description }}</p>
            <div class="mb-3">
              <span class="text-xs font-semibold uppercase tracking-wider text-base-content/50">干员阵容</span>
              <div class="mt-1.5 flex flex-wrap gap-1">
                <span
                  v-for="op in replay.operators"
                  :key="op"
                  class="badge badge-outline badge-sm"
                >{{ op }}</span>
              </div>
            </div>
            <!-- 打分 -->
            <div class="flex items-center gap-3">
              <button
                class="btn btn-xs gap-1"
                :class="replay.myVote === 'like' ? 'btn-success' : 'btn-outline'"
                @click.stop="vote(replay, 'like')"
              >
                <Icon icon="mdi-thumb-up" class="w-3.5 h-3.5" />
                好评 {{ replay.likeCount }}
              </button>
              <button
                class="btn btn-xs gap-1"
                :class="replay.myVote === 'dislike' ? 'btn-error' : 'btn-outline'"
                @click.stop="vote(replay, 'dislike')"
              >
                <Icon icon="mdi-thumb-down" class="w-3.5 h-3.5" />
                差评 {{ replay.dislikeCount }}
              </button>
              <button
                class="btn btn-xs btn-ghost ml-auto"
                @click.stop="toggle(replay.id)"
              >
                <Icon icon="mdi-chevron-up" class="w-4 h-4" />收起
              </button>
            </div>
          </div>
        </transition>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="text-center py-12 text-base-content/40">
      <Icon icon="mdi-video-off-outline" class="w-12 h-12 mx-auto mb-2" />
      <p>没有找到相关录像</p>
    </div>

    <!-- 分页 -->
    <div v-if="totalPages > 1" class="flex justify-center items-center gap-2 pt-2">
      <button
        class="btn btn-sm btn-ghost"
        :disabled="currentPage === 1"
        @click="currentPage--"
      >
        <Icon icon="mdi-chevron-left" class="w-4 h-4" />
      </button>
      <span class="text-sm text-base-content/70">
        {{ currentPage }} / {{ totalPages }}
      </span>
      <button
        class="btn btn-sm btn-ghost"
        :disabled="currentPage === totalPages"
        @click="currentPage++"
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
    opacity 0.22s ease,
    transform 0.22s ease;
}
.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>

<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { computed, ref, watch } from "vue";

type Vote = "like" | "dislike" | null;

interface Replay {
  id: number;
  title: string;
  description: string;
  operators: string[];
  ratingScore: number;
  author: string;
  publishedAt: Date;
  likeCount: number;
  dislikeCount: number;
  myVote: Vote;
}

// ---- mock 数据 ----
const mockReplays: Replay[] = Array.from({ length: 23 }, (_, i) => ({
  id: i + 1,
  title: `【${["低配", "极限", "标准", "速通", "奇葩"][i % 5]}】关卡 ${String(i + 1).padStart(2, "0")} 通关演示`,
  description: `这是第 ${i + 1} 个录像的详细描述。展示了如何在该关卡中高效部署干员，控制敌人走位，最终实现零费用通关。适合想要提升操作的博士参考。`,
  operators: [
    ["阿米娅", "银灰", "陈", "斯卡蒂", "能天使", "推推"],
    ["麦哲伦", "伊芙利特", "艾雅法拉", "白面鸮", "深海色"],
    ["凯尔希", "棘刺", "山", "多萝西", "歌蕾蒂娅", "火神", "煌"],
    ["林", "逻各斯", "菲亚梅塔", "守林人"],
    ["史尔特尔", "耀骑士临光", "风笛", "赫拉格", "星熊", "角峰"],
  ][i % 5],
  ratingScore: parseFloat((6 + Math.sin(i) * 3).toFixed(1)),
  author: ["Dr.Alpha", "Dr.Beta", "Dr.Gamma", "Dr.Delta", "Dr.Epsilon"][i % 5],
  publishedAt: new Date(Date.now() - i * 86400_000 * 3),
  likeCount: (i + 1) * 7,
  dislikeCount: Math.floor(i / 2),
  myVote: null,
}));

const replays = ref<Replay[]>(mockReplays);

// ---- 搜索 & 排序 ----
const searchQuery = ref("");
const sortKey = ref<"publishedAt" | "rating">("publishedAt");

const filtered = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  return replays.value
    .filter(
      (r) =>
        !q ||
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q)
    )
    .slice()
    .sort((a, b) =>
      sortKey.value === "rating"
        ? b.ratingScore - a.ratingScore
        : b.publishedAt.getTime() - a.publishedAt.getTime()
    );
});

// ---- 分页 ----
const PAGE_SIZE = 8;
const currentPage = ref(1);

watch([searchQuery, sortKey], () => {
  currentPage.value = 1;
});

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / PAGE_SIZE)));
const paged = computed(() =>
  filtered.value.slice((currentPage.value - 1) * PAGE_SIZE, currentPage.value * PAGE_SIZE)
);

// ---- 展开 ----
const expandedId = ref<number | null>(null);
const toggle = (id: number) => {
  expandedId.value = expandedId.value === id ? null : id;
};

// ---- 投票 ----
const vote = (replay: Replay, type: "like" | "dislike") => {
  if (replay.myVote === type) {
    if (type === "like") replay.likeCount--;
    else replay.dislikeCount--;
    replay.myVote = null;
  } else {
    if (replay.myVote === "like") replay.likeCount--;
    if (replay.myVote === "dislike") replay.dislikeCount--;
    if (type === "like") replay.likeCount++;
    else replay.dislikeCount++;
    replay.myVote = type;
  }
};

// ---- 工具 ----
const formatDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const ratingBadgeClass = (score: number) => {
  if (score >= 8) return "badge-success";
  if (score >= 5) return "badge-warning";
  return "badge-error";
};
</script>
