<template>
  <button
    type="button"
    class="relative z-0 flex w-full min-w-0 cursor-pointer items-center gap-0.5 rounded p-0.5 text-left tracking-normal transition duration-200 ease-out hover:z-10 hover:shadow-xl focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-info motion-safe:hover:-translate-y-1 motion-safe:hover:scale-105 md:gap-2"
    :aria-label="`查看${charName}详情`"
    aria-haspopup="dialog"
    @click="emit('select', char)"
  >
    <div
      class="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded"
    >
      <img
        v-if="avatar"
        :key="avatar"
        :src="avatar"
        :alt="charName"
        class="size-full object-cover"
        width="64"
        height="64"
        loading="lazy"
        @error="failedAvatars.add(avatar)"
      />
      <Icon
        v-else
        icon="mdi:account"
        class="text-3xl text-base-content/30"
        role="img"
        :aria-label="charName"
      />
    </div>
    <span
      class="flex h-16 min-w-0 flex-1 flex-col justify-between whitespace-nowrap"
    >
      <span class="flex items-center justify-between gap-0.5">
        <span class="text-xs/4 text-base-content/60 md:leading-5">精英</span>
        <span class="text-sm/4 font-semibold tabular-nums md:leading-5">{{
          char.evolvePhase
        }}</span>
      </span>
      <span class="flex items-center justify-between gap-0.5">
        <span class="text-xs/4 text-base-content/60 md:leading-5">等级</span>
        <span class="text-sm/4 font-semibold tabular-nums md:leading-5">{{
          char.level
        }}</span>
      </span>
      <span class="flex items-center justify-between gap-0.5">
        <span class="text-xs/4 text-base-content/60 md:leading-5">潜能</span>
        <span class="text-sm/4 font-semibold tabular-nums md:leading-5">{{
          char.potentialRank + 1
        }}</span>
      </span>
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { Icon } from "@iconify/vue";
import { getCharAvatarUrl } from "@/utils/resource";
import { assets } from "@/services/assets";
import type { ApiGameChar } from "@/shared/types/api";

const props = defineProps<{ char: ApiGameChar }>();
const emit = defineEmits<{ select: [char: ApiGameChar] }>();
const charName = computed(
  () => assets.value.getCharName(props.char.charId) || props.char.charId,
);
const failedAvatars = ref(new Set<string>());
const avatar = computed(() => {
  const normal = getCharAvatarUrl(props.char.charId);
  const candidates =
    props.char.evolvePhase === 2
      ? [getCharAvatarUrl(`${props.char.charId}_2`), normal]
      : [normal];
  return candidates.find((url) => !failedAvatars.value.has(url));
});
</script>
