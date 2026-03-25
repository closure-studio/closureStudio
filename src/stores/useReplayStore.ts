import { ref } from "vue";
import { defineStore } from "pinia";
import { replayApi } from "@/shared/services/replayClient";
import { mockRecords } from "@/features/replay/mock/records";
import type {
  RecordDTO,
  SetDTO,
  ListRecordsParams,
  RateRequest,
  AdoptRequest,
} from "@/shared/types/replay";
import { setMsg } from "@/shared/utils/toast";
import { Type } from "@/shared/components/toast/enum";

// TODO: 后端部署后删除此开关
const USE_MOCK = true;

const PAGE_LIMIT = 20;

export const useReplayStore = defineStore("replay", () => {
  // ---- 公开录像列表 ----
  const records = ref<RecordDTO[]>([]);
  const recordsTotal = ref(0);
  const recordsOffset = ref(0);
  const isLoadingRecords = ref(false);

  // ---- 公开集合列表 ----
  const sets = ref<SetDTO[]>([]);
  const setsTotal = ref(0);
  const setsOffset = ref(0);
  const isLoadingSets = ref(false);

  // ---- 我的录像 ----
  const myRecords = ref<RecordDTO[]>([]);
  const myRecordsTotal = ref(0);
  const myRecordsOffset = ref(0);
  const isLoadingMyRecords = ref(false);

  // ---- 我的集合 ----
  const mySets = ref<SetDTO[]>([]);
  const mySetsTotal = ref(0);
  const mySetsOffset = ref(0);
  const isLoadingMySets = ref(false);

  // ---- 当前详情 ----
  const currentRecord = ref<RecordDTO | null>(null);
  const currentSet = ref<SetDTO | null>(null);

  // ================================================================
  // 公开录像
  // ================================================================

  const fetchRecords = async (params: ListRecordsParams = {}) => {
    isLoadingRecords.value = true;
    try {
      if (USE_MOCK) {
        const { offset = 0, limit = PAGE_LIMIT, stageId } = params;
        const filtered = stageId
          ? mockRecords.filter((r) => r.stageId.includes(stageId))
          : mockRecords;
        records.value = filtered.slice(offset, offset + limit);
        recordsTotal.value = filtered.length;
        recordsOffset.value = offset;
        return;
      }
      const resp = await replayApi.listRecords({ limit: PAGE_LIMIT, ...params });
      if (resp.code === 1 && resp.data) {
        records.value = resp.data.items;
        recordsTotal.value = resp.data.total;
        recordsOffset.value = params.offset ?? 0;
      }
    } catch (e) {
      console.error("fetchRecords:", e);
    } finally {
      isLoadingRecords.value = false;
    }
  };

  const fetchRecordDetail = async (id: string) => {
    try {
      const resp = await replayApi.getRecord(id);
      if (resp.code === 1 && resp.data) {
        currentRecord.value = resp.data;
      }
    } catch (e) {
      console.error("fetchRecordDetail:", e);
    }
  };

  // ================================================================
  // 公开集合
  // ================================================================

  const fetchSets = async (offset = 0) => {
    isLoadingSets.value = true;
    try {
      const resp = await replayApi.listSets({ offset, limit: PAGE_LIMIT });
      if (resp.code === 1 && resp.data) {
        sets.value = resp.data.items;
        setsTotal.value = resp.data.total;
        setsOffset.value = offset;
      }
    } catch (e) {
      console.error("fetchSets:", e);
    } finally {
      isLoadingSets.value = false;
    }
  };

  const fetchSetDetail = async (id: string) => {
    try {
      const resp = await replayApi.getSet(id);
      if (resp.code === 1 && resp.data) {
        currentSet.value = resp.data;
      }
    } catch (e) {
      console.error("fetchSetDetail:", e);
    }
  };

  // ================================================================
  // 我的录像 & 集合
  // ================================================================

  const fetchMyRecords = async (offset = 0) => {
    isLoadingMyRecords.value = true;
    try {
      if (USE_MOCK) {
        const slice = mockRecords.slice(offset, offset + PAGE_LIMIT);
        myRecords.value = slice.map((r) => ({ ...r, status: [0, 1, 2][r.id.charCodeAt(r.id.length - 1) % 3] as 0 | 1 | 2 }));
        myRecordsTotal.value = mockRecords.length;
        myRecordsOffset.value = offset;
        return;
      }
      const resp = await replayApi.myRecords({ offset, limit: PAGE_LIMIT });
      if (resp.code === 1 && resp.data) {
        myRecords.value = resp.data.items;
        myRecordsTotal.value = resp.data.total;
        myRecordsOffset.value = offset;
      }
    } catch (e) {
      console.error("fetchMyRecords:", e);
    } finally {
      isLoadingMyRecords.value = false;
    }
  };

  const fetchMySets = async (offset = 0) => {
    isLoadingMySets.value = true;
    try {
      const resp = await replayApi.mySets({ offset, limit: PAGE_LIMIT });
      if (resp.code === 1 && resp.data) {
        mySets.value = resp.data.items;
        mySetsTotal.value = resp.data.total;
        mySetsOffset.value = offset;
      }
    } catch (e) {
      console.error("fetchMySets:", e);
    } finally {
      isLoadingMySets.value = false;
    }
  };

  // ================================================================
  // 互动操作
  // ================================================================

  const rateRecord = async (id: string, data: RateRequest) => {
    const resp = await replayApi.rateRecord(id, data);
    if (resp.code === 1) {
      setMsg("评分成功", Type.Success);
      const item = records.value.find((r) => r.id === id);
      if (item) item.myRating = data.rating;
      if (currentRecord.value?.id === id) currentRecord.value.myRating = data.rating;
    } else {
      setMsg(resp.message || "评分失败", Type.Warning);
    }
    return resp;
  };

  const deleteMyRating = async (id: string) => {
    const resp = await replayApi.deleteMyRating(id);
    if (resp.code === 1) {
      const item = records.value.find((r) => r.id === id);
      if (item) item.myRating = undefined;
      if (currentRecord.value?.id === id) currentRecord.value.myRating = undefined;
    }
    return resp;
  };

  const adoptRecord = async (id: string, data: AdoptRequest) => {
    const resp = await replayApi.adoptRecord(id, data);
    if (resp.code === 1) {
      setMsg("采用成功，已记录到使用历史", Type.Success);
    } else {
      setMsg(resp.message || "采用失败", Type.Warning);
    }
    return resp;
  };

  const deleteRecord = async (id: string) => {
    const resp = await replayApi.deleteRecord(id);
    if (resp.code === 1) {
      myRecords.value = myRecords.value.filter((r) => r.id !== id);
      setMsg("删除成功", Type.Success);
    } else {
      setMsg(resp.message || "删除失败", Type.Warning);
    }
    return resp;
  };

  const deleteSet = async (id: string) => {
    const resp = await replayApi.deleteSet(id);
    if (resp.code === 1) {
      mySets.value = mySets.value.filter((s) => s.id !== id);
      setMsg("删除成功", Type.Success);
    } else {
      setMsg(resp.message || "删除失败", Type.Warning);
    }
    return resp;
  };

  // ================================================================
  // 计算属性 / 工具
  // ================================================================

  const recordsHasMore = () => recordsOffset.value + PAGE_LIMIT < recordsTotal.value;
  const setsHasMore = () => setsOffset.value + PAGE_LIMIT < setsTotal.value;

  const $reset = () => {
    records.value = [];
    recordsTotal.value = 0;
    recordsOffset.value = 0;
    sets.value = [];
    setsTotal.value = 0;
    setsOffset.value = 0;
    myRecords.value = [];
    myRecordsTotal.value = 0;
    myRecordsOffset.value = 0;
    mySets.value = [];
    mySetsTotal.value = 0;
    mySetsOffset.value = 0;
    currentRecord.value = null;
    currentSet.value = null;
  };

  return {
    // state
    records,
    recordsTotal,
    isLoadingRecords,
    sets,
    setsTotal,
    isLoadingSets,
    myRecords,
    myRecordsTotal,
    isLoadingMyRecords,
    mySets,
    mySetsTotal,
    isLoadingMySets,
    currentRecord,
    currentSet,
    // actions
    fetchRecords,
    fetchRecordDetail,
    fetchSets,
    fetchSetDetail,
    fetchMyRecords,
    fetchMySets,
    rateRecord,
    deleteMyRating,
    adoptRecord,
    deleteRecord,
    deleteSet,
    recordsHasMore,
    setsHasMore,
    $reset,
  };
});
