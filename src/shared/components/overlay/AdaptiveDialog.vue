<template>
  <dialog
    ref="dialogElement"
    :class="dialogClass"
    :aria-labelledby="titleId"
    @cancel.prevent="requestClose"
    @close="handleClose"
    @click="handleBackdropClick"
  >
    <div
      ref="surfaceElement"
      :class="surfaceClass"
      :style="surfaceStyle"
      @transitionend="handleSurfaceTransitionEnd"
    >
      <div
        v-if="isMobile"
        class="adaptive-sheet__handle-area"
        @pointerdown="handlePointerDown"
        @pointermove="handlePointerMove"
        @pointerup="handlePointerUp"
        @pointercancel="handlePointerCancel"
      >
        <span class="adaptive-sheet__handle" aria-hidden="true" />
      </div>

      <header
        class="flex min-h-14 items-center justify-between gap-3 px-4 py-3 md:px-6"
      >
        <h2
          :id="titleId"
          class="min-w-0 truncate text-xl font-bold tracking-normal"
        >
          {{ title }}
        </h2>
        <button
          type="button"
          class="btn btn-circle btn-ghost size-10 min-h-10 shrink-0 p-0"
          :aria-label="`关闭${title}`"
          @click="requestClose"
        >
          <Icon icon="mdi:close" class="size-5" aria-hidden="true" />
        </button>
      </header>

      <div class="adaptive-dialog__body">
        <slot />
      </div>
    </div>

    <form
      v-if="!isMobile"
      method="dialog"
      class="modal-backdrop"
      @submit.prevent="requestClose"
    >
      <button type="submit" :aria-label="`关闭${title}`">关闭</button>
    </form>
  </dialog>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue";
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  useId,
  watch,
  type CSSProperties,
} from "vue";
import { DEFAULT_MOBILE_MEDIA_QUERY } from "@/constants/ui";
import { getSheetDragDistance, shouldDismissSheet } from "./sheetGesture";

const props = defineProps<{ title: string; surfaceBackground?: string }>();

const open = defineModel<boolean>("open", { default: false });
const titleId = `adaptive-dialog-title-${useId()}`;
const dialogElement = ref<HTMLDialogElement | null>(null);
const surfaceElement = ref<HTMLElement | null>(null);
const isMobile = ref(false);
const isDragging = ref(false);
const isClosing = ref(false);
const isPresented = ref(false);
const dragDistance = ref(0);

let mobileMediaQuery: MediaQueryList | null = null;
let closeTimer: ReturnType<typeof setTimeout> | null = null;
let entryFrame: number | null = null;
let presentationFrame: number | null = null;
let activePointerId: number | null = null;
let dragStartY = 0;
let lastPointerY = 0;
let lastPointerTime = 0;
let lastVelocity = 0;
let returnFocusElement: HTMLElement | null = null;
let previousRootOverflow: string | null = null;
let previousBodyOverflow: string | null = null;

const dialogClass = computed(() =>
  isMobile.value
    ? [
        "adaptive-sheet",
        {
          "adaptive-sheet--presented": isPresented.value,
          "adaptive-sheet--closing": isClosing.value,
        },
      ]
    : "modal",
);

const surfaceClass = computed(() =>
  isMobile.value
    ? [
        "adaptive-sheet__surface",
        {
          "adaptive-sheet__surface--presented": isPresented.value,
          "adaptive-sheet__surface--dragging": isDragging.value,
          "adaptive-sheet__surface--closing": isClosing.value,
        },
      ]
    : "modal-box flex max-h-[85dvh] w-11/12 max-w-3xl flex-col overflow-hidden rounded-lg p-0",
);

const surfaceStyle = computed<CSSProperties | undefined>(() => {
  const style: CSSProperties = {};
  if (isMobile.value) {
    style["--sheet-drag-distance"] = `${dragDistance.value}px`;
  }
  if (props.surfaceBackground) {
    style.background = props.surfaceBackground;
  }
  return Object.keys(style).length ? style : undefined;
});

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const clearCloseTimer = () => {
  if (closeTimer !== null) {
    clearTimeout(closeTimer);
    closeTimer = null;
  }
};

