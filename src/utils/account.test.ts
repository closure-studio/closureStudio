import { buildGameAccount } from "./account";

describe("HTTP API game constants", () => {
  test.each([
    [0, "G123"],
    [1, "G123"],
    [2, "B123"],
  ])("平台 %i 使用正确账号前缀", (platform, account) => {
    expect(buildGameAccount("123", platform)).toBe(account);
  });
});
