<template>
  <div class="mobile-swipe-menu-header">
    <div class="mobile-swipe-menu-title-row">
      <div class="mobile-swipe-menu-dots">
        <span
          v-for="(item, index) in items"
          :key="itemKey(item, index)"
          class="mobile-swipe-menu-dot"
          :class="
            index === activeIndex ? 'mobile-swipe-menu-dot-active' : 'mobile-swipe-menu-dot-idle'
          "
        >
          <span v-if="index === activeIndex" class="mobile-swipe-menu-title">
            {{ activeTitle }}
          </span>
        </span>
      </div>
    </div>
    <div class="mobile-swipe-menu-hint" :class="hintClass">{{ swipeText }}</div>
  </div>
</template>

<style scoped>
.mobile-swipe-menu-header {
  display: grid;
  gap: 0.35rem;
  padding: 0.1rem 0.2rem;
}

.mobile-swipe-menu-title-row {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  min-height: 1.45rem;
}

.mobile-swipe-menu-title {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.82rem;
  line-height: 1.1rem;
  font-weight: 700;
  letter-spacing: 0.01em;
  color: color-mix(in oklab, var(--color-base-content) 92%, var(--color-info) 8%);
}

.mobile-swipe-menu-dots {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.65rem;
  min-width: 0;
  max-width: 100%;
}

.mobile-swipe-menu-dot {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition:
    opacity 0.3s ease,
    transform 0.3s ease,
    width 0.3s ease;
}

.mobile-swipe-menu-dot-active {
  min-width: 0;
  max-width: min(70vw, 16rem);
  padding: 0 0.3rem 0.3rem;
}

.mobile-swipe-menu-dot-active::after {
  position: absolute;
  right: 0.3rem;
  bottom: 0;
  left: 0.3rem;
  height: 0.13rem;
  border-radius: 9999px;
  background: color-mix(in oklab, var(--color-info) 78%, var(--color-base-content) 8%);
  box-shadow: 0 0.25rem 0.65rem color-mix(in oklab, var(--color-info) 28%, transparent);
  content: "";
  transform-origin: center;
  animation: activeUnderlineIn 0.54s cubic-bezier(0.18, 1.45, 0.28, 1) both;
}

.mobile-swipe-menu-dot-active .mobile-swipe-menu-title {
  color: color-mix(in oklab, var(--color-base-content) 92%, var(--color-info) 8%);
}

.mobile-swipe-menu-dot-idle {
  width: 0.42rem;
  height: 0.42rem;
  border-radius: 9999px;
  background: color-mix(in oklab, var(--color-base-content) 44%, var(--color-base-300) 56%);
  box-shadow: 0 0 0.2rem color-mix(in oklab, var(--color-base-content) 9%, transparent);
  opacity: 0.68;
}

.mobile-swipe-menu-dot-idle:first-child {
  transform: translateX(-0.05rem);
}

.mobile-swipe-menu-dot-idle:last-child {
  transform: translateX(0.05rem);
}

.mobile-swipe-menu-hint {
  text-align: center;
  font-size: 0.625rem;
  line-height: 0.85rem;
  color: color-mix(in oklab, var(--color-base-content) 55%, transparent);
}

@keyframes activeUnderlineIn {
  0% {
    opacity: 0;
    filter: saturate(0.85);
    transform: translateX(-0.65rem) translateY(0.14rem) scaleX(0.16);
  }

  42% {
    opacity: 1;
    filter: saturate(1.25);
    transform: translateX(0.18rem) translateY(-0.03rem) scaleX(1.18);
  }

  70% {
    opacity: 1;
    filter: saturate(1.08);
    transform: translateX(-0.06rem) translateY(0) scaleX(0.92);
  }

  100% {
    opacity: 1;
    filter: saturate(1);
    transform: translateX(0) translateY(0) scaleX(1);
  }
}

.mobile-swipe-menu-hint-x {
  animation: swipeHintFloatX 1.8s ease-in-out infinite;
}

.mobile-swipe-menu-hint-y {
  animation: swipeHintFloatY 1.8s ease-in-out infinite;
}

@keyframes swipeHintFloatX {
  0%,
  100% {
    transform: translateX(0);
    opacity: 0.65;
  }

  50% {
    transform: translateX(0.2rem);
    opacity: 1;
  }
}

@keyframes swipeHintFloatY {
  0%,
  100% {
    transform: translateY(0);
    opacity: 0.65;
  }

  50% {
    transform: translateY(-0.2rem);
    opacity: 1;
  }
}
</style>

<script setup lang="ts">
import { computed } from "vue";

interface SwipeMenuItem {
  key?: string | number;
  to?: string;
  name?: string;
}

interface Props {
  activeTitle?: string;
  items: SwipeMenuItem[];
  activeIndex: number;
  swipeText: string;
  axis: "x" | "y";
}

const props = defineProps<Props>();

const hintClass = computed(() =>
  props.axis === "x" ? "mobile-swipe-menu-hint-x" : "mobile-swipe-menu-hint-y"
);

const itemKey = (item: SwipeMenuItem, index: number) => item.key ?? item.to ?? item.name ?? index;
</script>
