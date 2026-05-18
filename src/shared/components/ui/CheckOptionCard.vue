<template>
  <label
    class="check-option-card flex cursor-pointer items-center gap-3 rounded-lg px-4 py-3"
    :class="{
      'check-option-card-checked': modelValue,
      'check-option-card-disabled': disabled,
    }"
  >
    <input
      type="checkbox"
      class="checkbox checkbox-sm shrink-0"
      :checked="modelValue"
      :disabled="disabled"
      @change="handleChange"
    />
    <span class="space-y-1">
      <span class="block text-sm font-semibold">
        {{ title }}
      </span>
      <span class="block text-xs text-base-content/60">
        {{ description }}
      </span>
    </span>
  </label>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean;
  title: string;
  description: string;
  disabled?: boolean;
}

withDefaults(defineProps<Props>(), {
  disabled: false,
});

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
}>();

const handleChange = (event: Event) => {
  emit("update:modelValue", (event.target as HTMLInputElement).checked);
};
</script>

<style scoped>
.check-option-card {
  position: relative;
  overflow: hidden;
  background:
    linear-gradient(
      180deg,
      color-mix(in oklab, var(--color-base-300) 46%, var(--color-base-100) 54%),
      color-mix(in oklab, var(--color-base-300) 34%, var(--color-base-100) 66%)
    );
  box-shadow:
    inset 0 1px 0 color-mix(in oklab, var(--color-base-content) 7%, transparent),
    0 0 0 1px color-mix(in oklab, var(--color-base-content) 8%, transparent),
    0 0.25rem 0.65rem color-mix(in oklab, black 12%, transparent);
  transition:
    background-color 160ms ease,
    box-shadow 160ms ease,
    transform 160ms ease;
}

.check-option-card::before {
  content: "";
  position: absolute;
  inset: 0 auto 0 0;
  width: 0.2rem;
  background: color-mix(in oklab, var(--color-warning) 62%, var(--color-base-content) 6%);
  opacity: 0.62;
}

.check-option-card:hover {
  background:
    linear-gradient(
      180deg,
      color-mix(in oklab, var(--color-base-300) 54%, var(--color-base-100) 46%),
      color-mix(in oklab, var(--color-base-300) 42%, var(--color-base-100) 58%)
    );
  box-shadow:
    inset 0 1px 0 color-mix(in oklab, var(--color-base-content) 8%, transparent),
    0 0 0 1px color-mix(in oklab, var(--color-base-content) 11%, transparent),
    0 0.3rem 0.75rem color-mix(in oklab, black 14%, transparent);
}

.check-option-card-checked {
  box-shadow:
    inset 0 1px 0 color-mix(in oklab, var(--color-base-content) 8%, transparent),
    0 0 0 1px color-mix(in oklab, var(--color-info) 28%, transparent),
    0 0.3rem 0.75rem color-mix(in oklab, black 14%, transparent);
}

.check-option-card-checked::before {
  opacity: 1;
}

.check-option-card-disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

.check-option-card .checkbox {
  border-color: color-mix(in oklab, var(--color-base-content) 34%, transparent);
}

.check-option-card .checkbox:checked,
.check-option-card .checkbox:indeterminate {
  border-color: var(--color-info);
  background-color: var(--color-info);
}
</style>