const cancelEntryFrames = () => {
  if (entryFrame !== null) cancelAnimationFrame(entryFrame);
  if (presentationFrame !== null) cancelAnimationFrame(presentationFrame);
  entryFrame = null;
  presentationFrame = null;
};

const scheduleMobileEntry = () => {
  cancelEntryFrames();
  entryFrame = requestAnimationFrame(() => {
    entryFrame = null;
    presentationFrame = requestAnimationFrame(() => {
      presentationFrame = null;
      if (
        open.value &&
        dialogElement.value?.open &&
        isMobile.value &&
        !isClosing.value
      ) {
        isPresented.value = true;
      }
    });
  });
};

const resetDrag = () => {
  isDragging.value = false;
  dragDistance.value = 0;
  activePointerId = null;
  lastVelocity = 0;
};

const lockPageScroll = () => {
  if (previousRootOverflow !== null) return;
  previousRootOverflow = document.documentElement.style.overflow;
  previousBodyOverflow = document.body.style.overflow;
  document.documentElement.style.overflow = "hidden";
  document.body.style.overflow = "hidden";
};

const unlockPageScroll = () => {
  if (previousRootOverflow === null) return;
  document.documentElement.style.overflow = previousRootOverflow;
  document.body.style.overflow = previousBodyOverflow ?? "";
  previousRootOverflow = null;
  previousBodyOverflow = null;
};

const finishClose = () => {
  cancelEntryFrames();
  clearCloseTimer();
  const dialog = dialogElement.value;
  if (dialog?.open) dialog.close();
};

const requestClose = () => {
  const dialog = dialogElement.value;
  if (!dialog?.open || isClosing.value) return;

  if (!isMobile.value || !isPresented.value || prefersReducedMotion()) {
    finishClose();
    return;
  }

  isDragging.value = false;
  isClosing.value = true;
  dragDistance.value = surfaceElement.value?.offsetHeight ?? window.innerHeight;
  closeTimer = setTimeout(finishClose, 360);
};

const showDialog = async () => {
  await nextTick();
  const dialog = dialogElement.value;
  if (!open.value || !dialog || dialog.open) return;

  cancelEntryFrames();
  clearCloseTimer();
  resetDrag();
  isClosing.value = false;
  isPresented.value = false;
  returnFocusElement =
    document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
  dialog.showModal();
  lockPageScroll();
  if (!isMobile.value || prefersReducedMotion()) {
    isPresented.value = true;
  } else {
    scheduleMobileEntry();
  }
};

const handleClose = async () => {
  cancelEntryFrames();
  clearCloseTimer();
  resetDrag();
  isClosing.value = false;
  isPresented.value = false;
  unlockPageScroll();
  open.value = false;
  await nextTick();
  if (returnFocusElement?.isConnected) returnFocusElement.focus();
  returnFocusElement = null;
};

const handleBackdropClick = (event: MouseEvent) => {
  if (event.target === dialogElement.value) requestClose();
};

const handleSurfaceTransitionEnd = (event: TransitionEvent) => {
  if (
    isClosing.value &&
    event.target === surfaceElement.value &&
    event.propertyName === "transform"
  )
    finishClose();
};

const handlePointerDown = (event: PointerEvent) => {
  if (
    !isMobile.value ||
    isClosing.value ||
    !event.isPrimary ||
    event.button !== 0
  )
    return;

  activePointerId = event.pointerId;
  dragStartY = event.clientY;
  lastPointerY = event.clientY;
  lastPointerTime = event.timeStamp;
  lastVelocity = 0;
  isDragging.value = true;
  if (event.currentTarget instanceof Element) {
    event.currentTarget.setPointerCapture(event.pointerId);
  }
};

const handlePointerMove = (event: PointerEvent) => {
  if (!isDragging.value || event.pointerId !== activePointerId) return;

  dragDistance.value = getSheetDragDistance(dragStartY, event.clientY);
  const elapsed = event.timeStamp - lastPointerTime;
  if (elapsed > 0) lastVelocity = (event.clientY - lastPointerY) / elapsed;
  lastPointerY = event.clientY;
  lastPointerTime = event.timeStamp;
};

