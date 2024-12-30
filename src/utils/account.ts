export function processGameAccount(account: string): { code: number; remaining: string } | null {
    if (!account || account.length === 0) {
        return null; // 空字符串或者未定义返回 null
    }

    const firstChar = account.charAt(0);
    const remaining = account.slice(1);

    if (firstChar === 'G') {
        return { code: 1, remaining };
    } else if (firstChar === 'B') {
        return { code: 2, remaining };
    }

    return null;
}