import { computed, ref } from "vue";
import type { Items, Stages } from "@/shared/types/gamedata";
import { setMsg } from "@/shared/utils/toast";
import { Type } from "@/shared/components/toast/enum";
import { constants } from "@/shared/constants/config";
import apiClient from "@/shared/services/apiClient";

const itemData = ref<Items>({});
const stageData = ref<Stages>({});

const assets = computed(() => {
  const getStageName = (stageId: string) => {
    const stage = stageData.value[stageId];
    return stage ? stage.name : "未知关卡";
  };

  const getItemName = (itemId: string) => {
    const item = itemData.value[itemId];
    return item ? item.name : "未知物品";
  };

  const getItemIcon = (itemId: string) => {
    const item = itemData.value[itemId];
    return item ? item.icon : "";
  };

  const filteredStages = (keyword: string) => {
    // 如果keyword为空，返回空对象
    if (!keyword || keyword.trim() === "") {
      return {} as Stages;
    }

    const data = Object.entries(stageData.value).reduce((acc, [key, originalValue]) => {
      if (
        Object.keys(acc).length < 18 &&
        (key.includes(keyword) ||
          originalValue.code.includes(keyword.toUpperCase()) ||
          originalValue.name.includes(keyword))
      ) {
        const value = { ...originalValue, name: originalValue.name };

        if (key.includes("tough")) {
          value.name += " (磨难)";
        }
        acc[key] = value;
      }
      return acc;
    }, {} as Stages);

    return data;
  };

  const getItemLink = (key: string) => {
    const item = itemData.value[key];
    if (!item) {
      return "";
    }
    // https://assets.ltsc.vip/items/LIMITED_TKT_GACHA_10_2501.png
    return `${constants.AssetsHost}/items/${item.icon}.png`;
  };

  return {
    getStageName,
    getItemName,
    getItemIcon,
    filteredStages,
    getItemLink,
    stages: stageData,
    items: itemData,
  };
});

const loadItems = async () => {
  try {
    itemData.value = await apiClient.load<Items>("items");
  } catch (error) {
    console.error("Error loading items data:", error);
    throw error;
  }
};

const loadStages = async () => {
  try {
    const stagesData = await apiClient.load<Stages>("stages");
    stageData.value = stagesData;
  } catch (error) {
    console.error("Error loading stages data:", error);
    throw error;
  }
};

const loadAssets = async () => {
  try {
    await Promise.all([loadItems(), loadStages()]);
    setMsg("数据加载成功", Type.Success);
  } catch (error) {
    setMsg("数据加载失败", Type.Warning);
    console.error("Error loading data:", error);
    throw error; // 抛出错误以便上游代码捕获
  }
};

export { assets, loadAssets };
