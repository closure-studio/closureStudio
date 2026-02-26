// ============================================================
// API 类型定义 — 从 src/typings/api.d.ts 迁移
// declare namespace → export interface/type
// ============================================================

// --- ApiSystem ---

export interface ApiSystemConfig {
  isUnderMaintenance: boolean;
  isDebugMode: boolean;
  announcement: string;
  allowGameLogin: boolean;
  allowGameCreate: boolean;
  allowGameUpdate: boolean;
  allowGameDelete: boolean;
}

export interface ApiSystemHall {
  Account: string;
  nickName: string;
  totalAPCosts: number;
  level: number;
  avatar: {
    type: string;
    id: string;
  };
}

// --- ApiUser ---

export interface ApiUserAuth {
  token: string;
}

export interface ApiUserInfo {
  uuid: string;
  email: string;
  permission: number;
  status: number; // 0封禁 -1未验证手机 1正常 2人工验证
  isAdmin: boolean;
  exp: number;
  slot: number;
  createdAt: number;
}

export interface ApiUserUser {
  ID: number;
  UserEmail: string;
  Password: string;
  UUID: string;
  Status: number;
  IP: string;
  Slot: number;
  QQ: string;
  Phone: string;
  Permission: number;
  CreatedTs: number;
  UpdateTs: number;
}

// --- ApiGame ---

export interface ApiGameConfig {
  accelerate_slot?: string;
  accelerate_slot_cn?: string;
  account?: string;
  allow_login_assist?: boolean;
  battle_maps?: string[] | string;
  enable_building_arrange?: boolean;
  is_auto_battle?: boolean;
  is_stopped?: boolean;
  keeping_ap?: number;
  map_id?: string;
  recruit_ignore_robot?: boolean;
  recruit_reserve?: number;
}

export interface ApiGameScreenshot {
  uTCTime: number;
  fileName: string[];
  host: string;
  type: number;
  url: string;
}

export interface ApiGameAvatar {
  id: string;
  type: string;
}

export interface ApiGameStatus {
  androidDiamond: number;
  ap: number;
  avatar: ApiGameAvatar;
  avatarId: string;
  diamondShard: number;
  gachaTicket: number;
  gold: number;
  lastApAddTime: number;
  level: number;
  maxAp: number;
  nickName: string;
  recruitLicense: number;
  secretary: string;
  secretarySkinId: string;
  socialPoint: number;
  tenGachaTicket: number;
}

export interface ApiGameDetail {
  config: ApiGameConfig;
  consumable?: any;
  inventory?: any;
  lastFreshTs: number;
  screenshot: ApiGameScreenshot[];
  status: ApiGameStatus;
  troop?: any;
}

export interface ApiGameLogs {
  logs: ApiGameLogEntry[];
  hasMore: boolean;
}

export interface ApiGameLogEntry {
  id: number;
  ts: number;
  name: string;
  logLevel: number;
  content: string;
}

export interface ApiGameGameStatus {
  account: string;
  password: string | null;
  platform: number;
  uuid: string;
  code: number; // -1=登陆失败 0=未开启/未初始化 1=登录中 2=运行中 3=游戏错误
  text: string;
  nick_name: string;
  level: number;
  avatar: {
    type: string;
    id: string;
  };
  created_at: number;
  is_verify: boolean;
  ap: number;
}

export interface ApiGameCaptchaInfo {
  // GT3 字段
  challenge?: string;
  gt?: string;
  // GT4 字段
  geetestId?: string;
  riskType?: string;
  // 通用字段
  created: number;
  captcha_type: string;
}

export interface ApiGameGameConfig {
  account: string;
  accelerate_slot: string;
  accelerate_slot_cn: string;
  battle_maps: string[];
  enable_building_arrange: boolean;
  is_auto_battle: boolean;
  is_stopped: boolean;
  keeping_ap: number;
  recruit_ignore_robot: boolean;
  recruit_reserve: number;
  map_id: string;
  allow_login_assist: boolean;
}

export interface ApiGameGame {
  status: ApiGameGameStatus;
  captcha_info: ApiGameCaptchaInfo;
  game_config: ApiGameGameConfig;
}

export interface ApiGameSSR {
  account: string;
  nickName: string;
  avatar: ApiGameAvatar;
  gachaInfo: string;
  charId: string;
  createdAt: number;
}

export interface ApiGameLogEvent extends MessageEvent {
  name: string;
  content: string;
}

// --- Registry ---

export interface RegistryAddGameForm {
  account: string;
  password: string;
  platform: number;
}

export interface RegistryAccountFound {
  account: string;
}

export interface RegistryUserInfo {
  createdAt: number;
  idServerPermission: number;
  idServerPhone: string;
  idServerQQ: string;
  idServerStatus: number;
  ruleFlags: [];
  rules: [];
  slots: RegistrySlot[];
  updatedAt: number;
  uuid: string;
}

export interface RegistrySlot {
  createdAt: number;
  gameAccount: string | null;
  ruleFlags: string[];
  updatedAt: number;
  useFlagDefaults: boolean;
  uuid: string;
}

// --- HealthMonitor ---

export type HealthRecord = Record<string, string>;
