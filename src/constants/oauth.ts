import { ROUTES } from "@/constants/routes";

export const OAUTH_STATE_EXPIRES_IN_MS = 10 * 60 * 1000;

export const LINUXDO_OAUTH_CONFIG = {
  authorizationEndpoint: "https://connect.linux.do/oauth2/authorize",
  tokenEndpoint: "https://connect.linux.do/oauth2/token",
  userInfoEndpoint: "https://connect.linux.do/api/user",
  clientId: import.meta.env.VITE_OAUTH_LINUXDO_CLIENT_ID,
  scopes: ["openid", "profile", "email"],
  responseType: "code",
  callbackPath: ROUTES.OAUTH_CALLBACK_LINUXDO.path,
} as const;
