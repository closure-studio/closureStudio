<template>
  <div class="space-y-4">
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
      <p class="text-base-content/80">鸣谢运维管理天团！稳稳托住每一次更新。</p>
      <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div
          v-for="member in getShuffledOpsTeamMembers()"
          :key="member.name"
          class="card ops-team-card shadow-sm"
        >
          <div class="card-body p-3">
            <div class="flex items-center gap-3">
              <div class="avatar">
                <div
                  class="w-11 rounded-full ring ring-base-content/20 ring-offset-base-100 ring-offset-2"
                >
                  <img :src="member.avatar" :alt="member.name" />
                </div>
              </div>
              <div>
                <div class="font-bold">{{ member.name }}</div>
                <div class="text-sm text-base-content/70">{{ member.description }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="credit-ack card border border-base-content/10">
      <div class="card-body p-4">
        <div class="flex items-start gap-3">
          <div
            class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/15 text-primary"
          >
            <span class="text-lg leading-none">✨</span>
          </div>
          <div class="space-y-2 text-sm text-base-content/80">
            <h3 class="text-xs font-semibold uppercase tracking-[0.2em] text-base-content/50">
              Special Thanks
            </h3>
            <p class="leading-relaxed">
              感谢黑与白公益站提供的
              <span class="font-semibold text-primary">Vibe coding</span>
            </p>
            <div
              class="inline-flex items-center gap-2 rounded-full border border-secondary/30 bg-secondary/10 px-3 py-1"
            >
              <span class="text-xs uppercase tracking-wide text-base-content/60">Design by</span>
              <span class="font-semibold text-secondary">欧阳淇淇</span>
            </div>
          </div>
        </div>
      </div>
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

const opsTeamMembers = [
  {
    avatar: "/assets/team/ooooooutdated.png",
    name: "Ooooooutdated",
    description: "折腾新技术方向。",
  },
  {
    avatar: "/assets/team/Fe∞AmeLox.jpg",
    name: "Fe∞AmeLox",
    description: "处理告警和故障恢复，让系统快速回到最佳状态。",
  },
  {
    avatar: "/assets/team/Claude.jpg",
    name: "oʇdı̣ɹꓘ",
    description: "维护部署与自动化流程，持续优化交付效率。",
  },
  {
    avatar: "/assets/team/Skadi.jpg",
    name: "Skadi",
    description: "跟进用户反馈和体验问题，推动细节持续打磨。",
  },
  {
    avatar: "/assets/team/gk.jpg",
    name: "神算子GK",
    description: "妈耶。",
  },
];

const getShuffledOpsTeamMembers = () => {
  return [...opsTeamMembers].sort(() => Math.random() - 0.5);
};

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

.ops-team-card {
  border: 1px solid color-mix(in oklab, var(--color-base-content) 18%, transparent);
  background: linear-gradient(
    145deg,
    color-mix(in oklab, var(--color-base-300) 78%, transparent) 0%,
    color-mix(in oklab, var(--color-base-200) 56%, transparent) 100%
  );
  box-shadow: 0 8px 16px color-mix(in oklab, var(--color-base-content) 7%, transparent);
}

.credit-ack {
  background: linear-gradient(
    130deg,
    color-mix(in oklab, var(--color-primary) 12%, var(--color-base-100)) 0%,
    color-mix(in oklab, var(--color-secondary) 10%, var(--color-base-100)) 100%
  );
  box-shadow: 0 10px 20px color-mix(in oklab, var(--color-base-content) 8%, transparent);
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease;
}

.credit-ack:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 24px color-mix(in oklab, var(--color-primary) 15%, transparent);
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
