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
        <span>自动加工</span>
        <input
          v-model="config.enable_workshop"
          type="checkbox"
          class="toggle toggle-sm"
        />
      </label>
    </div>
    <section :aria-labelledby="autoLoginHeadingId" :aria-busy="autoLoginAction !== null">
      <h3 :id="autoLoginHeadingId" class="divider h-2 mt-2">掉线自动登录</h3>
      <div class="flex min-w-0 items-center gap-2">
        <button
          ref="renewAutoLoginButton"
          type="button"
          class="btn btn-outline btn-info btn-sm min-w-0 flex-1 flex-nowrap aria-disabled:cursor-not-allowed aria-disabled:opacity-60"
          :aria-disabled="autoLoginAction !== null || !canRenew"
          :title="autoLoginTitle"
          @click="onRenewAutoLogin"
        >
          <span
            v-if="autoLoginAction === 'renew'"
            class="loading loading-spinner loading-xs shrink-0"
            aria-hidden="true"
          ></span>
          <span class="min-w-0 truncate">{{ renewButtonText }}</span>
        </button>
        <button
          v-if="autoLoginEnabled"
          ref="disableAutoLoginButton"
          type="button"
          class="btn btn-outline btn-error btn-xs min-h-8 shrink-0 aria-disabled:cursor-not-allowed aria-disabled:opacity-60"
          :aria-disabled="autoLoginAction !== null"
          :aria-label="autoLoginAction === 'disable' ? '关闭中' : '关闭自动登录'"
          @click="onDisableAutoLogin"
        >
          <span v-if="autoLoginAction === 'disable'" class="loading loading-spinner loading-xs" aria-hidden="true"></span>
          <span v-else>关闭</span>
        </button>
      </div>
      <p v-if="isPaused && autoLoginEnabled" class="mt-1 text-xs text-base-content/75">
        已暂停，手动登录后恢复
      </p>
      <p v-if="autoLoginError" role="alert" class="mt-1 break-words text-xs text-error">{{ autoLoginError }}</p>
    </section>
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
import { computed, nextTick, onMounted, onUnmounted, ref, useId, watch } from "vue";
import { DEFAULT_GAME_CONFIG, GAME_STATUS_CODE } from "@/constants/game";
import { formatTime } from "@/utils/format";
import {
  AUTO_LOGIN_EXTEND_DAYS,
  canRenewAutoLogin,
  getNextAutoLoginUntil,
  isAutoLoginEnabled,
  nowSeconds,
} from "@/utils/autoLogin";
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

// --- 掉线自动登录（auto_login_until，Unix 秒）---
const autoLoginHeadingId = useId();
const now = ref(nowSeconds());
const autoLoginAction = ref<"renew" | "disable" | null>(null);
const autoLoginError = ref("");
const renewAutoLoginButton = ref<HTMLButtonElement | null>(null);
const disableAutoLoginButton = ref<HTMLButtonElement | null>(null);
const game = computed(() => gamesStore.findGame(props.account));
const serverAutoLoginUntil = computed(() =>
  game.value?.game_config
    ? game.value.game_config.auto_login_until
    : props.gameConfig?.auto_login_until
);
const autoLoginUntil = ref(serverAutoLoginUntil.value ?? null);
watch(serverAutoLoginUntil, (until) => {
  autoLoginUntil.value = until ?? null;
});

const refreshAutoLoginClock = () => {
  now.value = nowSeconds();
};
let clock: ReturnType<typeof setInterval> | undefined;
onMounted(() => {
  clock = setInterval(refreshAutoLoginClock, 1000);
  window.addEventListener("focus", refreshAutoLoginClock);
});
onUnmounted(() => {
  clearInterval(clock);
  window.removeEventListener("focus", refreshAutoLoginClock);
});

const autoLoginEnabled = computed(() => isAutoLoginEnabled(autoLoginUntil.value, now.value));
const autoLoginUntilText = computed(() =>
  autoLoginUntil.value ? formatTime(autoLoginUntil.value, "yyyy-MM-dd HH:mm") : ""
);
const canRenew = computed(() => canRenewAutoLogin(autoLoginUntil.value, now.value));
const isPaused = computed(() => game.value?.status.code === GAME_STATUS_CODE.PAUSED);
const autoLoginTitle = computed(() =>
  autoLoginEnabled.value ? `有效期至 ${autoLoginUntilText.value}` : undefined
);
const renewButtonText = computed(() => {
  if (autoLoginAction.value === "renew") return autoLoginEnabled.value ? "续期中…" : "开启中…";
  if (!autoLoginEnabled.value) return `开启 ${AUTO_LOGIN_EXTEND_DAYS} 天`;
  if (!canRenew.value) return autoLoginTitle.value;
  return `续期 ${AUTO_LOGIN_EXTEND_DAYS} 天（${autoLoginUntilText.value} 到期）`;
});

const updateAutoLogin = async (action: "renew" | "disable") => {
  refreshAutoLoginClock();
  if (autoLoginAction.value || (action === "disable" ? !autoLoginEnabled.value : !canRenew.value)) return;

  const account = props.account;
  const disabling = action === "disable";
  const label = disabling ? "关闭" : autoLoginEnabled.value ? "续期" : "开启";
  const until = disabling ? 0 : getNextAutoLoginUntil(now.value);
  const fallbackError = `${label}失败，请重试`;
  autoLoginAction.value = action;
  autoLoginError.value = "";

  try {
    const result = await apiClient.doUpdateGameConf(account, { auto_login_until: until });
    if (result.code !== API_RESPONSE_CODE.SUCCESS) {
      autoLoginError.value = result.message || fallbackError;
      return;
    }

    const restoreFocus = disabling && disableAutoLoginButton.value === document.activeElement;
    autoLoginUntil.value = until;
    const savedGame = gamesStore.findGame(account);
    if (savedGame?.game_config) savedGame.game_config.auto_login_until = until;
    setMsg(`自动登录已${label}`, Type.Success);
    if (restoreFocus) {
      await nextTick();
      renewAutoLoginButton.value?.focus();
    }
  } catch {
    autoLoginError.value = fallbackError;
  } finally {
    autoLoginAction.value = null;
  }
};

const onRenewAutoLogin = () => updateAutoLogin("renew");
const onDisableAutoLogin = () => updateAutoLogin("disable");

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
    enable_workshop: config.value.enable_workshop,
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
