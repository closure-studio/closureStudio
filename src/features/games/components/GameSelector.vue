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
import { ROUTES } from "@/constants/routes";
import type { ApiGameGame } from "@/shared/types/api";

const {
  account,
  gameList,
  mode = "route",
} = defineProps<{
  account: string;
  gameList: ApiGameGame[];
  /**
   * 切换账号的行为：
   * - "route"：默认，触发 router.replace 到 GAME_DETAIL（向后兼容 GameDetail.vue）。
   * - "emit"：仅通过 update:account 抛出，由父组件控制（适合 Replay 等无路由切换的场景）。
   */
  mode?: "route" | "emit";
}>();

const emit = defineEmits<{
  (e: "update:account", value: string): void;
}>();

const router = useRouter();

const handleSelect = (newAccount: string) => {
  if (newAccount === account) return;
  if (mode === "emit") {
    emit("update:account", newAccount);
    return;
  }
  router.replace({
    name: ROUTES.GAME_DETAIL.name,
    params: { account: newAccount },
  });
};
</script>
