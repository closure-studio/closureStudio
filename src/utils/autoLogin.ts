// 掉线自动登录（auto_login_until，Unix 秒）相关工具函数。

const DAY = 24 * 60 * 60;

/** 每次续期的天数 */
export const AUTO_LOGIN_EXTEND_DAYS = 31;
/** 剩余时间超过该值说明 24 小时内已续期过，前端限制再次续期 */
const RENEW_LOCK_SECONDS = (AUTO_LOGIN_EXTEND_DAYS - 1) * DAY;

export const nowSeconds = (): number => Math.floor(Date.now() / 1000);

export const isAutoLoginEnabled = (
  until: number | null | undefined,
  now: number,
): until is number => typeof until === "number" && until > now;

export const canRenewAutoLogin = (
  until: number | null | undefined,
  now: number,
): boolean =>
  !isAutoLoginEnabled(until, now) || until - now <= RENEW_LOCK_SECONDS;

export const getNextAutoLoginUntil = (now: number): number =>
  now + AUTO_LOGIN_EXTEND_DAYS * DAY;
