<template>
  <div class="replay-broadcast min-h-full flex flex-col gap-1 p-0 lg:gap-6 lg:p-6">
    <!-- 1. 游戏选择器（emit 模式：不进行路由跳转） -->
    <GameSelector
      v-model:account="account"
      :game-list="gamesStore.gameList"
      mode="emit"
    />

    <!-- 2. 主内容区：移动端垂直堆叠，桌面端 2 列 grid block -->
    <div class="flex flex-col lg:grid lg:grid-cols-2 gap-1 lg:gap-6">
      <!-- 当前已有的分享/作战队列（前端维护数组） -->
      <div class="s-card lg:order-1 lg:col-span-2">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-xl font-bold">当前作战队列</h2>
          <button
            class="btn btn-ghost btn-xs"
            :disabled="!account || isLoadingExisting"
            @click="loadExistingActions"
          >
            <span v-if="isLoadingExisting" class="loading loading-spinner loading-xs"></span>
            刷新
          </button>
        </div>

        <div v-if="!account" class="text-sm text-base-content/55">未选择账号</div>
        <div v-else-if="isLoadingExisting && !existingActions.length" class="text-sm text-base-content/55">
          加载中...
        </div>
        <div v-else-if="existingActions.length" class="flex flex-wrap">
          <div
            v-for="(action, idx) in existingActions"
            :key="`${action.action_type}-${action.stage_id}-${action.uuid}-${idx}`"
            class="badge badge-outline gap-1 m-1 py-3"
            :class="action.action_type === 'SHARE' ? 'badge-info' : 'badge-success'"
          >
            <span class="font-semibold">{{ action.action_type === "SHARE" ? "分享" : "作战" }}</span>
            <span>{{ assets.getStageName(action.stage_id) }}</span>
            <span v-if="action.uuid" class="opacity-60 text-[10px]">
              · {{ action.uuid.slice(0, 6) }}
            </span>
          </div>
        </div>
        <div v-else class="text-sm text-base-content/55">当前账号没有待执行的动作</div>
      </div>

      <!-- 热门作战地图 -->
      <div class="s-card lg:order-2">
        <h2 class="text-xl font-bold mb-4">热门作战地图</h2>
        <HotStagesPanel :selected="selectedStageIds" @toggle="toggleStage" />
        <p class="mt-3 text-xs text-base-content/55">点击即可加入/移除分享队列</p>
      </div>

      <!-- 分享作战记录表单 -->
      <div class="s-card lg:order-3">
        <h2 class="text-xl font-bold mb-4">分享作战记录</h2>

        <!-- 关卡选择器（关键词搜索 + 已选展示） -->
        <input
          v-model="stageKeyword"
          class="input input-sm w-full text-center"
          placeholder="-- 搜索关卡代号/名称 --"
        />
        <div v-if="filteredStageEntries.length" class="flex flex-wrap mt-2">
          <button
            v-for="[key, stage] in filteredStageEntries"
            :key="key"
            class="btn btn-outline btn-info btn-xs m-1 border-dashed opacity-70"
            @click="addStage(key)"
          >
            {{ stage.code }} {{ stage.name }}
          </button>
        </div>

        <div v-if="selectedStageIds.length" class="divider h-0 mt-3">已选 {{ selectedStageIds.length }} 关</div>
        <div v-if="selectedStageIds.length" class="flex flex-wrap">
          <button
            v-for="stageId in selectedStageIds"
            :key="stageId"
            class="btn btn-info btn-xs m-1"
            @click="removeStage(stageId)"
          >
            {{ assets.getStageName(stageId) }} ✕
          </button>
        </div>

        <!-- 仅前端展示（占位待后续接入） -->
        <label class="form-control w-full mt-4">
          <div class="label">
            <span>标题</span>
            <span class="text-xs opacity-60">仅本地展示</span>
          </div>
          <input
            v-model="title"
            type="text"
            class="input input-sm w-full"
            placeholder="给本次分享一个标题"
          />
        </label>
        <label class="form-control w-full mt-3">
          <div class="label">
            <span>描述</span>
            <span class="text-xs opacity-60">仅本地展示</span>
          </div>
          <textarea
            v-model="description"
            class="textarea textarea-sm w-full"
            placeholder="可填可不填"
            rows="3"
          ></textarea>
        </label>

        <button
          class="btn btn-info btn-block mt-4"
          :disabled="!canSubmit || isLoading"
          @click="onSubmit"
        >
          <span v-if="isLoading" class="loading loading-bars loading-md"></span>
          递交
        </button>
        <p v-if="!account" class="mt-2 text-xs text-warning">请先选择一个托管账号</p>
        <p v-else-if="!selectedStageIds.length" class="mt-2 text-xs text-base-content/55">
          请至少选择一个作战地图
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
@media (max-width: 767px) {
  .replay-broadcast :deep(.s-card) {
    padding: 0.75rem;
  }
}
</style>

