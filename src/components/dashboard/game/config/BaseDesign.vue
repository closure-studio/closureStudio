<template>
  <div class="container mx-auto flex justify-center">
    <div class="grid grid-cols-3 gap-2">
      <button
        v-for="(item, index) in ACCELERATE_SLOTS"
        :key="item.id"
        type="button"
        :title="item.label"
        :aria-label="item.label"
        :aria-pressed="props.slot === item.id"
        :class="getClass(item.id, index)"
        @click="setSelectSlot(item.id)"
      ></button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ACCELERATE_SLOTS } from "@/constants/game";
import type { AccelerateSlot } from "@/shared/types/api";

interface Props {
  slot: AccelerateSlot;
}
const props = withDefaults(defineProps<Props>(), {
  slot: "slot_14",
});

const emit = defineEmits<{ updateSlot: [slot: AccelerateSlot] }>();

const setSelectSlot = (slot: AccelerateSlot) => {
  emit("updateSlot", slot);
};

const getClass = (item: string, index: number): string => {
  let baseClass = "btn btn-xs w-12 btn-warning";
  if (index >= 3 && index < 6) {
    baseClass += " -ml-8";
  }
  baseClass = setButtonClassIfSelect(baseClass, item);
  return baseClass;
};

const setButtonClassIfSelect = (baseClass: string, item: string): string => {
  if (item !== props.slot) {
    baseClass += " btn-outline";
  }
  return baseClass;
};
</script>
