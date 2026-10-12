// 掉线自动登录（auto_login_until，Unix 秒）相关工具函数。

const HOUR = 60 * 60;
const DAY = 24 * HOUR;

/** 每次续期的天数 */
export const AUTO_LOGIN_EXTEND_DAYS = 31;
/** 剩余时间超过该值说明 24 小时内已续期过，前端限制再次续期 */
const RENEW_LOCK_SECONDS = (AUTO_LOGIN_EXTEND_DAYS - 1) * DAY;

export const nowSeconds = (): number => Math.floor(Date.now() / 1000);

export const isAutoLoginEnabled = (
  until: number | null | undefined,
  now: number,
): until is number => typeof until === "number" && until > now;

export const getRemainingSeconds = (
  until: number | null | undefined,
  now: number,
): number => (isAutoLoginEnabled(until, now) ? until - now : 0);

/** 距离可再次续期还需等待的秒数，0 表示现在可以续期 */
export const getRenewWaitSeconds = (
  until: number | null | undefined,
  now: number,
): number => Math.max(0, getRemainingSeconds(until, now) - RENEW_LOCK_SECONDS);

export const getNextAutoLoginUntil = (now: number): number =>
  now + AUTO_LOGIN_EXTEND_DAYS * DAY;

/** 如 “12 天”“5 小时”“不到 1 小时” */
export const formatDuration = (seconds: number): string => {
  if (seconds >= DAY) return `${Math.floor(seconds / DAY)} 天`;
  if (seconds >= HOUR) return `${Math.floor(seconds / HOUR)} 小时`;
  return "不到 1 小时";
};
