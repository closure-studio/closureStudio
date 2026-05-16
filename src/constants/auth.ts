import { ROUTES } from "@/constants/app";

export enum AuthModelType {
  Login,
  Register,
  ForgetPassword,
  ForgetAccount,
}

export enum Permission {
  SuperAdmin = 1 << 0,
  TicketCreate = 1 << 1,
  TicketUpdate = 1 << 2,
  CommunityHelper = 1 << 3,
  CreateGame = 1 << 4,
  QueryGame = 1 << 5,
  UpdateGame = 1 << 6,
  DelGame = 1 << 7,
}

export const OAUTH_STATE_EXPIRES_IN_MS = 10 * 60 * 1000;

export const LINUXDO_OAUTH_CONFIG = {
  authorizationEndpoint: "https://connect.linux.do/oauth2/authorize",
  tokenEndpoint: "https://connect.linux.do/oauth2/token",
  userInfoEndpoint: "https://connect.linux.do/api/user",
  scopes: ["openid", "profile", "email"],
  responseType: "code",
  callbackPath: ROUTES.OAUTH_CALLBACK_LINUXDO.path,
} as const;

export const MOBILE_PHONE_PATTERN = /(?:\+?86)?(?:\s|-)?1[3-9]\d{9}/;
export const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;

export const EMAIL_USERNAME_MIN_LENGTH = 6;
export const EMAIL_USERNAME_MAX_LENGTH = 20;
