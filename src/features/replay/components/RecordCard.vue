<template>
  <div
    class="group rounded-xl border border-white/10 bg-white/6 transition-all duration-300 hover:bg-white/10 hover:border-white/18"
    :class="{ 'border-info/35 bg-info/5 shadow-lg shadow-info/8': expanded }"
  >
    <!-- 折叠行 -->
    <div class="p-3.5 cursor-pointer select-none" @click="$emit('toggle')">
      <div class="flex items-center gap-3">
        <!-- 净评分徽章 -->
        <span
          class="badge badge-lg font-bold text-sm min-w-[3rem] justify-center shrink-0"
          :class="netScoreBadgeClass(record.netScore ?? 0)"
        >
          {{ record.netScore != null ? (record.netScore >= 0 ? '+' : '') + record.netScore : '–' }}
        </span>

        <!-- 标题 / 元信息 -->
        <div class="flex-1 min-w-0">
          <span class="font-bold truncate block text-base-content/90 group-hover:text-base-content transition-colors">
            {{ record.stageId }}
          </span>
          <div class="text-xs text-base-content/45 mt-1 flex items-center flex-wrap gap-x-3 gap-y-0.5">
            <div class="flex items-center gap-1.5">
              <img
                :src="avatarUrl(record.avatar)"
                :alt="record.nickName"
                class="w-4 h-4 rounded object-cover shrink-0 ring-1 ring-base-content/10"
                @error="onAvatarError"
              />
              <span>Dr. {{ record.nickName }}</span>
            </div>
            <span class="opacity-60">{{ formatTime(record.createdAt, 'yyyy-MM-dd') }}</span>
            <span class="flex items-center gap-1">
              <Icon icon="mdi-download-outline" class="w-3 h-3" />
              {{ record.usageCount ?? 0 }}
            </span>
            <span class="flex items-center gap-1">
              <Icon icon="mdi-sword-cross" class="w-3 h-3" />
              {{ record.successBattleCount }}/{{ record.totalBattleCount }}
            </span>
          </div>
        </div>

        <!-- 展开/收起 -->
        <Icon
          :icon="expanded ? 'mdi-chevron-up' : 'mdi-chevron-down'"
          class="w-5 h-5 shrink-0 text-base-content/30 group-hover:text-base-content/60 transition-all duration-300"
          :class="{ 'text-info/60': expanded }"
        />
      </div>
    </div>

    <!-- 展开详情 -->
    <transition name="expand">
      <div v-if="expanded" class="px-3.5 pb-3.5">
        <div class="border-t border-base-content/8 my-2" />

        <p v-if="record.displayInfo" class="text-sm text-base-content/70 leading-relaxed mb-4">
          {{ record.displayInfo }}
        </p>

        <!-- 操作栏 -->
        <div v-if="showActions" class="flex items-center gap-2">
          <button
            class="btn btn-sm gap-1.5 transition-all duration-200"
            :class="
              record.myRating === 1
                ? 'btn-success bg-success/15 border-success/30 text-success hover:bg-success/25'
                : 'btn-ghost text-base-content/50 hover:text-success hover:bg-success/10'
            "
            @click.stop="$emit('rate', 1)"
          >
            <Icon :icon="record.myRating === 1 ? 'mdi-thumb-up' : 'mdi-thumb-up-outline'" class="w-4 h-4" />
            赞
          </button>
          <button
            class="btn btn-sm gap-1.5 transition-all duration-200"
            :class="
              record.myRating === -1
                ? 'btn-error bg-error/15 border-error/30 text-error hover:bg-error/25'
                : 'btn-ghost text-base-content/50 hover:text-error hover:bg-error/10'
            "
            @click.stop="$emit('rate', -1)"
          >
            <Icon :icon="record.myRating === -1 ? 'mdi-thumb-down' : 'mdi-thumb-down-outline'" class="w-4 h-4" />
            踩
          </button>
          <button
            class="btn btn-sm btn-ghost text-base-content/40 hover:text-info ml-auto transition-colors"
            @click.stop="$emit('toggle')"
          >
            <Icon icon="mdi-chevron-up" class="w-4 h-4" />
            收起
          </button>
        </div>
        <div v-else class="flex justify-end">
          <button
            class="btn btn-sm btn-ghost text-base-content/40 hover:text-info transition-colors"
            @click.stop="$emit('toggle')"
          >
            <Icon icon="mdi-chevron-up" class="w-4 h-4" />
            收起
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.expand-enter-active,
.expand-leave-active {
  transition:
    opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}
.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>

<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { formatTime } from "@/shared/utils/format";
import type { RecordDTO, ReplayAvatar } from "@/shared/types/replay";

const props = defineProps<{
  record: RecordDTO;
  expanded: boolean;
  showActions?: boolean;
}>();

defineEmits<{
  toggle: [];
  rate: [rating: 1 | -1];
}>();

const avatarUrl = (avatar: ReplayAvatar) =>
  `https://assets.ltsc.vip/avatar/${avatar.type}/${avatar.id}.png`;

const onAvatarError = (e: Event) => {
  (e.target as HTMLImageElement).src =
    "https://assets.ltsc.vip/avatar/DEFAULT/avatar_def_mc.png";
};

const netScoreBadgeClass = (score: number) => {
  if (score > 0) return "badge-success bg-success/15 text-success border-success/25";
  if (score < 0) return "badge-error bg-error/15 text-error border-error/25";
  return "badge-ghost bg-base-content/8 text-base-content/40 border-base-content/15";
};
</script>
