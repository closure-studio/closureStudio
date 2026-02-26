<template>
  <div class="flex h-full">
    <div
      class="w-full flex-col max-w-4xl 2xl:max-w-6xl xl:mr-auto s-margin md:!flex"
      :class="
        show ? 'xl:ml-0 !hidden' : 'lg:ml-[calc((100vw-56rem)/2)] 2xl:ml-[calc((100vw-72rem)/2)]'
      "
    >
      <div class="bg-base-300 shadow-lg rounded-lg px-4 py-1 blog relative">
        <div class="text-2xl md:text-4xl font-bold text-info mt-3">📢 今日特价</div>
        <p v-for="k in config.announcement?.split('\n') || ['可露希尔逃跑了']">
          {{ k }}
        </p>
        <div class="divider mt-0">个人信息</div>
        <StatusMessage />
      </div>
      <transition name="collapse" @before-enter="beforeEnter" @enter="enter" @leave="leave">
        <div
          @click="handleAPIStatusBoardOnClick"
          v-if="isAPIStatusBoardShow"
          class="bg-base-300 shadow-lg rounded-lg blog relative mt-5 py-5"
        >
          <APIStatusBoard />
        </div>
      </transition>
      <IndexStatus />
      <div class="text-2xl font-bold">
        我的托管（{{ userQuota?.slots.filter((slot) => slot.gameAccount !== null)?.length }} 已用 /
        {{ userQuota?.slots?.length }} 可用）
      </div>
      <div v-if="!isGameListCompletedInit" class="h-72 flex justify-center w-full">
        <span className="loading loading-ring loading-lg"></span>
        <span className="loading loading-ring loading-lg"></span>
        <span className="loading loading-ring loading-lg"></span>
      </div>
      <GameList
        :user-game-list="userGameList"
        :user-quota="userQuota"
        :is-game-list-completed-init="isGameListCompletedInit"
        :is-loading="isLoading"
        :find-game="findGame"
        :get-slot="getSlot"
        :is-suspend-status="isSuspendStatus"
        :is-update-status="isUpdateStatus"
        :is-login-btn-disabled="isLoginBtnDisabled"
        @open-game-conf="openGameConf"
        @suspend="handleGameSuspendBtnOnClick"
        @update-passwd="handleUpdatePasswdBtnOnClick"
        @login="handleGameLoginBtnOnClick"
        @delete="handleDeleteBtnOnClick"
        @create="handleCreateGame"
        @repair="handleRepairBtnOnClick"
      />
    </div>
    <div
      class="bg-base-300 flex-1 flex flex-col md:ml-8 max-w-xl p-4 shadow-lg rounded-lg items-center animate__animated"
      v-show="show"
      :class="show ? 'animate__fadeInRight' : 'animate__fadeOutRight'"
    >
      <GamePanel
        :account="selectGame"
        :closeFunc="
          () => {
            setShow(false);
          }
        "
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import "animate.css";
import { computed, onMounted, ref, watch } from "vue";
import type { ApiSystemConfig, RegistrySlot, RegistryAddGameForm } from "@/shared/types/api";
import GamePanel from "@/features/games/components/GamePanel.vue";
import IndexStatus from "@/features/system/components/VersionStatus.vue";
import StatusMessage from "@/features/system/components/StatusMessage.vue";
import GameList from "@/features/games/components/GameList.vue";
import YouMayKnow from "@/features/games/components/YouMayKnow.vue";
import { useLoading } from "@/shared/composables/useLoading";
import { useCaptcha } from "@/shared/composables/useCaptcha";
import { useGamesStore } from "@/stores/useGamesStore";
import { useUserStore } from "@/stores/useUserStore";
import { useGameActions } from "@/features/games/composables/useGameActions";
import { useGameTransitions } from "@/features/games/composables/useGameTransitions";
import showDialog from "@/shared/components/dialog/dialog";
import APIStatusBoard from "@/features/system/components/APIStatus/APIStatusBoard.vue";
import authClient from "@/shared/services/authClient";
import apiClient from "@/shared/services/apiClient";

const show = ref(false);
const user = useUserStore();
const gamesStore = useGamesStore();
const selectedSlotUUID = ref("");
const config = ref({} as ApiSystemConfig);
const selectedRegisterForm = ref({} as RegistryAddGameForm); // for update password
const { isLoading } = useLoading();
const captcha = useCaptcha();
const isAPIStatusBoardShow = ref(true);

const userGameList = computed(() => {
  return gamesStore.gameList;
});
const userQuota = computed(() => {
  return gamesStore.userQuota;
});
const firstGame = computed(() => gamesStore.firstGame);
const isGameListCompletedInit = computed(() => gamesStore.isGameListCompletedInit);

const {
  findGame,
  getSlot,
  createGameButtonOnClick,
  isUpdateStatus,
  isSuspendStatus,
  isLoginBtnDisabled,
  handleDeleteBtnOnClick,
  handleRepairBtnOnClick,
  handleUpdatePasswdBtnOnClick,
  gameLogin,
  gameSuspend,
} = useGameActions({
  user,
  gamesStore,
  captcha,
  isLoading,
  selectedSlotUUID,
  selectedRegisterForm,
});

const { beforeEnter, enter, leave } = useGameTransitions();

watch(firstGame, (value) => {
  if (user.isVerify) return;
  if (!value) return;
  if (value.status.created_at > 0) {
    let phone = value.status.account;
    if (isNaN(parseInt(phone[0]))) {
      phone = phone.slice(1);
    }
    authClient.sendSms({ phone });
  }
});

onMounted(async () => {
  gamesStore.initializeGameListServerConnection();
  const response = await apiClient.fetchSystemConfig();
  config.value = response.data;
  showDialog(YouMayKnow);
});

const handleAPIStatusBoardOnClick = () => {
  isAPIStatusBoardShow.value = false;
};

const handleGameSuspendBtnOnClick = (gameAccount: string) => {
  show.value = !show.value;
  gameSuspend(gameAccount);
};
const handleGameLoginBtnOnClick = (gameAccount: string) => {
  show.value = !show.value;
  gameLogin(gameAccount);
};

const handleCreateGame = (slot: RegistrySlot, slotUUID: string) => {
  createGameButtonOnClick(slot, slotUUID, gameLogin);
};

const selectGame = ref("");
const setShow = (value: boolean) => {
  show.value = value;
};
const openGameConf = (account: string) => {
  const game = findGame(account);
  if (!game) return;
  // 这些感觉可以再优化下
  selectGame.value = show.value ? "" : game.status.account;
  show.value = !show.value;
};
</script>
<style>
div,
img {
  user-select: none;
  -webkit-user-drag: none;
}

.collapse-enter-active,
.collapse-leave-active {
  overflow: hidden;
  /* 防止高度动画过程中内容溢出 */
}
</style>
