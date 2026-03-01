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

  if (firstChar === "G") {
    return { code: 1, remaining };
  } else if (firstChar === "B") {
    return { code: 2, remaining };
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
  if (gameAccount.startsWith("G") || gameAccount.startsWith("B")) {
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
  if (platform === 1) {
    return "G" + account;
  }
  if (platform === 2) {
    return "B" + account;
  }
  return account;
}
