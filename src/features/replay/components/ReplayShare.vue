<template>
  <div class="space-y-5 p-2">
    <section class="rounded-[28px] border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.42)]">
      <div class="grid gap-5 xl:grid-cols-[1fr_0.95fr]">
        <div class="space-y-4">
          <div class="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-100">
            <Icon icon="mdi-share-variant-outline" class="h-4 w-4" />
            Replay Actions
          </div>
          <div>
            <h2 class="text-2xl font-black tracking-tight text-white sm:text-3xl">
              动作下发与结果记录
            </h2>
            <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-300/78">
              Battle Replay 不再直接创建前端“发布”接口，而是通过 `battle_replay_actions`
              追加动作。当前后端不会自动清空旧动作，也不会按 `uuid` 或 `stage_id` 去重。
            </p>
          </div>

          <div v-if="accounts.length" class="flex flex-wrap gap-2">
            <button
              v-for="account in accounts"
              :key="account.account"
              class="rounded-2xl border px-3 py-2 text-left text-sm transition-all"
              :class="
                replayStore.selectedAccount === account.account
                  ? 'border-emerald-300/45 bg-emerald-400/12 text-emerald-100'
                  : 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20'
              "
              @click="switchAccount(account.account)"
            >
              <div class="font-semibold">{{ account.nickname }}</div>
              <div class="text-xs opacity-70">{{ account.account }}</div>
            </button>
          </div>
          <div v-else class="rounded-2xl border border-dashed border-amber-300/25 bg-amber-400/10 px-4 py-4 text-sm text-amber-100">
            没有托管账号，暂时无法追加 replay 动作。
          </div>
        </div>

        <div class="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
          <div class="flex items-start justify-between gap-4">
            <div>
              <div class="text-sm font-semibold text-white">追加 SHARE 动作</div>
              <div class="mt-1 text-xs leading-5 text-slate-400">
                选择关卡后会向 `/game/config/:account` 追加一个 `SHARE` 动作。
              </div>
            </div>
            <div class="rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-3 text-emerald-100">
              <Icon icon="mdi-map-search-outline" class="h-5 w-5" />
            </div>
          </div>

          <label class="mt-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3">
            <Icon icon="mdi-magnify" class="h-5 w-5 text-emerald-200" />
            <input
              v-model="stageKeyword"
              type="text"
              class="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
              placeholder="搜索关卡代号或名称"
            />
          </label>

          <div
            v-if="selectedStageId"
            class="mt-4 flex flex-wrap items-center gap-2 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 px-4 py-3"
          >
            <span class="inline-flex items-center gap-2 rounded-full bg-emerald-300/15 px-3 py-1 text-xs font-semibold text-emerald-100">
              <Icon icon="mdi-check-circle" class="h-4 w-4" />
              已选择：{{ selectedStageLabel }}
            </span>
            <button class="ml-auto text-xs font-medium text-emerald-100/80 transition-colors hover:text-white" @click="selectedStageId = ''">
              清空
            </button>
          </div>

          <div v-if="stageKeyword && Object.keys(filteredStages).length" class="mt-4 grid gap-2">
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

          <button
            class="btn mt-5 w-full border-emerald-300/25 bg-emerald-400/10 text-emerald-100 hover:bg-emerald-300/15"
            :disabled="!canAppendShare || isSubmittingShare"
            @click="appendShareAction"
          >
            <span v-if="isSubmittingShare" class="loading loading-spinner loading-sm" />
            <Icon v-else icon="mdi-plus-circle-outline" class="h-5 w-5" />
            追加 SHARE 动作
          </button>
        </div>
      </div>
    </section>

    <section class="rounded-[28px] border border-white/10 bg-slate-900/75 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.28)]">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 class="text-xl font-bold text-white">自动作战结果</h3>
          <p class="mt-1 text-sm text-slate-400">
            按账号拉取 `/game/replays/autoResults/:account`，用于确认 `AUTO_BATTLE` 执行状态。
          </p>
        </div>
        <button
          class="btn border-cyan-300/25 bg-cyan-400/10 text-cyan-100 hover:bg-cyan-300/15"
          :disabled="!replayStore.selectedAccount || replayStore.isLoadingAutoResults"
          @click="replayStore.fetchAutoResults(replayStore.selectedAccount)"
        >
          <span v-if="replayStore.isLoadingAutoResults" class="loading loading-spinner loading-sm" />
          手动刷新
        </button>
      </div>

      <div v-if="replayStore.isLoadingAutoResults && !replayStore.autoResults.length" class="flex justify-center py-12">
        <span class="loading loading-spinner loading-md text-info" />
      </div>

      <div v-else-if="replayStore.autoResults.length" class="mt-5 space-y-3">
        <article
          v-for="result in replayStore.autoResults"
          :key="result.id"
          class="rounded-3xl border border-white/10 bg-white/[0.03] p-4"
        >
          <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div class="space-y-2">
              <div class="flex flex-wrap items-center gap-2">
                <span class="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-100">
                  {{ result.stage_id }}
                </span>
                <span class="badge badge-sm border-0" :class="resultBadgeClass(result.result)">
                  {{ resultLabel(result.result) }}
                </span>
              </div>
              <div class="text-base font-semibold text-white">{{ stageName(result.stage_id) }}</div>
              <div class="text-sm text-slate-300">{{ result.message || "暂无执行消息" }}</div>
            </div>

            <div class="space-y-1 text-xs text-slate-400 md:text-right">
              <div>账号：{{ result.account }}</div>
              <div>Replay UUID：{{ result.replay_uuid }}</div>
              <div>记录时间：{{ formatTime(result.created_at, "yyyy-MM-dd HH:mm") }}</div>
            </div>
          </div>
        </article>

        <div class="flex justify-center pt-3">
          <button
            v-if="replayStore.autoResultsHasMore"
            class="btn border-cyan-300/25 bg-cyan-400/10 text-cyan-100 hover:bg-cyan-300/15"
            :disabled="replayStore.isLoadingAutoResults"
            @click="replayStore.fetchMoreAutoResults()"
          >
            <span v-if="replayStore.isLoadingAutoResults" class="loading loading-spinner loading-sm" />
            加载更多
          </button>
        </div>
      </div>

      <div v-else class="mt-5 rounded-3xl border border-dashed border-white/10 bg-white/[0.03] px-4 py-12 text-center text-sm text-slate-400">
        当前账号还没有自动作战结果。
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { computed, onMounted, ref, watch } from "vue";
import { assets } from "@/shared/services/assets";
import { formatTime } from "@/shared/utils/format";
import type { ReplayAutoResultStatus } from "@/shared/types/replay";
import { useGamesStore } from "@/stores/useGamesStore";
import { useReplayStore } from "@/stores/useReplayStore";

