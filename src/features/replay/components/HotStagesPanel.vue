<template>
  <div>
    <div v-if="stageIds.length" class="flex flex-wrap">
      <button
        v-for="stageId in stageIds"
        :key="stageId"
        class="btn btn-xs m-1"
        :class="
          selected.includes(stageId) ? 'btn-info' : 'btn-outline btn-info border-dashed opacity-70'
        "
        @click="emit('toggle', stageId)"
      >
        {{ assets.getStageName(stageId) }}
      </button>
    </div>
    <div v-else class="text-sm text-base-content/60">暂无热门关卡</div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted } from "vue";
import { assets } from "@/shared/services/assets";
import { useHotStages } from "@/features/replay/composables/useHotStages";

defineProps<{
  /** 已被选中的关卡 ID（用于高亮） */
  selected: string[];
}>();

const emit = defineEmits<{
  (e: "toggle", stageId: string): void;
}>();

const { stageIds, refresh } = useHotStages();

// 预留：组件挂载时尝试刷新（当前为 no-op，将来会从后端拉取）。
onMounted(() => {
  void refresh();
});
</script>
