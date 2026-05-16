import { API_RESPONSE_CODE } from "@/constants/api";
import { Permission } from "@/constants/auth";
import { USER_MANAGEMENT_MESSAGES } from "@/constants/systemAdmin";
import type { ApiUserUser } from "@/shared/types/api";
import authClient from "@/services/authClient";
import { canAccessSystemAdmin } from "@/utils/permission";

export interface SaveUserPermissionParams {
  operatorPermission: number;
  uuid: string;
  originalPermission: number;
  draftPermission: number;
}

export interface SaveUserPermissionResult {
  permission: number;
  changed: boolean;
}

export const canSearchAdminUser = (operatorPermission: number) =>
  canAccessSystemAdmin(operatorPermission);

export const canUpdateUserPermission = (operatorPermission: number) =>
  (operatorPermission & Permission.SuperAdmin) === Permission.SuperAdmin;

export const searchFirstAdminUser = async (value: string): Promise<ApiUserUser | null> => {
  const keyword = value.trim();
  if (!keyword) {
    return null;
  }

  const response = await authClient.queryUser(keyword);
  if (response.code !== API_RESPONSE_CODE.SUCCESS) {
    throw new Error(response.message || USER_MANAGEMENT_MESSAGES.SEARCH_FAILED);
  }

  return response.data[0] ?? null;
};

export const saveUserPermission = async ({
  operatorPermission,
  uuid,
  originalPermission,
  draftPermission,
}: SaveUserPermissionParams): Promise<SaveUserPermissionResult> => {
  if (!canUpdateUserPermission(operatorPermission)) {
    throw new Error(USER_MANAGEMENT_MESSAGES.NO_PERMISSION);
  }
  if (!uuid) {
    throw new Error(USER_MANAGEMENT_MESSAGES.USER_ID_EMPTY);
  }
  if (originalPermission === draftPermission) {
    return {
      permission: originalPermission,
      changed: false,
    };
  }

  const response = await authClient.updateUserPermission(uuid, draftPermission);
  if (response.code !== API_RESPONSE_CODE.SUCCESS) {
    throw new Error(response.message || USER_MANAGEMENT_MESSAGES.UPDATE_FAILED);
  }

  return {
    permission: draftPermission,
    changed: true,
  };
};
