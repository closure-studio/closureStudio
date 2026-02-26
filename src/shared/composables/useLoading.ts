import { ref } from "vue";

/**
 * 封装 isLoading ref + 防重复点击
 * @param initialValue 初始值，默认 false
 */
export function useLoading(initialValue = false) {
  const isLoading = ref(initialValue);

  /**
   * 包装异步操作，自动管理 loading 状态并防重复点击
   * @param fn 异步操作
   * @returns 操作结果
   */
  async function withLoading<T>(fn: () => Promise<T>): Promise<T | undefined> {
    if (isLoading.value) return undefined;
    isLoading.value = true;
    try {
      return await fn();
    } finally {
      isLoading.value = false;
    }
  }

  return { isLoading, withLoading };
}
