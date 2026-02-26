<template>
  <div class="container mx-auto flex justify-center">
    <div class="grid grid-cols-3 gap-2">
      <div
        v-for="(item, index) in AccelerateSlot_CN"
        :key="index"
        :class="getClass(item, index)"
        @click="setSelectSlot(item)"
      ></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { AccelerateSlot_CN } from "@/shared/constants/config";

interface Props {
  slot: string;
}
const props = withDefaults(defineProps<Props>(), {
  slot: "中层左",
});

const emit = defineEmits(["updateSlot"]);

const setSelectSlot = (slot: string) => {
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
