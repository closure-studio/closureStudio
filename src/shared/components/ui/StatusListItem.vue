<template>
  <button
    v-if="clickable"
    type="button"
    class="block w-full rounded-lg px-3 py-3 text-left transition-colors"
    :class="itemClass"
    :disabled="disabled"
  >
    <span class="flex items-center justify-between gap-3">
      <span class="flex min-w-0 flex-1 items-center gap-3">
        <span class="h-2.5 w-2.5 shrink-0 rounded-full" :class="resolvedIndicatorClass" />
        <span class="min-w-0">
          <span class="block truncate text-sm font-semibold">{{ title }}</span>
        </span>
      </span>
      <span class="flex shrink-0 items-center gap-3">
        <slot name="suffix" />
      </span>
    </span>
    <slot />
  </button>

  <div v-else class="block rounded-lg px-3 py-3 transition-colors" :class="itemClass">
    <div class="flex items-center justify-between gap-3">
      <div class="flex min-w-0 flex-1 items-center gap-3">
        <span class="h-2.5 w-2.5 shrink-0 rounded-full" :class="resolvedIndicatorClass" />
        <div class="min-w-0">
          <p class="truncate text-sm font-semibold">{{ title }}</p>
        </div>
      </div>
      <div class="flex shrink-0 items-center gap-3">
        <slot name="suffix" />
      </div>
    </div>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface StatusListItemProps {
  title: string;
  active?: boolean;
  clickable?: boolean;
  disabled?: boolean;
  indicatorClass?: string;
}

const props = withDefaults(defineProps<StatusListItemProps>(), {
  active: false,
  clickable: false,
  disabled: false,
  indicatorClass: "",
});

const itemClass = computed(() => {
  if (props.active) return "bg-primary/5";
  if (props.clickable && !props.disabled) return "bg-base-100 hover:bg-base-200/20";
  return "bg-base-100";
});

const resolvedIndicatorClass = computed(() => {
  if (props.indicatorClass) return props.indicatorClass;
  return props.active ? "bg-primary" : "bg-base-300";
});
</script>
