import {
  formatDuration,
  getNextAutoLoginUntil,
  getRemainingSeconds,
  getRenewWaitSeconds,
  isAutoLoginEnabled,
} from "@/utils/autoLogin";

const NOW = 1_800_000_000;
const HOUR = 60 * 60;
const DAY = 24 * HOUR;

describe("autoLogin utils", () => {
  it("treats null, 0 and expired values as disabled", () => {
    expect(isAutoLoginEnabled(null, NOW)).toBe(false);
    expect(isAutoLoginEnabled(0, NOW)).toBe(false);
    expect(isAutoLoginEnabled(NOW, NOW)).toBe(false);
    expect(isAutoLoginEnabled(NOW + 1, NOW)).toBe(true);
    expect(getRemainingSeconds(NOW - 10, NOW)).toBe(0);
  });

  it("extends by 31 days in seconds", () => {
    expect(getNextAutoLoginUntil(NOW)).toBe(NOW + 31 * DAY);
  });

  it("locks renewing for 24 hours after a renew", () => {
    expect(getRenewWaitSeconds(null, NOW)).toBe(0);
    expect(getRenewWaitSeconds(NOW + 30 * DAY, NOW)).toBe(0);
    expect(getRenewWaitSeconds(NOW + 30 * DAY + 1, NOW)).toBe(1);
    expect(getRenewWaitSeconds(NOW + 31 * DAY, NOW)).toBe(DAY);
  });

  it("formats durations", () => {
    expect(formatDuration(3 * DAY + 5)).toBe("3 天");
    expect(formatDuration(5 * HOUR)).toBe("5 小时");
    expect(formatDuration(60)).toBe("不到 1 小时");
  });
});
