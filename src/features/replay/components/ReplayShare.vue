<template>
  <div class="space-y-5 p-2 text-base-content">
    <section class="overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 shadow-[0_24px_80px_rgba(15,23,42,0.45)]">
      <div class="relative px-5 py-5 sm:px-6 sm:py-6">
        <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.16),transparent_32%),radial-gradient(circle_at_left,rgba(168,85,247,0.18),transparent_30%)]" />

        <div class="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div class="space-y-4">
            <div class="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/90">
              <Icon icon="mdi-filmstrip-box-multiple" class="h-4 w-4" />
              Replay Studio
            </div>

            <div class="space-y-2">
              <h2 class="text-2xl font-black tracking-tight text-white sm:text-3xl">
                重新整理你的录像发布体验
              </h2>
              <p class="max-w-2xl text-sm leading-6 text-slate-300/78 sm:text-base">
                用更清晰的分步交互完成录像发布，同时快速查看自己的历史投稿与沉淀内容。
              </p>
            </div>

            <div class="grid gap-3 sm:grid-cols-3">
              <div class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
                <div class="text-xs text-slate-400">已绑定账号</div>
                <div class="mt-2 flex items-end gap-2">
                  <span class="text-2xl font-bold text-white">{{ gamesStore.gameList.length }}</span>
                  <span class="text-xs text-slate-400">个可发布</span>
                </div>
              </div>
              <div class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
                <div class="text-xs text-slate-400">我的历史</div>
                <div class="mt-2 flex items-end gap-2">
                  <span class="text-2xl font-bold text-white">{{ store.myRecords.length }}</span>
                  <span class="text-xs text-slate-400">条录像</span>
                </div>
              </div>
              <div class="rounded-2xl border border-emerald-400/15 bg-emerald-400/10 px-4 py-3 backdrop-blur-sm">
                <div class="text-xs text-emerald-200/80">当前状态</div>
                <div class="mt-2 text-sm font-semibold text-emerald-100">
                  {{ canSubmit ? '可以发布' : '等待补全信息' }}
                </div>
              </div>
            </div>
          </div>

          <div class="relative shrink-0 rounded-3xl border border-white/10 bg-slate-900/70 p-2 backdrop-blur-xl lg:w-[320px]">
            <div class="grid grid-cols-2 gap-2">
              <button
                v-for="tab in tabs"
                :key="tab.key"
                class="group relative overflow-hidden rounded-2xl px-4 py-3 text-left transition-all duration-300"
                :class="
                  activeTab === tab.key
                    ? 'bg-white text-slate-950 shadow-[0_12px_40px_rgba(255,255,255,0.16)]'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                "
                @click="activeTab = tab.key"
              >
                <div
                  class="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  :class="tab.key === 'publish' ? 'bg-gradient-to-br from-cyan-400/10 to-transparent' : 'bg-gradient-to-br from-fuchsia-400/10 to-transparent'"
                />
                <div class="relative flex items-center gap-3">
                  <div
                    class="flex h-10 w-10 items-center justify-center rounded-2xl"
                    :class="
                      activeTab === tab.key
                        ? 'bg-slate-950/10 text-slate-900'
                        : 'bg-white/8 text-slate-300 group-hover:text-white'
                    "
                  >
                    <Icon :icon="tab.icon" class="h-5 w-5" />
                  </div>
                  <div>
                    <div class="text-sm font-semibold">{{ tab.label }}</div>
                    <div class="text-xs opacity-65">
                      {{ tab.key === 'publish' ? '提交新的过关录像' : '回看已发布记录' }}
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section v-if="activeTab === 'publish'" class="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
      <div class="space-y-5">
        <div class="rounded-[24px] border border-white/10 bg-slate-900/70 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.28)] backdrop-blur-xl">
          <div class="mb-4 flex items-start justify-between gap-4">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300/75">Step 1</p>
              <h3 class="mt-1 text-lg font-bold text-white">选择发布账号</h3>
              <p class="mt-1 text-sm text-slate-400">先确定这条录像属于哪个游戏账号。</p>
            </div>
            <div class="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-3 text-cyan-200">
              <Icon icon="mdi-account-circle-outline" class="h-5 w-5" />
            </div>
          </div>

          <div v-if="!gamesStore.gameList.length" class="rounded-2xl border border-dashed border-amber-400/30 bg-amber-400/8 px-4 py-8 text-center text-sm text-amber-100/85">
            请先在游戏管理页绑定游戏账号，然后再来发布录像。
          </div>
          <div v-else class="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
            <button
              v-for="game in gamesStore.gameList"
              :key="game.status.account"
              class="group relative overflow-hidden rounded-3xl border p-4 text-left transition-all duration-300"
              :class="
                selectedAccount === game.status.account
                  ? 'border-cyan-300/45 bg-cyan-400/12 shadow-[0_16px_40px_rgba(34,211,238,0.12)]'
                  : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]'
              "
              @click="selectAccount(game)"
            >
              <div class="absolute inset-0 bg-gradient-to-br from-cyan-400/12 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div class="relative flex items-center gap-3">
                <img
                  :src="gameAvatarUrl(game.status.avatar)"
                  :alt="game.status.nick_name"
                  class="h-12 w-12 rounded-2xl object-cover ring-1"
                  :class="selectedAccount === game.status.account ? 'ring-cyan-300/50' : 'ring-white/10'"
                  @error="onAvatarError"
                />
                <div class="min-w-0 flex-1">
                  <div class="truncate text-sm font-semibold text-white">{{ game.status.nick_name }}</div>
                  <div class="mt-1 truncate text-xs text-slate-400">{{ game.status.account }}</div>
                </div>
                <div
                  class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all"
                  :class="
                    selectedAccount === game.status.account
                      ? 'border-cyan-300/50 bg-cyan-300/20 text-cyan-100'
                      : 'border-white/10 bg-white/5 text-slate-500'
                  "
                >
                  <Icon :icon="selectedAccount === game.status.account ? 'mdi-check-bold' : 'mdi-plus'" class="h-4 w-4" />
                </div>
              </div>
            </button>
          </div>
        </div>

        <div class="rounded-[24px] border border-white/10 bg-slate-900/70 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.28)] backdrop-blur-xl">
          <div class="mb-4 flex items-start justify-between gap-4">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300/75">Step 2</p>
              <h3 class="mt-1 text-lg font-bold text-white">选择关卡</h3>
              <p class="mt-1 text-sm text-slate-400">搜索关卡代号或名称，快速锁定本次录像对应的关卡。</p>
            </div>
            <div class="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-emerald-200">
              <Icon icon="mdi-map-search-outline" class="h-5 w-5" />
            </div>
          </div>

          <div class="space-y-3">
            <label class="group flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 transition-all duration-300 focus-within:border-emerald-300/40 focus-within:bg-slate-950">
              <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-200">
                <Icon icon="mdi-magnify" class="h-5 w-5" />
              </div>
              <div class="min-w-0 flex-1">
                <div class="text-xs text-slate-500">搜索关卡</div>
                <input
                  v-model="stageKeyword"
                  type="text"
                  class="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                  placeholder="例如 1-7 / 龙门 / 危机合约…"
                />
              </div>
              <button v-if="stageKeyword" class="text-slate-500 transition-colors hover:text-white" @click="stageKeyword = ''">
                <Icon icon="mdi-close" class="h-4 w-4" />
              </button>
            </label>

            <div
              v-if="form.stageId"
              class="flex flex-wrap items-center gap-2 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 px-4 py-3"
            >
              <span class="inline-flex items-center gap-2 rounded-full bg-emerald-300/15 px-3 py-1 text-xs font-semibold text-emerald-100">
                <Icon icon="mdi-check-circle" class="h-4 w-4" />
                已选择：{{ selectedStageLabel }}
              </span>
              <button class="ml-auto text-xs font-medium text-emerald-100/80 transition-colors hover:text-white" @click="clearStage">
                重新选择
              </button>
            </div>

            <div v-if="stageKeyword && Object.keys(filteredStages).length" class="grid gap-2 sm:grid-cols-2">
              <button
                v-for="(stage, key) in filteredStages"
                :key="key"
                class="flex items-start gap-3 rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.06] px-4 py-3 text-left transition-all duration-200 hover:border-emerald-300/35 hover:bg-emerald-400/[0.12]"
                @click="selectStage(String(key))"
              >
                <div class="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-emerald-300/12 text-emerald-200">
                  <Icon icon="mdi-map-marker-radius-outline" class="h-4 w-4" />
                </div>
                <div class="min-w-0">
                  <div class="truncate text-sm font-semibold text-emerald-100">{{ stage.code }}</div>
                  <div class="truncate text-xs text-emerald-100/65">{{ stage.name }}</div>
                </div>
              </button>
            </div>
            <div
              v-else-if="stageKeyword && !Object.keys(filteredStages).length"
              class="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-4 py-5 text-sm text-slate-400"
            >
              未找到匹配关卡，可以尝试换一个关键词。
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-5">
        <div class="rounded-[24px] border border-white/10 bg-slate-900/70 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.28)] backdrop-blur-xl">
          <div class="mb-4 flex items-start justify-between gap-4">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.22em] text-fuchsia-300/75">Step 3</p>
              <h3 class="mt-1 text-lg font-bold text-white">填写录像信息</h3>
              <p class="mt-1 text-sm text-slate-400">让别人快速理解这条录像的亮点和适用场景。</p>
            </div>
            <div class="rounded-2xl border border-fuchsia-400/20 bg-fuchsia-400/10 p-3 text-fuchsia-200">
              <Icon icon="mdi-pencil-ruler-outline" class="h-5 w-5" />
            </div>
          </div>

          <div class="space-y-4">
            <label class="block">
              <div class="mb-2 flex items-center justify-between text-xs text-slate-400">
                <span>标题 <span class="text-rose-300">*</span></span>
                <span>{{ form.title.length }}/80</span>
              </div>
              <input
                v-model="form.title"
                type="text"
                class="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-slate-500 focus:border-fuchsia-300/40"
                placeholder="比如：低练四人稳定通关 / 自动技能轴分享"
                maxlength="80"
              />
            </label>

            <label class="block">
              <div class="mb-2 flex items-center justify-between text-xs text-slate-400">
                <span>描述</span>
                <span>{{ form.description.length }}/500</span>
              </div>
              <textarea
                v-model="form.description"
                class="min-h-[160px] w-full resize-none rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm leading-6 text-white outline-none transition-all placeholder:text-slate-500 focus:border-fuchsia-300/40"
                placeholder="可补充阵容思路、替换位、技能轴、注意事项等内容。"
                maxlength="500"
              />
            </label>
          </div>
        </div>

        <div class="rounded-[24px] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.28)]">
          <div class="flex items-center justify-between gap-4">
            <div>
              <h3 class="text-lg font-bold text-white">发布预览</h3>
              <p class="mt-1 text-sm text-slate-400">确认信息完整后即可提交审核。</p>
            </div>
            <div class="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300">
              {{ publishProgress }} / 3 完成
            </div>
          </div>

          <div class="mt-5 space-y-3">
            <div class="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div class="text-xs text-slate-500">发布账号</div>
              <div class="mt-2 text-sm font-medium text-white">{{ selectedGame?.status.nick_name || '未选择账号' }}</div>
              <div class="mt-1 text-xs text-slate-400">{{ selectedGame?.status.account || '请选择一个游戏账号' }}</div>
            </div>
            <div class="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div class="text-xs text-slate-500">关卡</div>
              <div class="mt-2 text-sm font-medium text-white">{{ selectedStageLabel }}</div>
            </div>
            <div class="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div class="text-xs text-slate-500">标题</div>
              <div class="mt-2 text-sm font-medium text-white">{{ form.title.trim() || '请填写一个清晰的标题' }}</div>
            </div>
          </div>

          <button
            class="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-4 text-sm font-bold text-slate-950 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(255,255,255,0.16)] disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-slate-500 disabled:hover:translate-y-0 disabled:hover:shadow-none"
            :disabled="!canSubmit || isSubmitting"
            @click="onPublish"
          >
            <span v-if="isSubmitting" class="loading loading-spinner loading-sm" />
            <Icon v-else icon="mdi-cloud-upload-outline" class="h-5 w-5" />
            {{ isSubmitting ? '正在提交...' : '发布录像' }}
          </button>
        </div>
      </div>
    </section>

    <section v-else class="space-y-5">
      <div class="grid gap-4 lg:grid-cols-[300px_1fr]">
        <div class="rounded-[24px] border border-white/10 bg-slate-900/70 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.28)] backdrop-blur-xl">
          <div class="flex items-center gap-3">
            <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-fuchsia-400/10 text-fuchsia-200">
              <Icon icon="mdi-history" class="h-5 w-5" />
            </div>
            <div>
              <h3 class="text-lg font-bold text-white">我的历史</h3>
              <p class="text-sm text-slate-400">回看你已经发布过的录像内容。</p>
            </div>
          </div>

          <div class="mt-5 grid gap-3">
            <div class="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div class="text-xs text-slate-500">总录像数</div>
              <div class="mt-2 text-2xl font-bold text-white">{{ store.myRecords.length }}</div>
            </div>
            <div class="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div class="text-xs text-slate-500">搜索命中</div>
              <div class="mt-2 text-2xl font-bold text-white">{{ filteredMyRecords.length }}</div>
            </div>
          </div>
        </div>

        <div class="rounded-[24px] border border-white/10 bg-slate-900/70 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.28)] backdrop-blur-xl">
          <label class="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 transition-all duration-300 focus-within:border-fuchsia-300/40">
            <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-fuchsia-400/10 text-fuchsia-200">
              <Icon icon="mdi-magnify" class="h-5 w-5" />
            </div>
            <div class="min-w-0 flex-1">
              <div class="text-xs text-slate-500">搜索历史记录</div>
              <input
                v-model="historySearch"
                type="text"
                class="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                placeholder="输入关卡 ID 进行筛选"
              />
            </div>
            <button v-if="historySearch" class="text-slate-500 transition-colors hover:text-white" @click="historySearch = ''">
              <Icon icon="mdi-close" class="h-4 w-4" />
            </button>
          </label>

          <div v-if="store.isLoadingMyRecords" class="flex min-h-[320px] items-center justify-center">
            <span class="loading loading-spinner loading-md text-primary" />
          </div>

          <div v-else-if="filteredMyRecords.length" class="mt-5 space-y-3">
            <RecordCard
              v-for="record in filteredMyRecords"
              :key="record.id"
              :record="record"
              :expanded="expandedHistoryId === record.id"
              :show-actions="false"
              @toggle="toggleHistory(record.id)"
            />
          </div>

          <div v-else class="flex min-h-[320px] flex-col items-center justify-center gap-3 text-slate-400">
            <div class="flex h-16 w-16 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.04]">
              <Icon icon="mdi-film-off" class="h-8 w-8 opacity-70" />
            </div>
            <div class="text-sm">{{ historySearch ? '没有找到匹配的录像' : '你还没有发布过录像' }}</div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useReplayStore } from "@/stores/useReplayStore";
