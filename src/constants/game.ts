import type { ApiGameGameConfig } from "@/shared/types/api";

export const GAME_PLATFORM_CODE = {
  OFFICIAL: 1,
  BILIBILI: 2,
} as const;

export const GAME_ACCOUNT_PREFIX = {
  OFFICIAL: "G",
  BILIBILI: "B",
} as const;

export const GAME_PLATFORM_OPTIONS = [
  { value: GAME_PLATFORM_CODE.BILIBILI, label: "BiliBili服" },
  { value: GAME_PLATFORM_CODE.OFFICIAL, label: "官服(安卓 / IOS)" },
] as const;

export const GAME_PLATFORM_LABEL = {
  [GAME_PLATFORM_CODE.OFFICIAL]: "官服",
  [GAME_PLATFORM_CODE.BILIBILI]: "B服",
} as const;

export const ACCELERATE_SLOT_CN = [
  "顶层左",
  "顶层中",
  "顶层右",
  "中层左",
  "中层中",
  "中层右",
  "底层左",
  "底层中",
  "底层右",
];

export const DEFAULT_GAME_CONFIG: ApiGameGameConfig = {
  account: "",
  accelerate_slot: "",
  accelerate_slot_cn: "",
  battle_maps: [],
  enable_building_arrange: false,
  is_auto_battle: false,
  is_stopped: false,
  keeping_ap: 0,
  recruit_ignore_robot: false,
  recruit_reserve: 0,
  map_id: "",
  allow_login_assist: false,
};

export enum GameResourceType {
  GOLD = "GOLD",
  DIAMOND_SHD = "DIAMOND_SHD",
  DIAMOND = "DIAMOND",
  AP_GAMEPLAY = "AP_GAMEPLAY",
}

export const GAME_STATUS_CODE = {
  LOGIN_FAILED: -1,
  NOT_STARTED: 0,
  LOGGING_IN: 1,
  RUNNING: 2,
  GAME_ERROR: 3,
} as const;

export const GAME_LOG_QUERYABLE_STATUS_CODES: readonly number[] = [
  GAME_STATUS_CODE.LOGGING_IN,
  GAME_STATUS_CODE.RUNNING,
  GAME_STATUS_CODE.GAME_ERROR,
];

export const REPLAY_PAGE_LIMIT = 20;

export const FALLBACK_HOT_STAGE_IDS: readonly string[] = Object.freeze([
  "main_01-07",
  "wk_kc_5",
  "wk_armor_5",
  "wk_fly_5",
  "wk_melee_5",
  "wk_toxic_5",
]);
