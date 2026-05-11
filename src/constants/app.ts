const PROFILE_NETWORK_PATH = "/profile/network";

export const ROUTES = {
  HOME: { name: "首页", path: "/" },
  DASHBOARD: { name: "托管账号", path: "/dashboard" },
  GAME_DETAIL: { name: "游戏详情", path: "/dashboard/game/:account" },
  REPLAY_HUB: { name: "录像中心", path: "/replayHub" },
  PROFILE: { name: "网站设置", path: PROFILE_NETWORK_PATH },
  PROFILE_NETWORK: { name: "网络设置", path: PROFILE_NETWORK_PATH },
  PROFILE_ACCOUNT: { name: "账号安全", path: "/profile/account" },
  PROFILE_SMS_VERIFY: { name: "账号认证", path: "/profile/smsVerify" },
  PROFILE_ACKNOWLEDGEMENTS: { name: "鸣谢名单", path: "/profile/acknowledgements" },
  TERMS_POLICIES: { name: "用户条款及隐私政策", path: "/blog/Terms&Policies" },
  FAQ: { name: "常见问题", path: "/blog/FAQ" },
  OAUTH_CALLBACK_LINUXDO: { name: "OAuthCallback", path: "/auth/callback/linuxdo" },
  ADMIN: { name: "系统管理", path: "/admin" },
} as const;

export const STORAGE_KEYS = {
  API_HOST: "apiHost",
  LAST_READ_TS: "lastReadTs",
  OAUTH_STATE: "oauth_state",
  THEME: "theme",
  USER: "closureV3_user",
  SW_LOADER_STATE: "test",
} as const;

export const PROFILE_MENU_KEYS = {
  OVERVIEW: "overview",
  NETWORK: "network",
  ACCOUNT: "account",
  ACKNOWLEDGEMENTS: "acknowledgements",
} as const;

export type ProfileMenuKey = (typeof PROFILE_MENU_KEYS)[keyof typeof PROFILE_MENU_KEYS];
