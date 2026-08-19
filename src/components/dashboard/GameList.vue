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
            type="button"
            class="btn btn-outline btn-sm btn-block btn-primary"
            v-if="isSuspendStatus(game.status.account)"
            @click.stop="$emit('suspend', game.status.account)"
            :disabled="isLoading"
          >
            暂停
          </button>

          <button
            type="button"
            class="btn btn-outline btn-sm btn-block btn-primary"
            v-else-if="isUpdateStatus(game.status.account)"
            @click.stop="$emit('update-password', game.status.account)"
            :disabled="isLoading"
          >
            更新密码
          </button>

          <button
            type="button"
            class="btn btn-outline btn-sm btn-block btn-info"
            v-else
            @click.stop="$emit('login', game.status.account)"
            :disabled="isLoading || game.status.code === GAME_STATUS_CODE.LOGGING_IN"
          >
            启动
          </button>

          <button
            type="button"
            :disabled="isLoading"
            class="btn btn-outline btn-sm btn-block btn-error"
            @click.stop="$emit('delete', game.status.account)"
          >
            删除
          </button>
        </div>
      </GameAccount>
    </div>

    <GameAddCard
      v-if="canCreateGame"
      :class="{ 'pointer-events-none opacity-60': isLoading }"
      @click="isLoading ? undefined : $emit('create')"
    />
  </div>
</template>

<script setup lang="ts">
import type { ApiGameGame } from "@/shared/types/api";
import { GAME_STATUS_CODE } from "@/constants/game";
import GameAccount from "@/components/dashboard/GameAccount.vue";
import GameAddCard from "@/components/dashboard/GameAddCard.vue";

defineProps<{
  userGameList: ApiGameGame[];
  canCreateGame: boolean;
  isLoading: boolean;
  isSuspendStatus: (gameAccount: string) => boolean;
  isUpdateStatus: (gameAccount: string) => boolean;
}>();

defineEmits<{
  (event: "open-game-conf", account: string): void;
  (event: "suspend", account: string): void;
  (event: "update-password", account: string): void;
  (event: "login", account: string): void;
  (event: "delete", account: string): void;
  (event: "create"): void;
}>();
</script>
