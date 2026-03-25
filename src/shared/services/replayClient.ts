import apiClient from "./apiClient";
import type {
  PaginatedRecords,
  PaginatedSets,
  PaginatedRatings,
  PaginatedUsages,
  RecordDTO,
  SetDTO,
  RatingDTO,
  PublishRecordRequest,
  CreateSetRequest,
  UpdateSetRequest,
  UpdateRecordRequest,
  ReorderRecordsRequest,
  AdoptRequest,
  RateRequest,
  ListRecordsParams,
  AdminListRecordsParams,
  RecordStatus,
} from "@/shared/types/replay";

// 复用 apiClient（同一 host），所有路径以 /replayHub 开头

function qs(params: Record<string, unknown>): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null);
  if (!entries.length) return "";
  return "?" + entries.map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join("&");
}

// ---- 公开接口（无需认证）----

export const replayApi = {
  /** UC-01 获取已发布录像列表 */
  listRecords(params: ListRecordsParams = {}) {
    const { offset = 0, limit = 20, stageId } = params;
    return apiClient.get<PaginatedRecords>(`/replayHub/records${qs({ offset, limit, stageId })}`);
  },

  /** UC-02 获取已发布集合列表 */
  listSets(params: { offset?: number; limit?: number } = {}) {
    const { offset = 0, limit = 20 } = params;
    return apiClient.get<PaginatedSets>(`/replayHub/sets${qs({ offset, limit })}`);
  },

  /** UC-03 获取录像详情（含 netScore/usageCount，登录后含 myRating）*/
  getRecord(id: string) {
    return apiClient.get<RecordDTO>(`/replayHub/records/${id}`);
  },

  /** UC-04 获取集合详情（含分页 records）*/
  getSet(id: string, params: { offset?: number; limit?: number } = {}) {
    const { offset = 0, limit = 20 } = params;
    return apiClient.get<SetDTO>(`/replayHub/sets/${id}${qs({ offset, limit })}`);
  },

  /** UC-05 获取录像评分列表 */
  listRatings(recordId: string, params: { offset?: number; limit?: number } = {}) {
    const { offset = 0, limit = 20 } = params;
    return apiClient.get<PaginatedRatings>(`/replayHub/records/${recordId}/ratings${qs({ offset, limit })}`);
  },

  // ---- 认证接口 ----

  /** UC-06 发布独立录像 */
  publishRecord(data: PublishRecordRequest) {
    return apiClient.post<{ id: string }>("/replayHub/records", data);
  },

  /** UC-07 创建集合 */
  createSet(data: CreateSetRequest) {
    return apiClient.post<{ id: string }>("/replayHub/sets", data);
  },

  /** UC-08 向集合添加录像 */
  addRecordToSet(setId: string, data: PublishRecordRequest) {
    return apiClient.post<{ id: string }>(`/replayHub/sets/${setId}/records`, data);
  },

  /** UC-09 更新集合元数据 */
  updateSet(id: string, data: UpdateSetRequest) {
    return apiClient.patch<null>(`/replayHub/sets/${id}`, data);
  },

  /** UC-10 更新录像元数据 */
  updateRecord(id: string, data: UpdateRecordRequest) {
    return apiClient.patch<null>(`/replayHub/records/${id}`, data);
  },

  /** UC-11 重新排序集合内录像 */
  reorderRecords(setId: string, data: ReorderRecordsRequest) {
    return apiClient.patch<null>(`/replayHub/sets/${setId}/records`, data);
  },

  /** UC-12 将录像从集合中分离 */
  detachRecord(setId: string, recordId: string) {
    return apiClient.del<null>(`/replayHub/sets/${setId}/records/${recordId}`, null);
  },

  /** UC-13 删除录像 */
  deleteRecord(id: string) {
    return apiClient.del<null>(`/replayHub/records/${id}`, null);
  },

  /** UC-14 删除集合（级联删除子录像）*/
  deleteSet(id: string) {
    return apiClient.del<null>(`/replayHub/sets/${id}`, null);
  },

  /** UC-15 我的录像（全状态）*/
  myRecords(params: { offset?: number; limit?: number } = {}) {
    const { offset = 0, limit = 20 } = params;
    return apiClient.get<PaginatedRecords>(`/replayHub/me/records${qs({ offset, limit })}`);
  },

  /** UC-16 我的集合 */
  mySets(params: { offset?: number; limit?: number } = {}) {
    const { offset = 0, limit = 20 } = params;
    return apiClient.get<PaginatedSets>(`/replayHub/me/sets${qs({ offset, limit })}`);
  },

  /** UC-17 我的使用历史 */
  myUsages(params: { offset?: number; limit?: number } = {}) {
    const { offset = 0, limit = 20 } = params;
    return apiClient.get<PaginatedUsages>(`/replayHub/me/usages${qs({ offset, limit })}`);
  },

  /** UC-18 采用录像 */
  adoptRecord(id: string, data: AdoptRequest) {
    return apiClient.post<{ usageId: string }>(`/replayHub/records/${id}/adopt`, data);
  },

  /** UC-19 评分（upsert）*/
  rateRecord(id: string, data: RateRequest) {
    return apiClient.post<null>(`/replayHub/records/${id}/ratings/me`, data);
  },

  /** UC-20 删除我的评分 */
  deleteMyRating(id: string) {
    return apiClient.del<null>(`/replayHub/records/${id}/ratings/me`, null);
  },

  /** UC-21 获取我对某录像的评分 */
  getMyRating(id: string) {
    return apiClient.get<RatingDTO | null>(`/replayHub/records/${id}/ratings/me`);
  },

  // ---- 管理接口 ----

  /** UC-22 管理员按状态列录像 */
  adminListRecords(params: AdminListRecordsParams = {}) {
    const { offset = 0, limit = 20, status = 0 } = params;
    return apiClient.get<PaginatedRecords>(`/replayHub/admin/records${qs({ offset, limit, status })}`);
  },

  /** UC-23 管理员更新录像状态 */
  adminUpdateRecordStatus(id: string, status: RecordStatus) {
    return apiClient.patch<null>(`/replayHub/admin/records/${id}/status`, { status });
  },

  /** UC-24 管理员更新集合状态 */
  adminUpdateSetStatus(id: string, status: RecordStatus) {
    return apiClient.patch<null>(`/replayHub/admin/sets/${id}/status`, { status });
  },
};

export default replayApi;
