import { fetchUserSlots } from "../../plugins/axios";
import { myState } from "./myGames";

export const queryUserQuota = async () => {
    try {
        const resp = await fetchUserSlots();
        if (resp.code == 1 && resp.data) {
            resp.data.slots = quotaSlotsSort(resp.data.slots);
            if (!myState) return true;
            myState.userQuota = resp.data;
            return true;
        }
        return false;
    } catch (error) {
        console.error("Error during queryMe:", error);
        return false;
    }
};

const quotaSlotsSort = (slotArray: Registry.Slot[]) => {
    // 分离gameAccount不为null的元素
    const gameAccountNotNull = slotArray.filter((item) => item.gameAccount !== null);
    // 分离gameAccount为null的元素
    const gameAccountNull = slotArray.filter((item) => item.gameAccount === null);
    gameAccountNotNull.sort((a, b) => a.createdAt - b.createdAt);
    gameAccountNull.sort((a, b) => {
        const aContainsBothFlags = a.ruleFlags.includes("slot_account_format_is_phone") && a.ruleFlags.includes("slot_account_sms_verified");
        const bContainsBothFlags = b.ruleFlags.includes("slot_account_format_is_phone") && b.ruleFlags.includes("slot_account_sms_verified");

        if (aContainsBothFlags === bContainsBothFlags) {
            return a.createdAt - b.createdAt; // 如果两者都有或都没有这两个标志，则按 createdAt 排序
        }
        return aContainsBothFlags ? -1 : 1; // 如果a包含这两个标志，而b不包含，则a应该排在前面，反之则b排在前面
    });
    return [...gameAccountNotNull, ...gameAccountNull];
};

export const getSMSSlot = (slotArray: Registry.Slot[]) => {
    //  "slot_account_format_is_phone",
    // "slot_account_sms_verified"
    return slotArray.find((item) => item.ruleFlags.includes("slot_account_format_is_phone") && item.ruleFlags.includes("slot_account_sms_verified"));
};

export interface canAddGameResult {
    message: string;
    isLocked: boolean;
}

export const canDeleteGame = (userQuota: Registry.UserInfo, gameAccount: string) => {
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

export const allowGameCreate = (slot: Registry.Slot, userQuota: Registry.UserInfo, isVerify: boolean) => {
    let response: canAddGameResult = {
        message: "请完成手机号绑定",
        isLocked: true
    };
    if (!userQuota) {
        return response;
    }
    if (slot.ruleFlags.includes("slot_account_format_is_phone") && slot.ruleFlags.includes("slot_account_sms_verified")) {
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
        } else {
            response.message = "添加游戏托管";
            response.isLocked = false;
            return response;
        }
    }
    if (slot.ruleFlags.length === 0 && isVerify) {
        response.message = "添加游戏托管";
        response.isLocked = false;
        return response;
    }
    return response;
};