import { useGamesStore } from "@/stores/useGamesStore";
import { assets } from "@/shared/services/assets";
import { replayApi } from "@/shared/services/replayClient";
import { setMsg } from "@/shared/utils/toast";
import { Type } from "@/shared/components/toast/enum";
import type { ApiGameGame } from "@/shared/types/api";
import type { ReplayAvatar } from "@/shared/types/replay";
import RecordCard from "./RecordCard.vue";

const store = useReplayStore();
const gamesStore = useGamesStore();

const tabs = [
  { key: "publish" as const, label: "发布录像", icon: "mdi-cloud-upload-outline" },
  { key: "history" as const, label: "我的历史", icon: "mdi-history" },
];
const activeTab = ref<"publish" | "history">("publish");

const selectedAccount = ref<string | null>(null);
const selectedGame = computed(() =>
  gamesStore.gameList.find((g) => g.status.account === selectedAccount.value) ?? null
);

const selectAccount = (game: ApiGameGame) => {
  selectedAccount.value = game.status.account;
};

watch(
  () => gamesStore.gameList,
  (list) => {
    if (list.length && !selectedAccount.value) {
      selectedAccount.value = list[0].status.account;
    }
  },
  { immediate: true }
);

const stageKeyword = ref("");
const filteredStages = computed(() => assets.value.filteredStages(stageKeyword.value));