<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import GameSelector from "@/components/game/GameSelector.vue";
import HotStagesPanel from "@/components/replay/HotStagesPanel.vue";
import { assets } from "@/services/assets";
import apiClient from "@/services/apiClient";
import { setMsg } from "@/utils/toast";
import { Type } from "@/constants/ui";
import { useGamesStore } from "@/stores/useGamesStore";
import type { ApiGameConfig } from "@/shared/types/api";
import type { BattleReplayAction } from "@/shared/types/replay";

const gamesStore = useGamesStore();

// 由 watch(immediate) 同步首个账号
const account = ref<string>("");

// 当前账号已有的 battle_replay_actions（前端维护数组，需展示给用户）
const existingActions = ref<BattleReplayAction[]>([]);
const isLoadingExisting = ref(false);

const loadExistingActions = async () => {
  if (!account.value) {
    existingActions.value = [];
    return;
  }
  isLoadingExisting.value = true;
  try {
    const res = await apiClient.fetchGameDetails(account.value);
    existingActions.value = res.data?.config?.battle_replay_actions ?? [];
  } catch (error) {
    setMsg(`加载已有动作失败: ${String(error)}`, Type.Warning);
    existingActions.value = [];
  } finally {
    isLoadingExisting.value = false;
  }
};

// 当账号列表变化时，确保选中账号仍存在
watch(
  () => gamesStore.gameList.map((g) => g.status.account),
  (accounts) => {
    if (!accounts.length) {
      account.value = "";
      return;
    }
    if (!accounts.includes(account.value)) {
      account.value = accounts[0];
    }
  },
  { immediate: true }
);

// 当选中账号变化时，加载该账号已有的动作队列
watch(account, () => loadExistingActions(), { immediate: true });

const stageKeyword = ref("");
const selectedStageIds = ref<string[]>([]);
const title = ref("");
const description = ref("");
const isLoading = ref(false);

// 搜索结果（沿用 assets.filteredStages 的实现），并过滤掉已选关卡
const filteredStageEntries = computed(() => {
  const map = assets.value.filteredStages(stageKeyword.value);
  return Object.entries(map).filter(([key]) => !selectedStageIds.value.includes(key));
});

const canSubmit = computed(() => Boolean(account.value) && selectedStageIds.value.length > 0);

const addStage = (stageId: string) => {
  if (!selectedStageIds.value.includes(stageId)) {
    selectedStageIds.value = [...selectedStageIds.value, stageId];
  }
};

const removeStage = (stageId: string) => {
  selectedStageIds.value = selectedStageIds.value.filter((id) => id !== stageId);
};

const toggleStage = (stageId: string) => {
  if (selectedStageIds.value.includes(stageId)) {
    removeStage(stageId);
  } else {
    addStage(stageId);
  }
};

const onSubmit = async () => {
  if (!canSubmit.value) return;
  isLoading.value = true;
  try {
    // 1. 取最新配置，提取已有的 battle_replay_actions（前端维护数组）
    const detailRes = await apiClient.fetchGameDetails(account.value);
    const existing: BattleReplayAction[] = detailRes.data?.config?.battle_replay_actions ?? [];

    // 2. 为每个选中的关卡追加一条 SHARE 动作（uuid 留空）
    const appended: BattleReplayAction[] = selectedStageIds.value.map((stage_id) => ({
      stage_id,
      uuid: "",
      action_type: "SHARE",
    }));

    // 3. 仅传入 battle_replay_actions 这一个字段
    const merged: BattleReplayAction[] = [...existing, ...appended];
    const payload: ApiGameConfig = { battle_replay_actions: merged };
    const result = await apiClient.doUpdateGameConf(account.value, payload);
    setMsg(result.message ?? "已递交分享请求", Type.Success);

    // 4. 同步本地展示 + 重置表单
    existingActions.value = merged;
    selectedStageIds.value = [];
    title.value = "";
    description.value = "";
    stageKeyword.value = "";
  } catch (error) {
    setMsg(String(error), Type.Error);
  } finally {
    isLoading.value = false;
  }
};
</script>
