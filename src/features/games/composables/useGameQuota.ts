import type { RegistrySlot, RegistryUserInfo } from "@/shared/types/api";
import { checkIsMobile } from "@/shared/utils/regex";
import { getRealGameAccount } from "@/shared/utils/account";

export interface CanAddGameResult {
  message: string;
  isLocked: boolean;
}

export const quotaSlotsSort = (slotArray: RegistrySlot[]) => {
  const gameAccountNotNull = slotArray.filter((item) => item.gameAccount !== null);
  const gameAccountNull = slotArray.filter((item) => item.gameAccount === null);

  gameAccountNotNull.sort((first, second) => first.createdAt - second.createdAt);
  gameAccountNull.sort((first, second) => {
    const firstContainsBothFlags =
      first.ruleFlags.includes("slot_account_format_is_phone") &&
      first.ruleFlags.includes("slot_account_sms_verified");
    const secondContainsBothFlags =
      second.ruleFlags.includes("slot_account_format_is_phone") &&
      second.ruleFlags.includes("slot_account_sms_verified");

    if (firstContainsBothFlags === secondContainsBothFlags) {
      return first.createdAt - second.createdAt;
    }
    return firstContainsBothFlags ? -1 : 1;
  });

  return [...gameAccountNotNull, ...gameAccountNull];
};

export const getSMSSlot = (slotArray: RegistrySlot[]) => {
  return slotArray.find(
    (item) =>
      item.ruleFlags.includes("slot_account_format_is_phone") &&
      item.ruleFlags.includes("slot_account_sms_verified")
  );
};

export const canDeleteGame = (userQuota: RegistryUserInfo, gameAccount: string) => {
  if (!userQuota) {
    return false;
  }
  if (userQuota.idServerPhone.toString() === gameAccount) {
    return false;
  }
  if (userQuota.idServerPhone.toString() === "") {
    return true;
  }
  return true;
};

export const allowGameCreate = (
  slot: RegistrySlot,
  userQuota: RegistryUserInfo,
  isVerify: boolean
) => {
  const response: CanAddGameResult = {
    message: "请完成手机号绑定",
    isLocked: true,
  };
  if (!userQuota) {
    return response;
  }
  if (
    slot.ruleFlags.includes("slot_account_format_is_phone") &&
    slot.ruleFlags.includes("slot_account_sms_verified")
  ) {
    response.message = "添加第一个托管";
    response.isLocked = false;
    return response;
  }

  if (slot.ruleFlags.includes("slot_user_sms_verified") && isVerify) {
    response.message = "添加游戏托管";
    response.isLocked = false;
    return response;
  }

  if (slot.ruleFlags.includes("slot_user_qq_verified") && isVerify) {
    if (!userQuota.idServerQQ) {
      response.message = "请完成QQ绑定";
      return response;
    }
    response.message = "添加游戏托管";
    response.isLocked = false;
    return response;
  }

  if (slot.ruleFlags.length === 0 && isVerify) {
    response.message = "添加游戏托管";
    response.isLocked = false;
    return response;
  }
  return response;
};

export const getSMSSendPhone = (userQuota: RegistryUserInfo) => {
  const slots = userQuota.slots;
  const slot = getSMSSlot(slots);
  if (!slot || !slot.gameAccount) {
    return "";
  }
  const phone = getRealGameAccount(slot.gameAccount);
  if (!checkIsMobile(phone)) {
    return "";
  }
  return phone;
};
