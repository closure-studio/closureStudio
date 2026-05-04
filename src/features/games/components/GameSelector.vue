<template>
  <div v-if="gameList.length > 1">
    <div class="flex flex-col lg:flex-row gap-2 lg:gap-4">
      <button
        v-for="g in gameList"
        :key="g.status.account"
        class="btn lg:flex-1"
        :class="g.status.account === account ? 'btn-info' : 'btn-outline btn-info'"
        @click="handleSelect(g.status.account)"
      >
        {{ g.status.nick_name ? `Dr. ${g.status.nick_name}` : g.status.account }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { ROUTES } from "@/shared/constants/routes";
import type { ApiGameGame } from "@/shared/types/api";

const { account, gameList } = defineProps<{
  account: string;
  gameList: ApiGameGame[];
}>();

const router = useRouter();

const handleSelect = (newAccount: string) => {
  if (newAccount === account) return;
  router.replace({
    name: ROUTES.GAME_DETAIL.name,
    params: { account: newAccount },
  });
};
</script>
