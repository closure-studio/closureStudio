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
      :slot="config.accelerate_slot_cn"
      @updateSlot="config.accelerate_slot_cn = $event"
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
          v-if="!loopStageIds.has(String(key))"
          class="btn btn-outline btn-warning btn-xs m-1 border-dashed opacity-60"
          @click="addStageToConfig(String(key))"
        >
          {{ stage.code }} {{ stage.name }}
        </button>
      </template>
      <button
        @click="removeBattleMap(task.stage_id)"
        v-for="task in loopBattleTasks"
        :key="task.stage_id"
        class="btn btn-outline btn-warning btn-xs m-1"
      >
        {{ assets.getStageName(task.stage_id) }}
      </button>
    </div>
    <button class="btn btn-info btn-block mt-4" @click="onSubmit">
      <span v-if="isLoading" class="loading loading-bars loading-md"></span>
      递交
    </button>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
import { DEFAULT_GAME_CONFIG } from "@/constants/game";
import type { ApiGameConfig, ApiGameGameConfig } from "@/shared/types/api";
import { assets } from "@/services/assets";
import apiClient from "@/services/apiClient";
import { setMsg } from "@/utils/toast";
import { useLoading } from "@/shared/composables/useLoading";
import { useGamesStore } from "@/stores/useGamesStore";
import BaseDesign from "@/components/dashboard/game/config/BaseDesign.vue";
import { Type } from "@/constants/ui";
import {
  addLoopBattleTask,
  getLoopBattleTasks,
  prepareBattleTasksForSubmit,
  removeLoopBattleTask,
} from "@/utils/battleTasks";

interface Props {
  account: string;
}

const props = defineProps<Props>();

const { account } = props;
const gamesStore = useGamesStore();
const game = gamesStore.findGame(account);
const sourceConfig = game?.game_config ?? DEFAULT_GAME_CONFIG;
const config = ref<ApiGameGameConfig>({
  ...sourceConfig,
  battle_tasks: sourceConfig.battle_tasks.map((task) => ({ ...task })),
});

const { isLoading } = useLoading();
const stageKeyWord = ref("");
const loopBattleTasks = computed(() => getLoopBattleTasks(config.value.battle_tasks));
const loopStageIds = computed(
  () => new Set(loopBattleTasks.value.map((task) => task.stage_id))
);

const addStageToConfig = (stageCode: string) => {
  config.value.battle_tasks = addLoopBattleTask(config.value.battle_tasks, stageCode);
};

const removeBattleMap = (battleMap: string) => {
  config.value.battle_tasks = removeLoopBattleTask(config.value.battle_tasks, battleMap);
};

const onSubmit = async () => {
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
    accelerate_slot_cn: config.value.accelerate_slot_cn,
  };
  isLoading.value = true;
  try {
    const result = await apiClient.doUpdateGameConf(account, payload);
    setMsg(result.message, Type.Info);
  } catch (error) {
    setMsg(String(error), Type.Error);
  } finally {
    isLoading.value = false;
  }
};
</script>
