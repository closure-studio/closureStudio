import type { AccelerateSlot, ApiGameGameConfig } from "@/shared/types/api";

export const GAME_PLATFORM_CODE = {
  IOS: 0,
  OFFICIAL: 1,
  BILIBILI: 2,
} as const;

export const GAME_ACCOUNT_PREFIX = {
  OFFICIAL: "G",
  BILIBILI: "B",
} as const;

export const GAME_PLATFORM_OPTIONS = [
  { value: GAME_PLATFORM_CODE.BILIBILI, label: "BiliBili服" },
  { value: GAME_PLATFORM_CODE.OFFICIAL, label: "官服(安卓)" },
  { value: GAME_PLATFORM_CODE.IOS, label: "官服(iOS)" },
] as const;

export const GAME_PLATFORM_LABEL = {
  [GAME_PLATFORM_CODE.IOS]: "iOS",
  [GAME_PLATFORM_CODE.OFFICIAL]: "安卓",
  [GAME_PLATFORM_CODE.BILIBILI]: "B服",
} as const;

export const MAX_GAME_SLOTS = 3;

export const ACCELERATE_SLOTS = [
  { id: "slot_5", label: "顶层左" },
  { id: "slot_6", label: "顶层中" },
  { id: "slot_7", label: "顶层右" },
  { id: "slot_14", label: "中层左" },
  { id: "slot_15", label: "中层中" },
  { id: "slot_16", label: "中层右" },
  { id: "slot_24", label: "底层左" },
  { id: "slot_25", label: "底层中" },
  { id: "slot_26", label: "底层右" },
] as const satisfies readonly { id: AccelerateSlot; label: string }[];

export const DEFAULT_GAME_CONFIG: ApiGameGameConfig = {
  account: "",
  accelerate_slot: "slot_14",
  battle_tasks: [],
  current_map: "",
  enable_building_arrange: false,
  is_auto_battle: false,
  is_stopped: false,
  keeping_ap: 0,
  recruit_ignore_robot: false,
  recruit_reserve: 0,
  allow_login_assist: false,
};

export enum GameResourceType {
  GOLD = "GOLD",
  DIAMOND_SHD = "DIAMOND_SHD",
  DIAMOND = "DIAMOND",
  AP_GAMEPLAY = "AP_GAMEPLAY",
}

export const ARK_AVATAR_RESOURCE_TYPE = {
  DEFAULT: "DEFAULT",
  ASSISTANT: "ASSISTANT",
} as const;

export const ARK_GAME_AVATAR_TYPE = {
  ICON: "ICON",
} as const;

export const DEFAULT_ARK_AVATAR_ID = "avatar_def_01";

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
