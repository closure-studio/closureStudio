<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
    <div v-for="game in userGameList" :key="game.status.account">
      <GameAccount
        :gameAccount="game.status.account"
        @click="$emit('open-game-conf', game.status.account)"
      >
        <div class="divider mt-2 mb-3 text-info font-arknights text-xl">START</div>
        <div class="grid gap-4 grid-cols-2 mt-2">
          <button
            class="btn btn-outline btn-sm btn-block btn-primary"
            v-if="isSuspendStatus(game.status.account)"
            @click="$emit('suspend', game.status.account)"
            :disabled="isLoading"
          >
            暂停
          </button>

          <button
            class="btn btn-outline btn-sm btn-block btn-primary"
            v-else-if="isUpdateStatus(game.status.account)"
            @click="$emit('update-passwd', getSlot(game.status.account))"
            :disabled="isLoading"
          >
            更新密码
          </button>

          <button
            class="btn btn-outline btn-sm btn-block btn-info"
            v-else
            @click="$emit('login', game.status.account)"
            :disabled="isLoginBtnDisabled(game.status.account)"
          >
            启动
          </button>

          <button
            :disabled="isLoading"
            class="btn btn-outline btn-sm btn-block btn-error"
            @click.stop="
              $emit('delete', getSlot(game.status.account)?.uuid || '', game.status.account)
            "
          >
            删除
          </button>
        </div>
      </GameAccount>
    </div>

    <template v-for="slot in userQuota?.slots" :key="slot.uuid">
      <GameAddCard
        v-if="!slot.gameAccount"
        :slot="slot"
        :userQuota="userQuota"
        @click="$emit('create', slot, slot.uuid)"
      />
      <GameAccount
        v-else-if="!findGame(slot.gameAccount) && isGameListCompletedInit"
        :gameAccount="slot.gameAccount"
      >
        <div class="divider mt-2 mb-3 text-info font-arknights text-xl">START</div>
        <div>
          <button
            :disabled="isLoading"
            class="btn btn-outline btn-sm btn-block btn-error mt-2"
            @click.stop="$emit('repair', slot.uuid, slot.gameAccount)"
          >
            点击进行修复
          </button>
        </div>
      </GameAccount>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { ApiGameGame, RegistrySlot, RegistryUserInfo } from "@/shared/types/api";
import GameAccount from "@/features/games/components/GameAccount.vue";
import GameAddCard from "@/features/games/components/GameAddCard.vue";

defineProps<{
  userGameList: ApiGameGame[];
  userQuota: RegistryUserInfo;
  isGameListCompletedInit: boolean;
  isLoading: boolean;
  findGame: (gameAccount: string) => ApiGameGame | undefined;
  getSlot: (account: string) => RegistrySlot | undefined;
  isSuspendStatus: (gameAccount: string) => boolean;
  isUpdateStatus: (gameAccount: string) => boolean;
  isLoginBtnDisabled: (gameAccount: string) => boolean;
}>();

defineEmits<{
  (event: "open-game-conf", account: string): void;
  (event: "suspend", account: string): void;
  (event: "update-passwd", slot: RegistrySlot | undefined): void;
  (event: "login", account: string): void;
  (event: "delete", slotUUID: string, gameAccount: string): void;
  (event: "create", slot: RegistrySlot, slotUUID: string): void;
  (event: "repair", slotUUID: string, gameAccount: string): void;
}>();
</script>