const releasePointer = (event: PointerEvent) => {
  const target = event.currentTarget;
  if (target instanceof Element && target.hasPointerCapture(event.pointerId)) {
    target.releasePointerCapture(event.pointerId);
  }
};

const handlePointerUp = (event: PointerEvent) => {
  if (!isDragging.value || event.pointerId !== activePointerId) return;

  releasePointer(event);
  const elapsedSinceMove = event.timeStamp - lastPointerTime;
  const releaseVelocity =
    elapsedSinceMove <= 80 ? Math.max(0, lastVelocity) : 0;
  const shouldClose = shouldDismissSheet({
    distance: dragDistance.value,
    height: surfaceElement.value?.offsetHeight ?? window.innerHeight,
    velocity: releaseVelocity,
  });

  isDragging.value = false;
  activePointerId = null;
  if (shouldClose) requestClose();
  else dragDistance.value = 0;
};

const handlePointerCancel = (event: PointerEvent) => {
  if (event.pointerId !== activePointerId) return;
  releasePointer(event);
  resetDrag();
};

const handleMediaChange = (event: MediaQueryListEvent | MediaQueryList) => {
  isMobile.value = event.matches;
  resetDrag();
  if (isClosing.value) finishClose();
  else if (dialogElement.value?.open) {
    cancelEntryFrames();
    isPresented.value = true;
  }
};

watch(open, (nextOpen) => {
  if (nextOpen) showDialog();
  else if (dialogElement.value?.open) requestClose();
});

onMounted(() => {
  mobileMediaQuery = window.matchMedia(DEFAULT_MOBILE_MEDIA_QUERY);
  handleMediaChange(mobileMediaQuery);
  mobileMediaQuery.addEventListener("change", handleMediaChange);
  if (open.value) showDialog();
});

onBeforeUnmount(() => {
  mobileMediaQuery?.removeEventListener("change", handleMediaChange);
  cancelEntryFrames();
  clearCloseTimer();
  unlockPageScroll();
});
</script>

<style scoped>
.adaptive-dialog__body {
  display: flex;
  min-height: 0;
  flex-direction: column;
  overflow: hidden;
}

.adaptive-sheet {
  inset: 0;
  width: 100%;
  max-width: none;
  height: 100%;
  max-height: none;
  margin: 0;
  padding: 0;
  overflow: hidden;
  border: 0;
  color: var(--color-base-content);
  background-color: transparent;
  transition: background-color 280ms ease-out;
}

.adaptive-sheet::backdrop {
  background: transparent;
}

.adaptive-sheet--presented {
  background-color: rgb(0 0 0 / 45%);
}

.adaptive-sheet--closing {
  background-color: transparent;
}

.adaptive-sheet__surface {
  --sheet-drag-distance: 0px;
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  max-height: 85dvh;
  flex-direction: column;
  overflow: hidden;
  padding-bottom: env(safe-area-inset-bottom, 0px);
  border-radius: 0.5rem 0.5rem 0 0;
  background: var(--color-base-100);
  box-shadow: 0 -12px 36px rgb(0 0 0 / 30%);
  transform: translate3d(0, calc(100% + 1rem), 0);
  transition: transform 420ms cubic-bezier(0.22, 0.61, 0.36, 1);
  will-change: transform;
}

.adaptive-sheet__surface--presented {
  transform: translate3d(0, var(--sheet-drag-distance), 0);
}

.adaptive-sheet__surface--dragging {
  cursor: grabbing;
  transition-duration: 0ms;
}

.adaptive-sheet__surface--closing {
  transition-duration: 280ms;
  transition-timing-function: cubic-bezier(0.4, 0, 1, 1);
}

.adaptive-sheet__handle-area {
  display: flex;
  height: 1.75rem;
  flex: none;
  cursor: grab;
  touch-action: none;
  align-items: center;
  justify-content: center;
}

.adaptive-sheet__handle {
  width: 2.5rem;
  height: 0.25rem;
  border-radius: 9999px;
  background: color-mix(in oklab, var(--color-base-content) 28%, transparent);
}

@media (prefers-reduced-motion: reduce) {
  .adaptive-sheet,
  .adaptive-sheet__surface {
    transition-duration: 0.01ms;
  }
}
</style>