const replayStore = useReplayStore();
const gamesStore = useGamesStore();

const stageKeyword = ref("");
const selectedStageId = ref("");
const isSubmittingShare = ref(false);

const accounts = computed(() =>
  gamesStore.gameList.map((game) => ({
    account: game.status.account,
    nickname: game.status.nick_name || game.status.account,
  }))
);

const filteredStages = computed(() => assets.value.filteredStages(stageKeyword.value));

const selectedStageLabel = computed(() => {
  if (!selectedStageId.value) return "未选择关卡";
  const stage = assets.value.stages.value[selectedStageId.value];
  return stage ? `${stage.code} ${stage.name}` : selectedStageId.value;
});

const canAppendShare = computed(() => Boolean(replayStore.selectedAccount && selectedStageId.value));

watch(
  accounts,
  async (list) => {
    replayStore.syncSelectedAccount(list.map((item) => item.account));
    if (!replayStore.selectedAccount || replayStore.autoResultsAccount === replayStore.selectedAccount) {
      return;
    }
    await replayStore.fetchAutoResults(replayStore.selectedAccount);
  },
  { immediate: true }
);

const stageName = (stageId: string) => assets.value.getStageName(stageId);

const selectStage = (stageId: string) => {
  selectedStageId.value = stageId;
  stageKeyword.value = "";
};

const switchAccount = async (account: string) => {
  replayStore.setSelectedAccount(account);
  await replayStore.fetchAutoResults(account);
};

const appendShareAction = async () => {
  if (!canAppendShare.value) return;
  isSubmittingShare.value = true;
  try {
    await replayStore.enqueueShareAction(replayStore.selectedAccount, selectedStageId.value);
    selectedStageId.value = "";
  } finally {
    isSubmittingShare.value = false;
  }
};

const resultLabel = (result: ReplayAutoResultStatus) => {
  switch (result) {
    case "SUCCESS":
      return "执行成功";
    case "FAILED":
      return "执行失败";
    case "TIMEOUT":
      return "执行超时";
    default:
      return "其他异常";
  }
};

const resultBadgeClass = (result: ReplayAutoResultStatus) => {
  switch (result) {
    case "SUCCESS":
      return "bg-emerald-500/15 text-emerald-100";
    case "FAILED":
      return "bg-rose-500/15 text-rose-200";
    case "TIMEOUT":
      return "bg-amber-400/15 text-amber-100";
    default:
      return "bg-slate-700 text-slate-100";
  }
};

onMounted(async () => {
  if (replayStore.selectedAccount && !replayStore.autoResults.length) {
    await replayStore.fetchAutoResults(replayStore.selectedAccount);
  }
});
</script>
