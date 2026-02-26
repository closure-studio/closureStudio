// ============================================================
// 路由名称常量 — 替代中文字符串路由名
// ============================================================

export const ROUTE_NAMES = {
  HOME: "首页",
  TERMS_POLICIES: "用户条款及隐私政策",
  FAQ: "常见问题",
  PROFILE: "个人设置",
  PROFILE_NETWORK: "网络设置",
  PROFILE_ACCOUNT: "账号安全",
  PROFILE_SMS_VERIFY: "账号认证",
  DASHBOARD: "控制面板",
} as const;

export type RouteName = (typeof ROUTE_NAMES)[keyof typeof ROUTE_NAMES];
