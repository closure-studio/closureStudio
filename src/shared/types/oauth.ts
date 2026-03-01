// Linux.do OIDC 配置类型
export interface LinuxDoOIDCConfig {
  authorization_endpoint: string;
  token_endpoint: string;
  userinfo_endpoint: string;
  revocation_endpoint: string;
  jwks_uri: string;
  issuer: string;
  scopes_supported: string[];
  response_types_supported: string[];
  grant_types_supported: string[];
  subject_types_supported: string[];
  id_token_signing_alg_values_supported: string[];
  claims_supported: string[];
  code_challenge_methods_supported: string[];
  token_endpoint_auth_methods_supported: string[];
}

// Linux.do 用户信息类型（基于 claims_supported）
export interface LinuxDoUserInfo {
  sub: string; // 用户唯一标识
  iss: string; // 发行者
  aud: string; // 受众
  exp: number; // 过期时间
  iat: number; // 签发时间
  nbf: number; // 生效时间
  azp: string; // 授权方
  username: string; // 用户名
  login: string; // 登录名
  name: string; // 显示名称
  email: string; // 邮箱
  avatar_url: string; // 头像 URL
  active: boolean; // 是否活跃
  trust_level: number; // 信任等级
  silenced: boolean; // 是否被禁言
}

// Token 响应类型
export interface OAuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  id_token?: string;
}

// OAuth 状态类型
export interface OAuthState {
  state: string;
  redirectUri: string;
  timestamp: number;
}