const form = reactive({
  stageId: "",
  title: "",
  description: "",
});

const selectedStageMeta = computed(() => {
  if (!form.stageId) return null;
  return assets.value.stages.value?.[form.stageId] ?? null;
});

const selectedStageLabel = computed(() => {
  if (selectedStageMeta.value) {
    return `${selectedStageMeta.value.code} ${selectedStageMeta.value.name}`;
  }
  return form.stageId || "未选择关卡";
});

const selectStage = (key: string) => {
  form.stageId = key;
  stageKeyword.value = "";
};

const clearStage = () => {
  form.stageId = "";
};

const isSubmitting = ref(false);

const canSubmit = computed(
  () => !!form.stageId && !!form.title.trim() && !!selectedAccount.value
);

const publishProgress = computed(() => {
  return [!!selectedAccount.value, !!form.stageId, !!form.title.trim()].filter(Boolean).length;
});

const onPublish = async () => {
  if (!canSubmit.value || !selectedGame.value) return;
  isSubmitting.value = true;
  try {
    const game = selectedGame.value;
    await replayApi.publishRecord({
      gameAccount: game.status.account,
      nickName: game.status.nick_name,
      avatar: game.status.avatar as ReplayAvatar,
      stageId: form.stageId,
      sortOrder: 0,
      title: form.title.trim(),
      description: form.description.trim(),
    });
    setMsg("录像已提交，等待审核", Type.Success);
    form.stageId = "";
    form.title = "";
    form.description = "";
  } catch {
    setMsg("发布失败，请重试", Type.Error);
  } finally {
    isSubmitting.value = false;
  }
};

const historySearch = ref("");
const expandedHistoryId = ref<string | null>(null);

const filteredMyRecords = computed(() => {
  const q = historySearch.value.trim().toLowerCase();
  return store.myRecords.filter((r) => !q || r.stageId.toLowerCase().includes(q));
});

const toggleHistory = (id: string) => {
  expandedHistoryId.value = expandedHistoryId.value === id ? null : id;
};

watch(historySearch, () => {
  expandedHistoryId.value = null;
});

const gameAvatarUrl = (avatar: { type: string; id: string }) =>
  `https://assets.ltsc.vip/avatar/${avatar.type}/${avatar.id
    .replace(/@/g, "_")
    .replace(/#/g, "_")}.png`;

const onAvatarError = (e: Event) => {
  (e.target as HTMLImageElement).src = "https://api.dicebear.com/7.x/bottts/svg?seed=fallback";
};

onMounted(() => {
  store.fetchMyRecords(0);
});
</script>
