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
          v-if="!config.battle_maps.includes(String(key))"
          class="btn btn-outline btn-warning btn-xs m-1 border-dashed opacity-60"
          @click="addStageToConfig(String(key))"
        >
          {{ stage.code }} {{ stage.name }}
        </button>
      </template>
      <button
        @click="removeBattleMap(battleMap)"
        v-for="battleMap in config.battle_maps"
        :key="battleMap"
        class="btn btn-outline btn-warning btn-xs m-1"
      >
        {{ assets.getStageName(battleMap) }}
      </button>
    </div>
    <button class="btn btn-info btn-block mt-4" @click="onSubmit">
      <span v-if="isLoading" class="loading loading-bars loading-md"></span>
      递交
    </button>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { DEFAULT_GAME_CONFIG } from "@/constants/game";
import type { ApiGameGameConfig } from "@/shared/types/api";
import { assets } from "@/shared/services/assets";
import apiClient from "@/shared/services/apiClient";
import { setMsg } from "@/shared/utils/toast";
import { useLoading } from "@/shared/composables/useLoading";
import { useGamesStore } from "@/stores/useGamesStore";
import BaseDesign from "@/features/games/components/BaseDesign.vue";
import { Type } from "@/constants/toast";

interface Props {
  account: string;
}

const props = defineProps<Props>();

const { account } = props;
const gamesStore = useGamesStore();
const game = gamesStore.findGame(account);
const config = ref<ApiGameGameConfig>(
  game?.game_config || { ...DEFAULT_GAME_CONFIG, battle_maps: [...DEFAULT_GAME_CONFIG.battle_maps] }
);

const { isLoading } = useLoading();
const stageKeyWord = ref("");

const addStageToConfig = (stageCode: string) => {
  if (!config.value.battle_maps.includes(stageCode)) {
    config.value.battle_maps.unshift(stageCode);
  }
};

const removeBattleMap = (battleMap: string) => {
  config.value.battle_maps = config.value.battle_maps.filter((item: string) => item !== battleMap);
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
  const copyConfig = JSON.parse(JSON.stringify(config.value));
  delete copyConfig.is_stopped;
  delete copyConfig.map_id;
  delete copyConfig.accelerate_slot;
  delete copyConfig.account;
  delete copyConfig.battle_replay_actions;
  isLoading.value = true;
  try {
    const result = await apiClient.doUpdateGameConf(account, copyConfig);
    setMsg(result.message, Type.Info);
  } catch (error) {
    setMsg(String(error), Type.Error);
  } finally {
    isLoading.value = false;
  }
};
</script>
