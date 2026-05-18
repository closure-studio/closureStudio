import type { RegistrySlot, RegistryUserInfo } from "@/shared/types/api";
import { checkIsMobile } from "@/utils/regex";
import { getRealGameAccount } from "@/utils/account";
import { GAME_SLOT_RULE_FLAGS } from "@/constants/game";

export interface CanAddGameResult {
  message: string;
  isLocked: boolean;
}

const isAccountSMSSlot = (slot: RegistrySlot) =>
  slot.ruleFlags.includes(GAME_SLOT_RULE_FLAGS.ACCOUNT_FORMAT_IS_PHONE) &&
  slot.ruleFlags.includes(GAME_SLOT_RULE_FLAGS.ACCOUNT_SMS_VERIFIED);

export const isHiddenEmptySMSSlot = (slot: RegistrySlot) =>
  !slot.gameAccount && isAccountSMSSlot(slot);

export const quotaSlotsSort = (slotArray: RegistrySlot[]) => {
  const visibleSlots = slotArray.filter((item) => !isHiddenEmptySMSSlot(item));
  const gameAccountNotNull = visibleSlots.filter((item) => item.gameAccount !== null);
  const gameAccountNull = visibleSlots.filter((item) => item.gameAccount === null);

  gameAccountNotNull.sort((first, second) => first.createdAt - second.createdAt);
  gameAccountNull.sort((first, second) => {
    const firstContainsBothFlags = isAccountSMSSlot(first);
    const secondContainsBothFlags = isAccountSMSSlot(second);

    if (firstContainsBothFlags === secondContainsBothFlags) {
      return first.createdAt - second.createdAt;
    }
    return firstContainsBothFlags ? -1 : 1;
  });

  return [...gameAccountNotNull, ...gameAccountNull];
};

export const getSMSSlot = (slotArray: RegistrySlot[]) => {
  return slotArray.find(isAccountSMSSlot);
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
  if (isAccountSMSSlot(slot)) {
    response.message = "添加第一个托管";
    response.isLocked = false;
    return response;
  }

  if (slot.ruleFlags.includes(GAME_SLOT_RULE_FLAGS.USER_SMS_VERIFIED) && isVerify) {
    response.message = "添加游戏托管";
    response.isLocked = false;
    return response;
  }

  if (slot.ruleFlags.includes(GAME_SLOT_RULE_FLAGS.USER_QQ_VERIFIED) && isVerify) {
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
