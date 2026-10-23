import apiClient from "@/services/apiClient";
import type { ApiSystemConfigUpdate } from "@/shared/types/api";
import { SYSTEM_CONFIG_MESSAGES } from "@/constants/systemAdmin";

export const isValidBattleStartAP = (value: unknown): value is number =>
  typeof value === "number" && Number.isSafeInteger(value) && value >= 0;

export const systemConfigApi = {
  fetchSystemConfig() {
    return apiClient.fetchSystemConfig();
  },

  updateSystemConfig(payload: ApiSystemConfigUpdate) {
    if ("battleStartAP" in payload && !isValidBattleStartAP(payload.battleStartAP)) {
      throw new Error(SYSTEM_CONFIG_MESSAGES.INVALID_BATTLE_START_AP);
    }
    return apiClient.doUpdateSystemConfig(payload);
  },
};
