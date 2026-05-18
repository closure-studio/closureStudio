import type { ApiSystemConfigEditable } from "@/shared/types/api";

export const EDITABLE_SYSTEM_CONFIG_KEYS = [
  "announcement",
  "allowGameLogin",
  "allowGameCreate",
  "allowGameUpdate",
  "allowGameDelete",
  "shutdownTasks",
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

export const SYSTEM_CONFIG_TEXT = {
  ANNOUNCEMENT_HELP: "编辑网站首页公告，可选择是否同步通知 QQ 群",
  ANNOUNCEMENT_NOTIFY_LABEL: "同步发送 QQ 群通知并 @全体成员",
  ANNOUNCEMENT_NOTIFY_HELP: "将发送到默认 QQ 群和下方追加的 QQ 群",
  SHUTDOWN_TASKS_TITLE: "定时任务",
  SHUTDOWN_TASKS_ADD: "添加定时任务",
  SHUTDOWN_TASKS_DELETE: "删除",
  SHUTDOWN_TASKS_NEXT_LABEL: "最近执行",
  SHUTDOWN_TASKS_COUNT_PREFIX: "共 ",
  SHUTDOWN_TASKS_COUNT_SUFFIX: " 个任务，展开后可编辑详情",
  SHUTDOWN_TASKS_ITEM_PREFIX: "任务 #",
  SHUTDOWN_TASKS_DATE_LABEL: "日期",
  SHUTDOWN_TASKS_CLOCK_LABEL: "北京时间",
  SHUTDOWN_TASKS_QUICK_ONE_HOUR: "1小时后",
  SHUTDOWN_TASKS_QUICK_TONIGHT: "今晚 23:00",
  SHUTDOWN_TASKS_QUICK_TOMORROW_DAWN: "明天 05:00",
  SHUTDOWN_TASKS_COLLAPSE_SUFFIX: "展开",
  SHUTDOWN_TASKS_EXPAND_SUFFIX: "收起",
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
