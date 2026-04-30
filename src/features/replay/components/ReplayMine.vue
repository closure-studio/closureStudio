<template>
  <div class="space-y-5 p-2">
    <section class="rounded-[28px] border border-white/10 bg-slate-900/75 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.28)]">
      <div class="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <div class="inline-flex items-center gap-2 rounded-full border border-fuchsia-300/20 bg-fuchsia-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-fuchsia-100">
            <Icon icon="mdi-video-outline" class="h-4 w-4" />
            My Replays
          </div>
          <h2 class="mt-3 text-2xl font-black text-white">我的录像</h2>
          <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-300/78">
            按账号查看自己的 replay，支持修改标题、描述和隐藏状态，并可直接追加自动作战动作。
          </p>
        </div>

        <label class="flex min-w-[280px] items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3">
          <Icon icon="mdi-magnify" class="h-5 w-5 text-fuchsia-200" />
          <input
            v-model="keyword"
            type="text"
            class="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
            placeholder="搜索关卡 ID 或标题"
          />
        </label>
      </div>

      <div class="mt-5">
        <div v-if="accounts.length" class="flex flex-wrap gap-2">
          <button
            v-for="account in accounts"
            :key="account.account"
            class="rounded-2xl border px-3 py-2 text-left text-sm transition-all"
            :class="
              replayStore.selectedAccount === account.account
                ? 'border-fuchsia-300/45 bg-fuchsia-400/12 text-fuchsia-100'
                : 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20'
            "
            @click="switchAccount(account.account)"
          >
            <div class="font-semibold">{{ account.nickname }}</div>
            <div class="text-xs opacity-70">{{ account.account }}</div>
          </button>
        </div>
        <div v-else class="rounded-2xl border border-dashed border-amber-300/25 bg-amber-400/10 px-4 py-4 text-sm text-amber-100">
          没有可用账号，暂时无法查询“我的录像”。
        </div>
      </div>

      <div class="mt-5 flex flex-wrap gap-2">
        <button
          v-for="item in filterOptions"
          :key="item.value"
          class="btn btn-sm border-white/10 bg-white/[0.03] text-slate-200 hover:bg-white/[0.08]"
          :class="{ 'border-fuchsia-300/30 bg-fuchsia-400/12 text-fuchsia-100': activeFilter === item.value }"
          @click="activeFilter = item.value"
        >
          {{ item.label }}
          <span class="badge badge-xs border-0 bg-white/10 text-slate-200">{{ countByFilter(item.value) }}</span>
        </button>
      </div>
    </section>

    <section class="space-y-3">
      <div v-if="replayStore.isLoadingMyReplays && !replayStore.myReplays.length" class="flex justify-center py-12">
        <span class="loading loading-spinner loading-md text-info" />
      </div>

      <template v-else-if="visibleReplays.length">
        <RecordCard
          v-for="record in visibleReplays"
          :key="record.uuid"
          :record="record"
          :stage-name="stageName(record.stage_id)"
          :expanded="expandedId === record.uuid"
          :show-auto-battle="Boolean(replayStore.selectedAccount)"
          :show-edit="true"
          :is-acting="actionReplayUuid === record.uuid"
          :is-saving="savingReplayUuid === record.uuid"
          @toggle="toggle(record.uuid)"
          @auto-battle="enqueueAutoBattle(record.uuid)"
          @save="(payload) => saveReplay(record.uuid, payload)"
        />

        <div class="flex justify-center pt-3">
          <button
            v-if="replayStore.myHasMore"
            class="btn border-fuchsia-300/25 bg-fuchsia-400/10 text-fuchsia-100 hover:bg-fuchsia-300/15"
            :disabled="replayStore.isLoadingMyReplays"
            @click="replayStore.fetchMoreMyReplays()"
          >
            <span v-if="replayStore.isLoadingMyReplays" class="loading loading-spinner loading-sm" />
            加载更多
          </button>
        </div>
      </template>

      <div v-else class="rounded-3xl border border-dashed border-white/10 bg-white/[0.03] px-4 py-12 text-center text-sm text-slate-400">
        当前筛选条件下没有 replay。
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
import { Type } from "@/shared/components/toast/enum";
import type { ReplayValidationStatus, UpdateReplayPayload } from "@/shared/types/replay";
import { useGamesStore } from "@/stores/useGamesStore";
import { useReplayStore } from "@/stores/useReplayStore";

type MineFilter = "all" | ReplayValidationStatus | "hidden";

const replayStore = useReplayStore();
const gamesStore = useGamesStore();

const keyword = ref("");
const activeFilter = ref<MineFilter>("all");
const expandedId = ref("");
const actionReplayUuid = ref("");
const savingReplayUuid = ref("");

const accounts = computed(() =>
  gamesStore.gameList.map((game) => ({
    account: game.status.account,
    nickname: game.status.nick_name || game.status.account,
  }))
);

const filterOptions: { value: MineFilter; label: string }[] = [
  { value: "all", label: "全部" },
  { value: "PENDING", label: "待校验" },
  { value: "PASSED", label: "已通过" },
  { value: "FAILED", label: "已失败" },
  { value: "hidden", label: "已隐藏" },
];

watch(
  accounts,
  async (list) => {
    replayStore.syncSelectedAccount(list.map((item) => item.account));
    if (!replayStore.selectedAccount || replayStore.myAccount === replayStore.selectedAccount) {
      return;
    }
    await replayStore.fetchMyReplays(replayStore.selectedAccount);
  },
  { immediate: true }
);

const countByFilter = (filter: MineFilter) => {
  if (filter === "all") return replayStore.myReplays.length;
  if (filter === "hidden") return replayStore.myReplays.filter((item) => item.is_hidden).length;
  return replayStore.myReplays.filter((item) => item.validation_status === filter).length;
};

const visibleReplays = computed(() => {
  const query = keyword.value.trim().toLowerCase();
  return replayStore.myReplays.filter((item) => {
    const matchesFilter =
      activeFilter.value === "all"
        ? true
        : activeFilter.value === "hidden"
          ? item.is_hidden
          : item.validation_status === activeFilter.value;
    const matchesKeyword =
      !query ||
      item.stage_id.toLowerCase().includes(query) ||
      item.title.toLowerCase().includes(query);
    return matchesFilter && matchesKeyword;
  });
});

const stageName = (stageId: string) => assets.value.getStageName(stageId);

const toggle = (uuid: string) => {
  expandedId.value = expandedId.value === uuid ? "" : uuid;
};

const switchAccount = async (account: string) => {
  replayStore.setSelectedAccount(account);
  expandedId.value = "";
  await replayStore.fetchMyReplays(account);
};

const enqueueAutoBattle = async (uuid: string) => {
  if (!replayStore.selectedAccount) {
    setMsg("请先选择一个托管账号", Type.Warning);
    return;
  }

  const replay = replayStore.myReplays.find((item) => item.uuid === uuid);
  if (!replay) return;

  actionReplayUuid.value = uuid;
  try {
    await replayStore.enqueueAutoBattleAction(replayStore.selectedAccount, replay);
  } finally {
    actionReplayUuid.value = "";
  }
};

const saveReplay = async (uuid: string, payload: UpdateReplayPayload) => {
  savingReplayUuid.value = uuid;
  try {
    await replayStore.updateReplay(uuid, payload);
  } finally {
    savingReplayUuid.value = "";
  }
};

onMounted(async () => {
  if (replayStore.selectedAccount && !replayStore.myReplays.length) {
    await replayStore.fetchMyReplays(replayStore.selectedAccount);
  }
});
</script>
