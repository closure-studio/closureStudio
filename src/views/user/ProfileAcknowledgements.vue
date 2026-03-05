<template>
  <div class="p-2 space-y-4">
    <p class="text-base-content/80">
      这一路像开荒主线一样不容易，幸好有大家并肩作战，真的超——感谢！
      也感谢一直支持我们的各位博士，尤其是"你"
    </p>
    <div
      class="card halloween-breath border border-warning/40 bg-gradient-to-r from-warning/20 via-base-200/80 to-base-200/70 shadow-lg shadow-warning/10"
    >
      <div class="card-body p-4">
        <div class="flex items-center gap-3">
          <div class="avatar">
            <div class="w-12 rounded-full ring ring-warning ring-offset-base-100 ring-offset-2">
              <img :src="displayAvatar" alt="avatar" />
            </div>
          </div>
          <div>
            <div class="font-bold text-warning">{{ displayName }}</div>
            <div class="text-sm text-base-content/70">
              今夜限定主角位已点亮，感谢你的常驻守护 ✨
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="space-y-2">
      <h3 class="text-lg font-bold">运维管理天团</h3>
      <p class="text-base-content/80">
        特别鸣谢运维管理天团！你们就像后台守护结界的成员，稳稳托住每一次更新。
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGamesStore } from "@/stores/useGamesStore";
import { ref, watch } from "vue";

type NullableGame = {
  status?: {
    nick_name?: string | null;
    avatar?: {
      id?: string | null;
    } | null;
  } | null;
} | null;

const gamesStore = useGamesStore();
const displayName = ref("博士");
const displayAvatar = ref("/assets/closure.ico");

const getAvatarUrl = (avatarId: string | null | undefined) => {
  const normalizedId = (avatarId ?? "").trim().replace(/@/g, "_").replace(/#/g, "_");
  if (!normalizedId) {
    return "/assets/closure.ico";
  }
  return `https://assets.ltsc.vip/avatar/DEFAULT/${normalizedId}.png`;
};

watch(
  () => gamesStore.gameList,
  (rawList) => {
    const safeList = (rawList as NullableGame[]).filter(
      (item): item is NonNullable<NullableGame> => !!item
    );

    const candidates = safeList
      .map((item) => {
        const nickname = item.status?.nick_name?.trim() ?? "";
        const avatarId = item.status?.avatar?.id ?? null;
        return {
          nickname,
          avatarId,
        };
      })
      .filter((item) => item.nickname.length > 0);

    if (!candidates.length) {
      displayName.value = "博士";
      displayAvatar.value = "/assets/closure.ico";
      return;
    }

    const randomIndex = Math.floor(Math.random() * candidates.length);
    const selected = candidates[randomIndex];

    displayName.value = `Dr.${selected.nickname}`;
    displayAvatar.value = getAvatarUrl(selected.avatarId);
  },
  { immediate: true, deep: true }
);
</script>

<style scoped>
.halloween-breath {
  animation: halloweenBreath 5s ease-in-out infinite;
}

@keyframes halloweenBreath {
  0%,
  100% {
    border-color: color-mix(in oklab, var(--color-warning) 40%, transparent);
    box-shadow: 0 8px 18px color-mix(in oklab, var(--color-warning) 10%, transparent);
  }

  50% {
    border-color: color-mix(in oklab, var(--color-warning) 78%, transparent);
    box-shadow:
      0 10px 22px color-mix(in oklab, var(--color-warning) 24%, transparent),
      0 0 0 2px color-mix(in oklab, var(--color-warning) 22%, transparent);
  }
}
</style>
