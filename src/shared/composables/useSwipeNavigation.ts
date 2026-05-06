import { onBeforeUnmount, onMounted, ref } from "vue";

export type SwipeAxis = "x" | "y";
export type HorizontalSwipeDirection = "left" | "right";
export type VerticalSwipeDirection = "up" | "down";
export type SwipeDirection = HorizontalSwipeDirection | VerticalSwipeDirection;

interface UseSwipeNavigationOptions<TDirection extends SwipeDirection> {
  axis: SwipeAxis;
  onSwipe: (direction: TDirection) => void;
  threshold?: number;
  mediaQuery?: string;
}

const DEFAULT_SWIPE_THRESHOLD = 40;
const DEFAULT_MOBILE_MEDIA_QUERY = "(max-width: 767px)";

const isMobile = (mediaQuery: string) => window.matchMedia(mediaQuery).matches;

const isScrollableInGestureDirection = (
  target: EventTarget | null,
  axis: SwipeAxis,
  delta: number
) => {
  let current = target instanceof Element ? target : null;
  while (current) {
    const styles = window.getComputedStyle(current);
    const overflow = axis === "x" ? styles.overflowX : styles.overflowY;
    const isScrollable =
      (overflow === "auto" || overflow === "scroll") &&
      (axis === "x"
        ? current.scrollWidth > current.clientWidth + 1
        : current.scrollHeight > current.clientHeight + 1);

    if (isScrollable) {
      const canScrollForward =
        axis === "x"
          ? current.scrollLeft + current.clientWidth < current.scrollWidth - 1
          : current.scrollTop + current.clientHeight < current.scrollHeight - 1;
      const canScrollBackward = axis === "x" ? current.scrollLeft > 1 : current.scrollTop > 1;

      if ((delta > 0 && canScrollForward) || (delta < 0 && canScrollBackward)) {
        return true;
      }
    }

    current = current.parentElement;
  }

  return false;
};

const directionFromDelta = (axis: SwipeAxis, delta: number): SwipeDirection =>
  axis === "x" ? (delta > 0 ? "left" : "right") : delta > 0 ? "up" : "down";

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
    const primaryDelta = axis === "x" ? deltaX : deltaY;
    const crossDelta = axis === "x" ? deltaY : deltaX;

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

    const styleKey = axis === "x" ? "overscrollBehaviorX" : "overscrollBehaviorY";
    previousHtmlOverscrollBehavior.value = document.documentElement.style[styleKey];
    previousBodyOverscrollBehavior.value = document.body.style[styleKey];
    document.documentElement.style[styleKey] = "none";
    document.body.style[styleKey] = "none";
  });

  onBeforeUnmount(() => {
    window.removeEventListener("touchstart", onTouchStart);
    window.removeEventListener("touchend", onTouchEnd);

    const styleKey = axis === "x" ? "overscrollBehaviorX" : "overscrollBehaviorY";
    document.documentElement.style[styleKey] = previousHtmlOverscrollBehavior.value;
    document.body.style[styleKey] = previousBodyOverscrollBehavior.value;
  });
};
