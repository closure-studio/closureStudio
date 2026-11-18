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
    <section
      class="@container mt-4 min-w-0 space-y-3 rounded-lg border border-base-300 bg-base-200/40 p-3 sm:p-4"
      :aria-labelledby="autoLoginHeadingId"
      :aria-busy="autoLoginAction !== null"
    >
      <div class="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <h3 :id="autoLoginHeadingId" class="text-sm font-semibold">自动登录</h3>
        <span
          class="badge badge-sm badge-soft"
          :class="autoLoginEnabled ? 'badge-success' : 'badge-neutral'"
          role="status"
        >
          {{ autoLoginEnabled ? "已开启" : "已关闭" }}
        </span>
      </div>
      <p v-if="autoLoginEnabled" class="text-sm text-base-content/75">
        <time :datetime="autoLoginUntilDateTime">{{ autoLoginUntilText }}</time> 到期
        <span v-if="!canRenew" class="block text-xs">到期前 30 天可续期</span>
      </p>
      <p v-if="isPaused && autoLoginEnabled" class="rounded-md bg-warning/10 px-3 py-2 text-sm">
        已暂停，手动登录后恢复
      </p>
      <div class="flex flex-wrap gap-2">
        <button
          ref="renewAutoLoginButton"
          type="button"
          class="btn btn-info min-h-[44px] w-full text-sm aria-disabled:cursor-not-allowed aria-disabled:opacity-60 @xs:w-auto"
          :aria-disabled="autoLoginAction !== null || !canRenew"
          @click="onRenewAutoLogin"
        >
          <span
            v-if="autoLoginAction === 'renew'"
            class="loading loading-spinner loading-xs"
            aria-hidden="true"
          ></span>
          {{ renewButtonText }}
        </button>
        <button
          v-if="autoLoginEnabled"
          ref="disableAutoLoginButton"
          type="button"
          class="btn btn-outline min-h-[44px] w-full text-sm aria-disabled:cursor-not-allowed aria-disabled:opacity-60 @xs:w-auto"
          :aria-disabled="autoLoginAction !== null"
          :aria-label="autoLoginAction === 'disable' ? undefined : '关闭自动登录'"
          @click="onDisableAutoLogin"
        >
          <span
            v-if="autoLoginAction === 'disable'"
            class="loading loading-spinner loading-xs"
            aria-hidden="true"
          ></span>
          {{ autoLoginAction === 'disable' ? '关闭中…' : '关闭' }}
        </button>
      </div>
      <p v-if="autoLoginError" role="alert" class="break-words text-sm text-error">{{ autoLoginError }}</p>
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
const autoLoginUntilDateTime = computed(() =>
  autoLoginUntil.value ? new Date(autoLoginUntil.value * 1000).toISOString() : undefined
);
const canRenew = computed(() => canRenewAutoLogin(autoLoginUntil.value, now.value));
const isPaused = computed(() => game.value?.status.code === GAME_STATUS_CODE.PAUSED);
const renewButtonText = computed(() => {
  if (autoLoginAction.value === "renew") return autoLoginEnabled.value ? "续期中…" : "开启中…";
  return `${autoLoginEnabled.value ? "续期" : "开启"} ${AUTO_LOGIN_EXTEND_DAYS} 天`;
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
