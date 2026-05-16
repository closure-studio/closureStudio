import { maskSensitiveIdentifier } from "./format";

describe("format", () => {
  test("maskSensitiveIdentifier 对中段做星号脱敏", () => {
    expect(maskSensitiveIdentifier("13800138000")).toBe("1380***8000");
    expect(maskSensitiveIdentifier("123456789")).toBe("123***789");
  });

  test("maskSensitiveIdentifier 保留空值和短值", () => {
    expect(maskSensitiveIdentifier("")).toBe("");
    expect(maskSensitiveIdentifier("1")).toBe("1");
  });
});
