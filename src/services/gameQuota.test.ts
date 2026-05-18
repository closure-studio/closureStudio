import type { RegistrySlot } from "@/shared/types/api";
import { GAME_SLOT_RULE_FLAGS } from "@/constants/game";
import { quotaSlotsSort } from "./gameQuota";

const createSlot = (slot: Partial<RegistrySlot>): RegistrySlot => ({
  createdAt: 0,
  gameAccount: null,
  ruleFlags: [],
  updatedAt: 0,
  useFlagDefaults: false,
  uuid: "",
  ...slot,
});

describe("gameQuota", () => {
  test("quotaSlotsSort 隐藏空账号的手机短信验证槽", () => {
    const hiddenSlot = createSlot({
      uuid: "hidden",
      gameAccount: null,
      ruleFlags: [
        GAME_SLOT_RULE_FLAGS.ACCOUNT_FORMAT_IS_PHONE,
        GAME_SLOT_RULE_FLAGS.ACCOUNT_SMS_VERIFIED,
      ],
    });
    const normalEmptySlot = createSlot({
      uuid: "normal-empty",
      gameAccount: null,
      ruleFlags: [],
    });
    const usedSMSSlot = createSlot({
      uuid: "used-sms",
      gameAccount: "13800138000",
      ruleFlags: [
        GAME_SLOT_RULE_FLAGS.ACCOUNT_FORMAT_IS_PHONE,
        GAME_SLOT_RULE_FLAGS.ACCOUNT_SMS_VERIFIED,
      ],
    });

    expect(quotaSlotsSort([hiddenSlot, normalEmptySlot, usedSMSSlot])).toEqual([
      usedSMSSlot,
      normalEmptySlot,
    ]);
  });
});
