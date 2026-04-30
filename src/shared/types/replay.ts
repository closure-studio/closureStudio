// ============================================================
// Battle Replay 类型定义 — 对应 replayHub-frontend-integration.md
// ============================================================

export interface ReplayAvatar {
  type: string;
  id: string;
}

export type ReplayValidationStatus = "PENDING" | "PASSED" | "FAILED";

export type ReplayAuditStatus = "PENDING" | "APPROVED" | "REJECTED";

export type ReplayActionType = "SHARE" | "AUTO_BATTLE";

export type ReplayAutoResultStatus = "SUCCESS" | "FAILED" | "TIMEOUT" | "OTHER";

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
