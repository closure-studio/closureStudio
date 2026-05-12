import { computed, watch, type Ref } from 'vue';
import { useGamesStore } from '@/stores/useGamesStore';

export function useGameChars(account: Ref<string>) {
  const store = useGamesStore();

  const chars = computed(() => store.charsCache[account.value]?.chars || []);
  const total = computed(() => store.charsCache[account.value]?.total || 0);
  const isLoading = computed(() => store.isLoadingChars);

  const loadChars = async () => {
    await store.fetchChars(account.value);
  };

  // 监听账号变化，自动加载
  watch(account, (newAccount) => {
    if (newAccount) {
      loadChars();
    }
  }, { immediate: true });

  return {
    chars,
    total,
    isLoading,
    loadChars,
  };
}
