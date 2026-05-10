import { ref, readonly } from "vue";
import { FALLBACK_HOT_STAGE_IDS } from "@/constants/replay";

/**
 * 提供「热门作战地图」的关卡 ID 列表。
 *
 * 当前实现：硬编码 fallback。
 * 预留：refresh() 钩子用于将来对接后端 hotStages API。
 */
export function useHotStages() {
  const stageIds = ref<string[]>([...FALLBACK_HOT_STAGE_IDS]);
  const isLoading = ref(false);

  const refresh = async () => {
    // TODO: 接入后端 /game/replays/hotStages 接口；失败时保留 fallback。
    // 例：
    //   const resp = await replayApi.listHotStages?.();
    //   if (响应成功 && Array.isArray(resp.data) && resp.data.length) {
    //     stageIds.value = resp.data;
    //   }
    isLoading.value = false;
  };

  return {
    stageIds: readonly(stageIds),
    isLoading: readonly(isLoading),
    refresh,
  };
}
