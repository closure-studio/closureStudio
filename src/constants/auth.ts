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

export const PERMISSION_DETAILS = {
  [Permission.SuperAdmin]: {
    label: "超级管理员",
    description: "管理系统配置、用户权限与关键后台操作",
  },
  [Permission.TicketCreate]: {
    label: "创建工单",
    description: "允许发起新的工单记录",
  },
  [Permission.TicketUpdate]: {
    label: "处理工单",
    description: "允许跟进、更新和关闭工单",
  },
  [Permission.CommunityHelper]: {
    label: "社区协助者",
    description: "帮助管理员处理网站事务与用户支持",
  },
  [Permission.CreateGame]: {
    label: "创建托管",
    description: "允许该用户创建新的托管账号",
  },
  [Permission.QueryGame]: {
    label: "查询托管",
    description: "允许该用户查看自己的托管账号和运行状态",
  },
  [Permission.UpdateGame]: {
    label: "更新托管",
    description: "允许该用户调整自己的托管账号配置",
  },
  [Permission.DelGame]: {
    label: "删除托管",
    description: "允许该用户删除自己的托管账号",
  },
} as const satisfies Record<Permission, { label: string; description: string }>;

export type PermissionDetail = (typeof PERMISSION_DETAILS)[Permission];

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
