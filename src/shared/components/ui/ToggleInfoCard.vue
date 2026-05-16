<template>
  <component
    :is="tagName"
    :role="clickable ? 'button' : undefined"
    :tabindex="clickable && !disabled ? 0 : undefined"
    class="toggle-info-card flex min-h-24 items-center justify-between gap-4 rounded-lg px-4 py-3 transition-colors"
    :class="{
      'cursor-pointer': clickable && !disabled,
      'cursor-not-allowed opacity-60': disabled,
      'toggle-info-card-disabled': disabled,
      'toggle-info-card-active': active,
    }"
    @click="handleClick"
    @keydown.enter.prevent="handleClick"
    @keydown.space.prevent="handleClick"
  >
    <span class="min-w-0">
      <span class="block text-sm font-semibold">{{ title }}</span>
      <span class="mt-1 block text-xs leading-5 text-base-content/60">
        {{ description }}
      </span>
    </span>

    <slot name="suffix">
      <input
        v-if="showToggle"
        type="checkbox"
        class="toggle toggle-sm toggle-info shrink-0"
        :checked="active"
        :disabled="disabled"
        @change.stop="handleToggleChange"
        @click.stop
      />
    </slot>
  </component>
</template>

<script setup lang="ts">
interface Props {
  title: string;
  description: string;
  active?: boolean;
  disabled?: boolean;
  clickable?: boolean;
  showToggle?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  active: false,
  disabled: false,
  clickable: false,
  showToggle: true,
});

const emit = defineEmits<{
  click: [];
  "update:active": [value: boolean];
}>();

const tagName = "div";

const emitToggle = () => {
  if (props.disabled) return;
  emit("update:active", !props.active);
};

const handleClick = () => {
  if (!props.clickable || props.disabled) return;
  emitToggle();
  emit("click");
};

const handleToggleChange = () => {
  emitToggle();
};
</script>

<style scoped>
.toggle-info-card {
  width: 100%;
  border: 0;
  text-align: left;
  background:
    linear-gradient(
      180deg,
      color-mix(in oklab, var(--color-base-300) 52%, var(--color-base-100) 48%),
      color-mix(in oklab, var(--color-base-300) 38%, var(--color-base-100) 62%)
    );
  box-shadow:
    inset 0 1px 0 color-mix(in oklab, var(--color-base-content) 7%, transparent),
    0 0 0 1px color-mix(in oklab, var(--color-base-content) 8%, transparent),
    0 0.35rem 0.9rem color-mix(in oklab, black 16%, transparent);
}

.toggle-info-card:not(.toggle-info-card-disabled):hover {
  background:
    linear-gradient(
      180deg,
      color-mix(in oklab, var(--color-base-300) 62%, var(--color-base-100) 38%),
      color-mix(in oklab, var(--color-base-300) 46%, var(--color-base-100) 54%)
    );
  box-shadow:
    inset 0 1px 0 color-mix(in oklab, var(--color-base-content) 9%, transparent),
    0 0 0 1px color-mix(in oklab, var(--color-base-content) 11%, transparent),
    0 0.45rem 1rem color-mix(in oklab, black 18%, transparent);
}

.toggle-info-card-active {
  box-shadow:
    inset 0 1px 0 color-mix(in oklab, var(--color-base-content) 9%, transparent),
    0 0 0 1px color-mix(in oklab, var(--color-info) 24%, transparent),
    0 0.35rem 0.9rem color-mix(in oklab, black 16%, transparent);
}
</style>
