import { computed, ref } from "vue";
import type { ApiGameGame } from "@/shared/types/api";
import apiClient from "@/shared/services/apiClient";

export function useProfileData() {
  const gameList = ref<ApiGameGame[]>([]);

  const days = computed(() => {
    if (!gameList.value.length) return 1;
    return Math.ceil(
      (Math.floor(Date.now() / 1000) - gameList.value[0].status.created_at) / 60 / 60 / 24
    );
  });

  const fetchProfileGameList = async () => {
    const response = await apiClient.fetchGameList();
    if (response.data) {
      gameList.value = response.data;
    }
  };

  return {
    gameList,
    days,
    fetchProfileGameList,
  };
}
