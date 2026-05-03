export const ROUTES = {
  HOME: { name: "首页", path: "/" },
  DASHBOARD: { name: "托管账号", path: "/dashboard" },
  GAME_DETAIL: { name: "游戏详情", path: "/dashboard/game/:account" },
  REPLAY_HUB: { name: "录像中心", path: "/replayHub" },
  PROFILE: { name: "网站设置", path: "/profile/network" },
  PROFILE_NETWORK: { name: "网络设置", path: "/profile/network" },
  PROFILE_ACCOUNT: { name: "账号安全", path: "/profile/account" },
  PROFILE_SMS_VERIFY: { name: "账号认证", path: "/profile/smsVerify" },
  PROFILE_ACKNOWLEDGEMENTS: { name: "鸣谢名单", path: "/profile/acknowledgements" },
  TERMS_POLICIES: { name: "用户条款及隐私政策", path: "/blog/Terms&Policies" },
  FAQ: { name: "常见问题", path: "/blog/FAQ" },
  OAUTH_CALLBACK_LINUXDO: { name: "OAuthCallback", path: "/auth/callback/linuxdo" },
  ADMIN: { name: "系统管理", path: "/admin" },
} as const;

export type RouteName = (typeof ROUTES)[keyof typeof ROUTES]["name"];
