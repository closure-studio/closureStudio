<template>
  <div>
    <div role="alert" class="rounded border-s-4 border-warning bg-warning/10 p-3 space-y-2 mb-3">
      请在普瑞赛斯指导下使用
    </div>
    <div class="flex">
      <label class="w-full max-w-xs mr-4">
        <div class="label">
          <span>理智保留</span>
        </div>
        <input v-model="config.keeping_ap" type="number" class="input input-sm w-full max-w-xs" />
      </label>
      <label class="w-full max-w-xs">
        <div class="label">
          <span>招募卷保留</span>
        </div>
        <input
          v-model="config.recruit_reserve"
          type="number"
          class="input input-sm w-full max-w-xs"
        />
      </label>
    </div>
    <div class="divider h-0">智能开关</div>
    <div class="grid grid-cols-2 gap-4 h-8">
      <label class="label cursor-pointer mb-4">
        <span>自动基建</span>
        <input
          v-model="config.enable_building_arrange"
          type="checkbox"
          class="toggle toggle-sm"
        />
      </label>

      <label class="label cursor-pointer mb-4">
        <span>自动作战</span>
        <input v-model="config.is_auto_battle" type="checkbox" class="toggle toggle-sm" />
      </label>
    </div>

    <div class="grid grid-cols-2 gap-4 h-8">
      <label class="label cursor-pointer mb-4">
        <span>忽略小车</span>
        <input v-model="config.recruit_ignore_robot" type="checkbox" class="toggle toggle-sm" />
      </label>

      <label class="label cursor-pointer mb-4">
        <span>协助登录</span>
        <input
          :disabled="true"
          v-model="config.allow_login_assist"
          type="checkbox"
          class="toggle toggle-sm"
        />
      </label>
    </div>
    <div class="divider h-2 mt-2">无人机加速</div>
    <BaseDesign
      :slot="config.accelerate_slot"
      @updateSlot="config.accelerate_slot = $event"
    />
    <div class="divider h-2 my-2">作战地图</div>
    <input
      v-model="stageKeyWord"
      class="input input-sm w-full text-center"
      placeholder="-- 请输入代号\名称 --"
    />
    <div class="divider h-0">作战队列</div>
    <div class="flex flex-wrap">
      <template v-for="(stage, key) in assets.filteredStages(stageKeyWord)" :key="key">
        <button
          v-if="!battleMaps.includes(String(key))"
          class="btn btn-outline btn-warning btn-xs m-1 border-dashed opacity-60"
          @click="addStageToConfig(String(key))"
        >
          {{ stage.code }} {{ stage.name }}
        </button>
      </template>
      <button
        @click="removeBattleMap(battleMap)"
        v-for="battleMap in battleMaps"
        :key="battleMap"
        class="btn btn-outline btn-warning btn-xs m-1"
      >
        {{ assets.getStageName(battleMap) }}
      </button>
    </div>
    <button class="btn btn-info btn-block mt-4" :disabled="isLoading" @click="onSubmit">
      <span v-if="isLoading" class="loading loading-bars loading-md"></span>
      递交
    </button>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import { DEFAULT_GAME_CONFIG } from "@/constants/game";
import type { ApiGameConfig, ApiGameGameConfig } from "@/shared/types/api";
import { assets } from "@/services/assets";
import apiClient from "@/services/apiClient";
import { setMsg } from "@/utils/toast";
import { useLoading } from "@/shared/composables/useLoading";
import { useGamesStore } from "@/stores/useGamesStore";
import BaseDesign from "@/components/dashboard/game/config/BaseDesign.vue";
import { Type } from "@/constants/ui";
import { API_RESPONSE_CODE } from "@/constants/api";
import {
  addLoopBattleTask,
  cloneBattleTasks,
  getLoopBattleTasks,
  prepareBattleTasksForSubmit,
  removeLoopBattleTask,
} from "@/utils/battleTasks";

interface Props {
  account: string;
  gameConfig?: ApiGameGameConfig | null;
}

const props = defineProps<Props>();

const gamesStore = useGamesStore();

const cloneConfig = (
  source: Partial<ApiGameGameConfig> | null | undefined
): ApiGameGameConfig => ({
  ...DEFAULT_GAME_CONFIG,
  ...source,
  battle_tasks: cloneBattleTasks(source?.battle_tasks),
});

const config = ref<ApiGameGameConfig>(
  cloneConfig(props.gameConfig ?? gamesStore.findGame(props.account)?.game_config)
);

const { isLoading } = useLoading();
const stageKeyWord = ref("");
const battleMaps = computed(() =>
  getLoopBattleTasks(config.value.battle_tasks).map((task) => task.stage_id)
);

watch(
  () => props.gameConfig,
  (gameConfig) => {
    if (gameConfig) config.value = cloneConfig(gameConfig);
  }
);

const addStageToConfig = (stageCode: string) => {
  config.value.battle_tasks = addLoopBattleTask(config.value.battle_tasks, stageCode);
};

const removeBattleMap = (battleMap: string) => {
  config.value.battle_tasks = removeLoopBattleTask(config.value.battle_tasks, battleMap);
};

const onSubmit = async () => {
  if (isLoading.value) return;
  if (config.value.keeping_ap < 0) {
    setMsg("理智保留不能小于0", Type.Warning);
    return;
  }
  if (config.value.recruit_reserve < 0) {
    setMsg("招募卷保留不能小于0", Type.Warning);
    return;
  }
  const payload: ApiGameConfig = {
    battle_tasks: prepareBattleTasksForSubmit(config.value.battle_tasks),
    keeping_ap: config.value.keeping_ap,
    recruit_reserve: config.value.recruit_reserve,
    recruit_ignore_robot: config.value.recruit_ignore_robot,
    enable_building_arrange: config.value.enable_building_arrange,
    is_auto_battle: config.value.is_auto_battle,
    accelerate_slot: config.value.accelerate_slot,
  };
  isLoading.value = true;
  try {
    const result = await apiClient.doUpdateGameConf(props.account, payload);
    setMsg(result.message, result.code === API_RESPONSE_CODE.SUCCESS ? Type.Success : Type.Error);
  } catch (error) {
    setMsg(String(error), Type.Error);
  } finally {
    isLoading.value = false;
  }
};
</script>
