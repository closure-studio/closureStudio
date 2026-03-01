export const LINUXDO_OAUTH_CONFIG = {
  authorizationEndpoint: "https://connect.linux.do/oauth2/authorize",
  tokenEndpoint: "https://connect.linux.do/oauth2/token",
  userInfoEndpoint: "https://connect.linux.do/api/user",
  clientId: import.meta.env.VITE_OAUTH_LINUXDO_CLIENT_ID,
  scopes: ["openid", "profile", "email"],
  responseType: "code",
} as const;

// 获取当前环境的回调 URI
export function getRedirectUri(): string {
  // 在开发环境和生产环境中动态获取
  if (import.meta.env.DEV) {
    return `${window.location.origin}/auth/callback/linuxdo`;
  }
  return `${window.location.origin}/auth/callback/linuxdo`;
}
