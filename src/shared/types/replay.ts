// ============================================================
// Battle Replay 类型定义 — 对应 replayHub-frontend-integration.md
// ============================================================

export interface ReplayAvatar {
  type: string;
  id: string;
}

export const REPLAY_VALIDATION_STATUS = {
  PENDING: "PENDING",
  PASSED: "PASSED",
  FAILED: "FAILED",
} as const;

export type ReplayValidationStatus =
  (typeof REPLAY_VALIDATION_STATUS)[keyof typeof REPLAY_VALIDATION_STATUS];

export const REPLAY_AUDIT_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;

export type ReplayAuditStatus = (typeof REPLAY_AUDIT_STATUS)[keyof typeof REPLAY_AUDIT_STATUS];

export const REPLAY_ACTION_TYPE = {
  SHARE: "SHARE",
  AUTO_BATTLE: "AUTO_BATTLE",
} as const;

export type ReplayActionType = (typeof REPLAY_ACTION_TYPE)[keyof typeof REPLAY_ACTION_TYPE];

export const REPLAY_AUTO_RESULT_STATUS = {
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
  TIMEOUT: "TIMEOUT",
  OTHER: "OTHER",
} as const;

export type ReplayAutoResultStatus =
  (typeof REPLAY_AUTO_RESULT_STATUS)[keyof typeof REPLAY_AUTO_RESULT_STATUS];

export interface ReplayRecord {
  uuid: string;
  stage_id: string;
  title: string;
  description: string;
  avatar: ReplayAvatar;
  validation_status: ReplayValidationStatus;
  validation_message: string;
  audit_status: ReplayAuditStatus;
  audit_message: string;
  is_hidden: boolean;
  created_at: number;
  updated_at: number;
  validated_at: number | null;
  audited_at: number | null;
}

export interface ReplayAutoResult {
  id: number;
  user_uuid: string;
  account: string;
  replay_record_id: number;
  replay_uuid: string;
  stage_id: string;
  result: ReplayAutoResultStatus;
  message: string;
  created_at: number;
}

export interface ReplayListQuery {
  page?: number;
  limit?: number;
  stage_id?: string;
  mine?: boolean | 1;
  account?: string;
}

export interface ReplayAutoResultsQuery {
  page?: number;
  limit?: number;
}

export interface UpdateReplayPayload {
  title?: string;
  description?: string;
  is_hidden?: boolean;
}

export interface ReviewReplayPayload {
  audit_status: Exclude<ReplayAuditStatus, "PENDING">;
  audit_message?: string;
}

export interface BattleReplayAction {
  stage_id: string;
  uuid: string;
  action_type: ReplayActionType;
}
