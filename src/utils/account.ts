import { GAME_ACCOUNT_PREFIX, GAME_PLATFORM_CODE } from "@/constants/game";

/**
 * 解析游戏账号前缀，返回平台代码和纯账号
 * "G12345" → { code: 1, remaining: "12345" }
 * "B12345" → { code: 2, remaining: "12345" }
 */
export function processGameAccount(account: string): { code: number; remaining: string } | null {
  if (!account || account.length === 0) {
    return null;
  }

  const firstChar = account.charAt(0);
  const remaining = account.slice(1);

  if (firstChar === GAME_ACCOUNT_PREFIX.OFFICIAL) {
    return { code: GAME_PLATFORM_CODE.OFFICIAL, remaining };
  } else if (firstChar === GAME_ACCOUNT_PREFIX.BILIBILI) {
    return { code: GAME_PLATFORM_CODE.BILIBILI, remaining };
  }

  return null;
}

/**
 * 去掉游戏账号的平台前缀 (G/B)
 * "G12345" → "12345"
 */
export function getRealGameAccount(gameAccount: string | undefined): string {
  if (!gameAccount) {
    return "";
  }
  if (
    gameAccount.startsWith(GAME_ACCOUNT_PREFIX.OFFICIAL) ||
    gameAccount.startsWith(GAME_ACCOUNT_PREFIX.BILIBILI)
  ) {
    return gameAccount.substring(1);
  }
  return gameAccount;
}

/**
 * 根据平台代码给账号加上前缀
 * ("12345", 1) → "G12345"
 * ("12345", 2) → "B12345"
 */
export function buildGameAccount(account: string, platform: number): string {
  if (platform === GAME_PLATFORM_CODE.OFFICIAL) {
    return GAME_ACCOUNT_PREFIX.OFFICIAL + account;
  }
  if (platform === GAME_PLATFORM_CODE.BILIBILI) {
    return GAME_ACCOUNT_PREFIX.BILIBILI + account;
  }
  return account;
}
