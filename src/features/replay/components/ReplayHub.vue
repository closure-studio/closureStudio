<template>
  <div class="space-y-3 p-0 md:space-y-5 md:p-2">
    <section class="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-3 shadow-[0_24px_80px_rgba(15,23,42,0.42)] md:rounded-[28px] md:p-5">
      <div class="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div class="space-y-4">
          <div class="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100">
            <Icon icon="mdi-television-play" class="h-4 w-4" />
            Replay Hub
          </div>

          <div>
            <h2 class="text-2xl font-black tracking-tight text-white sm:text-3xl">
              公共作战录像
            </h2>
            <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-300/78">
              只展示服务端校验通过且未隐藏的 replay。支持按关卡筛选，并将任意条目追加为自动作战动作。
            </p>
          </div>

          <label class="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3">
            <Icon icon="mdi-magnify" class="h-5 w-5 text-cyan-200" />
            <input
              v-model="stageFilter"
              type="text"
              class="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
              placeholder="输入关卡 ID，例如 main_01-07"
              @keyup.enter="applyFilter"
            />
            <button class="btn btn-sm border-cyan-300/25 bg-cyan-400/10 text-cyan-100 hover:bg-cyan-300/15" @click="applyFilter">
              查询
            </button>
          </label>
        </div>

        <div class="rounded-2xl border border-white/10 bg-white/[0.03] p-3 md:rounded-3xl md:p-4">
          <div class="flex items-center justify-between gap-3">
            <div>
              <div class="text-sm font-semibold text-white">自动作战目标账号</div>
              <div class="mt-1 text-xs leading-5 text-slate-400">
                选择一个托管账号后，列表卡片里的“追加自动作战”会把动作写入
                `battle_replay_actions`。
              </div>
            </div>
            <div class="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-3 text-cyan-100">
              <Icon icon="mdi-robot-outline" class="h-5 w-5" />
            </div>
          </div>

          <div v-if="accounts.length" class="mt-4 flex flex-wrap gap-2">
            <button
              v-for="account in accounts"
              :key="account.account"
              class="rounded-2xl border px-3 py-2 text-left text-sm transition-all"
              :class="
                replayStore.selectedAccount === account.account
                  ? 'border-cyan-300/45 bg-cyan-400/12 text-cyan-100'
                  : 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20'
              "
              @click="replayStore.setSelectedAccount(account.account)"
            >
              <div class="font-semibold">{{ account.nickname }}</div>
              <div class="text-xs opacity-70">{{ account.account }}</div>
            </button>
          </div>
          <div v-else class="mt-4 rounded-2xl border border-dashed border-amber-300/25 bg-amber-400/10 px-4 py-4 text-sm text-amber-100">
            当前没有可下发动作的托管账号，请先在游戏管理页绑定账号。
          </div>
        </div>
      </div>
    </section>

    <section class="space-y-2 md:space-y-3">
      <div v-if="replayStore.isLoadingPublicReplays && !replayStore.publicReplays.length" class="flex justify-center py-12">
        <span class="loading loading-spinner loading-md text-info" />
      </div>

      <template v-else-if="replayStore.publicReplays.length">
        <RecordCard
          v-for="record in replayStore.publicReplays"
          :key="record.uuid"
          :record="record"
          :stage-name="stageName(record.stage_id)"
          :expanded="expandedId === record.uuid"
          :show-auto-battle="Boolean(replayStore.selectedAccount)"
          :is-acting="actionReplayUuid === record.uuid"
          @toggle="toggle(record.uuid)"
          @auto-battle="enqueueAutoBattle(record.uuid)"
        />

        <div class="flex justify-center pt-3">
          <button
            v-if="replayStore.publicHasMore"
            class="btn border-cyan-300/25 bg-cyan-400/10 text-cyan-100 hover:bg-cyan-300/15"
            :disabled="replayStore.isLoadingPublicReplays"
            @click="replayStore.fetchMorePublicReplays()"
          >
            <span v-if="replayStore.isLoadingPublicReplays" class="loading loading-spinner loading-sm" />
            加载更多
          </button>
        </div>
      </template>

      <div v-else class="rounded-3xl border border-dashed border-white/10 bg-white/[0.03] px-4 py-12 text-center text-sm text-slate-400">
        当前没有匹配的公共 replay。
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { computed, onMounted, ref, watch } from "vue";
import RecordCard from "./RecordCard.vue";
import { assets } from "@/shared/services/assets";
import { setMsg } from "@/shared/utils/toast";
import { Type } from "@/constants/toast";
import { useGamesStore } from "@/stores/useGamesStore";
import { useReplayStore } from "@/stores/useReplayStore";

const replayStore = useReplayStore();
const gamesStore = useGamesStore();

const stageFilter = ref(replayStore.publicStageId);
const expandedId = ref("");
const actionReplayUuid = ref("");

const accounts = computed(() =>
  gamesStore.gameList.map((game) => ({
    account: game.status.account,
    nickname: game.status.nick_name || game.status.account,
  }))
);

watch(
  accounts,
  (list) => {
    replayStore.syncSelectedAccount(list.map((item) => item.account));
  },
  { immediate: true }
);

const stageName = (stageId: string) => assets.value.getStageName(stageId);

const applyFilter = async () => {
  expandedId.value = "";
  await replayStore.fetchPublicReplays(stageFilter.value.trim());
};

const toggle = (uuid: string) => {
  expandedId.value = expandedId.value === uuid ? "" : uuid;
};

const enqueueAutoBattle = async (uuid: string) => {
  if (!replayStore.selectedAccount) {
    setMsg("请先选择一个托管账号", Type.Warning);
    return;
  }

  const replay = replayStore.publicReplays.find((item) => item.uuid === uuid);
  if (!replay) return;

  actionReplayUuid.value = uuid;
  try {
    await replayStore.enqueueAutoBattleAction(replayStore.selectedAccount, replay);
  } finally {
    actionReplayUuid.value = "";
  }
};

onMounted(async () => {
  if (!replayStore.publicReplays.length) {
    await replayStore.fetchPublicReplays(stageFilter.value.trim());
  }
});
</script>
