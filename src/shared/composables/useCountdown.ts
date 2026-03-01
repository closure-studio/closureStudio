import { ref, onUnmounted } from "vue";

/**
 * 封装倒计时逻辑，适用于短信/邮件验证码发送冷却
 * @param seconds 倒计时秒数，默认 60
 */
export function useCountdown(seconds = 60) {
  const remaining = ref(0);
  const isCounting = ref(false);
  let timer: ReturnType<typeof setInterval> | null = null;

  function start() {
    if (isCounting.value) return;
    remaining.value = seconds;
    isCounting.value = true;
    timer = setInterval(() => {
      remaining.value--;
      if (remaining.value <= 0) {
        stop();
      }
    }, 1000);
  }

  function stop() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    isCounting.value = false;
    remaining.value = 0;
  }

  onUnmounted(stop);

  return { remaining, isCounting, start, stop };
}
