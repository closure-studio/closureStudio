// ============================================================
// ReplayHub 类型定义 — 对应后端 replayHub-frontend-integration.md
// ============================================================

/** 用户头像快照 */
export interface ReplayAvatar {
  type: string;
  id: string;
}

/**
 * 审核状态
 * 0 = pending  待审核
 * 1 = approved 已发布
 * 2 = hidden   已隐藏
 */
export type RecordStatus = 0 | 1 | 2;

// ---- 请求模型 ----

export interface PublishRecordRequest {
  gameAccount: string;
  nickName: string;
  avatar: ReplayAvatar;
  stageId: string;
  sortOrder: number;
  title: string;
  description: string;
}

export interface CreateSetRequest {
  gameAccount: string;
  nickName: string;
  avatar: ReplayAvatar;
  title: string;
  description: string;
}

export interface UpdateSetRequest {
  title?: string;
  description?: string;
}

export interface UpdateRecordRequest {
  displayInfo?: string;
  sortOrder?: number;
}

export interface ReorderRecordsRequest {
  order: string[];
}

export interface AdoptRequest {
  gameAccount: string;
}

export interface RateRequest {
  rating: 1 | -1;
  comment?: string;
}

// ---- 响应 DTO ----

/** 注意：cipherText 永远不会出现在响应中 */
export interface RecordDTO {
  id: string;
  setId: string | null;
  userId: string;
  gameAccount: string;
  nickName: string;
  avatar: ReplayAvatar;
  stageId: string;
  sortOrder: number;
  displayInfo: string;
  totalBattleCount: number;
  successBattleCount: number;
  status: RecordStatus;
  createdAt: number;
  updatedAt: number;
  // 详情接口专有
  netScore?: number;
  usageCount?: number;
  myRating?: 1 | -1;
}

export interface SetDTO {
  id: string;
  userId: string;
  gameAccount: string;
  nickName: string;
  avatar: ReplayAvatar;
  title: string;
  description: string;
  status: RecordStatus;
  createdAt: number;
  updatedAt: number;
  // 详情接口专有
  records?: PaginatedRecords;
}

export interface RatingDTO {
  id: string;
  recordId: string;
  userId: string;
  rating: 1 | -1;
  comment: string;
  createdAt: number;
  updatedAt: number;
}

export interface UsageDTO {
  id: string;
  recordId: string;
  userId: string;
  gameAccount: string;
  usedAt: number;
}

// ---- 分页包装 ----

export interface PaginatedRecords {
  total: number;
  items: RecordDTO[];
}

export interface PaginatedSets {
  total: number;
  items: SetDTO[];
}

export interface PaginatedRatings {
  total: number;
  items: RatingDTO[];
}

export interface PaginatedUsages {
  total: number;
  items: UsageDTO[];
}

// ---- 分页查询参数 ----

export interface PaginationParams {
  offset?: number;
  limit?: number;
}

export interface ListRecordsParams extends PaginationParams {
  stageId?: string;
}

export interface AdminListRecordsParams extends PaginationParams {
  status?: RecordStatus;
}
