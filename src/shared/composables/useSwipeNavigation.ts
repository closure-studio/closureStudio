import { onBeforeUnmount, onMounted, ref } from "vue";
import { DEFAULT_MOBILE_MEDIA_QUERY, DEFAULT_SWIPE_THRESHOLD } from "@/constants/ui";

export const SWIPE_AXIS = {
  X: "x",
  Y: "y",
} as const;

export type SwipeAxis = (typeof SWIPE_AXIS)[keyof typeof SWIPE_AXIS];

export const HORIZONTAL_SWIPE_DIRECTION = {
  LEFT: "left",
  RIGHT: "right",
} as const;

export type HorizontalSwipeDirection =
  (typeof HORIZONTAL_SWIPE_DIRECTION)[keyof typeof HORIZONTAL_SWIPE_DIRECTION];

export const VERTICAL_SWIPE_DIRECTION = {
  UP: "up",
  DOWN: "down",
} as const;

export type VerticalSwipeDirection =
  (typeof VERTICAL_SWIPE_DIRECTION)[keyof typeof VERTICAL_SWIPE_DIRECTION];

export type SwipeDirection = HorizontalSwipeDirection | VerticalSwipeDirection;

interface UseSwipeNavigationOptions<TDirection extends SwipeDirection> {
  axis: SwipeAxis;
  onSwipe: (direction: TDirection) => void;
  threshold?: number;
  mediaQuery?: string;
}

const isMobile = (mediaQuery: string) => window.matchMedia(mediaQuery).matches;

const isScrollableInGestureDirection = (
  target: EventTarget | null,
  axis: SwipeAxis,
  delta: number
) => {
  let current = target instanceof Element ? target : null;
  while (current) {
    const styles = window.getComputedStyle(current);
    const overflow = axis === SWIPE_AXIS.X ? styles.overflowX : styles.overflowY;
    const isScrollable =
      (overflow === "auto" || overflow === "scroll") &&
      (axis === SWIPE_AXIS.X
        ? current.scrollWidth > current.clientWidth + 1
        : current.scrollHeight > current.clientHeight + 1);

    if (isScrollable) {
      const canScrollForward =
        axis === SWIPE_AXIS.X
          ? current.scrollLeft + current.clientWidth < current.scrollWidth - 1
          : current.scrollTop + current.clientHeight < current.scrollHeight - 1;
      const canScrollBackward =
        axis === SWIPE_AXIS.X ? current.scrollLeft > 1 : current.scrollTop > 1;

      if ((delta > 0 && canScrollForward) || (delta < 0 && canScrollBackward)) {
        return true;
      }
    }

    current = current.parentElement;
  }

  return false;
};

const directionFromDelta = (axis: SwipeAxis, delta: number): SwipeDirection =>
  axis === SWIPE_AXIS.X
    ? delta > 0
      ? HORIZONTAL_SWIPE_DIRECTION.LEFT
      : HORIZONTAL_SWIPE_DIRECTION.RIGHT
    : delta > 0
      ? VERTICAL_SWIPE_DIRECTION.UP
      : VERTICAL_SWIPE_DIRECTION.DOWN;

export const useSwipeNavigation = <TDirection extends SwipeDirection>({
  axis,
  onSwipe,
  threshold = DEFAULT_SWIPE_THRESHOLD,
  mediaQuery = DEFAULT_MOBILE_MEDIA_QUERY,
}: UseSwipeNavigationOptions<TDirection>) => {
  const touchStartX = ref<number | null>(null);
  const touchStartY = ref<number | null>(null);
  const touchStartTarget = ref<EventTarget | null>(null);
  const previousHtmlOverscrollBehavior = ref("");
  const previousBodyOverscrollBehavior = ref("");

  const onTouchStart = (event: TouchEvent) => {
    if (!isMobile(mediaQuery)) return;
    const firstTouch = event.changedTouches[0];
    if (!firstTouch) return;

    touchStartX.value = firstTouch.clientX;
    touchStartY.value = firstTouch.clientY;
    touchStartTarget.value = event.target;
  };

  const resetTouchState = () => {
    touchStartX.value = null;
    touchStartY.value = null;
    touchStartTarget.value = null;
  };

  const onTouchEnd = (event: TouchEvent) => {
    if (!isMobile(mediaQuery) || touchStartX.value === null || touchStartY.value === null) return;

    const firstTouch = event.changedTouches[0];
    if (!firstTouch) {
      resetTouchState();
      return;
    }

    const deltaX = touchStartX.value - firstTouch.clientX;
    const deltaY = touchStartY.value - firstTouch.clientY;
    const primaryDelta = axis === SWIPE_AXIS.X ? deltaX : deltaY;
    const crossDelta = axis === SWIPE_AXIS.X ? deltaY : deltaX;

    if (Math.abs(primaryDelta) <= Math.abs(crossDelta)) {
      resetTouchState();
      return;
    }

    if (Math.abs(primaryDelta) < threshold) {
      resetTouchState();
      return;
    }

    if (isScrollableInGestureDirection(touchStartTarget.value, axis, primaryDelta)) {
      resetTouchState();
      return;
    }

    resetTouchState();
    onSwipe(directionFromDelta(axis, primaryDelta) as TDirection);
  };

  onMounted(() => {
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });

    const styleKey = axis === SWIPE_AXIS.X ? "overscrollBehaviorX" : "overscrollBehaviorY";
    previousHtmlOverscrollBehavior.value = document.documentElement.style[styleKey];
    previousBodyOverscrollBehavior.value = document.body.style[styleKey];
    document.documentElement.style[styleKey] = "none";
    document.body.style[styleKey] = "none";
  });

  onBeforeUnmount(() => {
    window.removeEventListener("touchstart", onTouchStart);
    window.removeEventListener("touchend", onTouchEnd);

    const styleKey = axis === SWIPE_AXIS.X ? "overscrollBehaviorX" : "overscrollBehaviorY";
    document.documentElement.style[styleKey] = previousHtmlOverscrollBehavior.value;
    document.body.style[styleKey] = previousBodyOverscrollBehavior.value;
  });
};
