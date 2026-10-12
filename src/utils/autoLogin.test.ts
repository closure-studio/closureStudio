import {
  canRenewAutoLogin,
  getNextAutoLoginUntil,
  isAutoLoginEnabled,
} from "@/utils/autoLogin";

const NOW = 1_800_000_000;
const DAY = 24 * 60 * 60;

describe("autoLogin utils", () => {
  it("treats null, 0 and expired values as disabled", () => {
    expect(isAutoLoginEnabled(null, NOW)).toBe(false);
    expect(isAutoLoginEnabled(0, NOW)).toBe(false);
    expect(isAutoLoginEnabled(NOW, NOW)).toBe(false);
    expect(isAutoLoginEnabled(NOW + 1, NOW)).toBe(true);
  });

  it("extends by 31 days in seconds", () => {
    expect(getNextAutoLoginUntil(NOW)).toBe(NOW + 31 * DAY);
  });

  it("locks renewing for 24 hours after a renew", () => {
    expect(canRenewAutoLogin(null, NOW)).toBe(true);
    expect(canRenewAutoLogin(NOW - 1, NOW)).toBe(true);
    expect(canRenewAutoLogin(NOW + 30 * DAY, NOW)).toBe(true);
    expect(canRenewAutoLogin(NOW + 30 * DAY + 1, NOW)).toBe(false);
    expect(canRenewAutoLogin(NOW + 31 * DAY, NOW)).toBe(false);
  });
});
