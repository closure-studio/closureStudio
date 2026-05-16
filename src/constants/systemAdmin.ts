import type { ApiSystemConfigEditable } from "@/shared/types/api";

export const EDITABLE_SYSTEM_CONFIG_KEYS = [
  "announcement",
  "allowGameLogin",
  "allowGameCreate",
  "allowGameUpdate",
  "allowGameDelete",
] as const satisfies readonly (keyof ApiSystemConfigEditable)[];

export const DEFAULT_QQ_GROUPS = ["1345795", "450555868"] as const;

export const SYSTEM_CONFIG_MESSAGES = {
  LOAD_FAILED: "加载系统配置失败",
  UPDATE_FAILED: "更新系统配置失败",
  NO_PERMISSION: "无权更新系统配置",
  NO_CHANGES: "配置未变更",
  PUBLISH_SUCCESS: "系统配置已发布",
  QQBOT_NOTIFY_SUCCESS: "系统配置已发布，QQ群通知已发送",
  QQBOT_NOTIFY_PARTIAL_FAILED: "系统配置已发布，QQ群通知未全部成功",
  QQBOT_NOTIFY_FAILED: "系统配置已发布，QQ群通知发送失败",
  INVALID_QQ_GROUP: "请输入正确的 QQ 群号",
  QQ_GROUP_EXISTS: "QQ群已存在",
  QQ_GROUP_ADDED: "QQ群已添加",
} as const;

export const USER_MANAGEMENT_MESSAGES = {
  SEARCH_EMPTY: "请输入用户搜索关键字",
  SEARCH_FAILED: "搜索用户失败",
  USER_NOT_FOUND: "未找到匹配用户",
  UPDATE_FAILED: "更新用户权限失败",
  UPDATE_SUCCESS: "用户权限已更新",
  NO_PERMISSION: "无权更新用户权限",
  NO_CHANGES: "用户权限未变更",
  USER_ID_EMPTY: "用户ID不能为空",
} as const;
