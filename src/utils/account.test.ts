import { GAME_PLATFORM_CODE, GAME_PLATFORM_OPTIONS } from "@/constants/game";
import { buildGameAccount } from "./account";

describe("HTTP API game constants", () => {
  test("服务器选择只显示官服和 B 服", () => {
    expect(GAME_PLATFORM_OPTIONS).toEqual([
      { value: GAME_PLATFORM_CODE.BILIBILI, label: "BiliBili服" },
      { value: GAME_PLATFORM_CODE.OFFICIAL, label: "官服（安卓 / IOS）" },
    ]);
  });

  test.each([
    [1, "G123"],
    [2, "B123"],
  ])("平台 %i 使用正确账号前缀", (platform, account) => {
    expect(buildGameAccount("123", platform)).toBe(account);
  });
});
