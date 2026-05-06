import { ref, readonly } from "vue";

/**
 * 热门作战地图（资源本/常用本）的回退列表。
 *
 * NOTE: 关卡内部 ID 需与后端 stage_table.json 中的 key 一致；
 * 实施期请对照 assets.stages 校验。下列 ID 为常见的资源本/活动本：
 *   - main_01-07：1-7（经验本）
 *   - wk_kc_5：龙门币本（CE-6 一图多号请按需调整）
 *   - wk_armor_5：碳本 / 装备本
 *   - wk_fly_5：芯片 / 等同 CA-5
 *   - wk_melee_5：技1 / 等同 AP-5
 *   - wk_toxic_5：技2 / 等同 SK-5
 */
export const FALLBACK_HOT_STAGE_IDS: readonly string[] = Object.freeze([
  "main_01-07",
  "wk_kc_5",
  "wk_armor_5",
  "wk_fly_5",
  "wk_melee_5",
  "wk_toxic_5",
]);

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
    //   if (resp?.code === 1 && Array.isArray(resp.data) && resp.data.length) {
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
