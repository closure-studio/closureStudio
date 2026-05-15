import { API_RESPONSE_CODE } from "@/constants/api";
import type {
  ApiSystemConfig,
  ApiSystemConfigEditable,
  ApiSystemConfigUpdate,
} from "@/shared/types/api";
import { canAccessSystemAdmin } from "@/utils/permission";
import { mergeQQGroups } from "@/stores/useSystemAdminStore";
import { systemConfigApi } from "@/services/systemConfigClient";
import {
  DEFAULT_QQ_GROUPS,
  EDITABLE_SYSTEM_CONFIG_KEYS,
  SYSTEM_CONFIG_MESSAGES,
} from "@/constants/systemAdmin";

export const pickApiSystemConfigEditable = (config: ApiSystemConfig): ApiSystemConfigEditable => ({
  announcement: config.announcement,
  allowGameLogin: config.allowGameLogin,
  allowGameCreate: config.allowGameCreate,
  allowGameUpdate: config.allowGameUpdate,
  allowGameDelete: config.allowGameDelete,
});

export const buildApiSystemConfigUpdate = (
  originalConfig: ApiSystemConfigEditable,
  draftConfig: ApiSystemConfigEditable
): ApiSystemConfigUpdate => {
  return EDITABLE_SYSTEM_CONFIG_KEYS.reduce<ApiSystemConfigUpdate>((payload, key) => {
    if (originalConfig[key] !== draftConfig[key]) {
      payload[key] = draftConfig[key] as never;
    }
    return payload;
  }, {});
};

export const hasApiSystemConfigUpdate = (payload: ApiSystemConfigUpdate) =>
  Object.keys(payload).length > 0;

export const getAnnouncementNotifyGroups = (customGroups: string[]) =>
  mergeQQGroups([...DEFAULT_QQ_GROUPS, ...customGroups]);

export const notifyAnnouncementPlaceholder = async (announcement: string, groups: string[]) => {
  console.info(SYSTEM_CONFIG_MESSAGES.QQBOT_NOT_READY, { announcement, groups: mergeQQGroups(groups) });
};

export const loadApiSystemConfigEditable = async () => {
  const response = await systemConfigApi.fetchSystemConfig();
  if (response.code !== API_RESPONSE_CODE.SUCCESS || !response.data) {
    throw new Error(response.message || SYSTEM_CONFIG_MESSAGES.LOAD_FAILED);
  }
  return pickApiSystemConfigEditable(response.data);
};

export const saveApiSystemConfigEditable = async (params: {
  userPermission: number;
  originalConfig: ApiSystemConfigEditable;
  draftConfig: ApiSystemConfigEditable;
  customQQGroups: string[];
}) => {
  if (!canAccessSystemAdmin(params.userPermission)) {
    throw new Error(SYSTEM_CONFIG_MESSAGES.NO_PERMISSION);
  }

  const payload = buildApiSystemConfigUpdate(params.originalConfig, params.draftConfig);
  if (!hasApiSystemConfigUpdate(payload)) {
    return {
      payload,
      config: params.originalConfig,
    };
  }

  const response = await systemConfigApi.updateSystemConfig(payload);
  if (response.code !== API_RESPONSE_CODE.SUCCESS) {
    throw new Error(response.message || SYSTEM_CONFIG_MESSAGES.UPDATE_FAILED);
  }

  if (payload.announcement !== undefined) {
    await notifyAnnouncementPlaceholder(
      payload.announcement,
      getAnnouncementNotifyGroups(params.customQQGroups)
    );
  }

  return {
    payload,
    config: params.draftConfig,
  };
};
