import apiClient from "@/services/apiClient";
import type { ApiSystemConfigUpdate } from "@/shared/types/api";

export const systemConfigApi = {
  fetchSystemConfig() {
    return apiClient.fetchSystemConfig();
  },

  updateSystemConfig(payload: ApiSystemConfigUpdate) {
    return apiClient.doUpdateSystemConfig(payload);
  },
};
