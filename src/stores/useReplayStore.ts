import { ref } from "vue";
import { defineStore } from "pinia";
import { REPLAY_PAGE_LIMIT } from "@/constants/game";
import { API_RESPONSE_CODE } from "@/constants/api";
import { replayApi } from "@/services/replayClient";
import {
  REPLAY_ACTION_TYPE,
  REPLAY_VALIDATION_STATUS,
  type ReplayAutoResult,
  type ReplayRecord,
  type UpdateReplayPayload,
} from "@/shared/types/replay";
import { setMsg } from "@/utils/toast";
import { Type } from "@/constants/ui";

function mergeReplayPage(current: ReplayRecord[], incoming: ReplayRecord[]) {
  const map = new Map(current.map((item) => [item.uuid, item]));
  incoming.forEach((item) => map.set(item.uuid, item));
  return Array.from(map.values());
}

function mergeAutoResultPage(current: ReplayAutoResult[], incoming: ReplayAutoResult[]) {
  const map = new Map(current.map((item) => [item.id, item]));
  incoming.forEach((item) => map.set(item.id, item));
  return Array.from(map.values());
}

export const useReplayStore = defineStore("replay", () => {
  const selectedAccount = ref("");

  const publicReplays = ref<ReplayRecord[]>([]);
  const publicPage = ref(1);
  const publicStageId = ref("");
  const publicHasMore = ref(true);
  const isLoadingPublicReplays = ref(false);

  const myReplays = ref<ReplayRecord[]>([]);
  const myPage = ref(1);
  const myAccount = ref("");
  const myHasMore = ref(false);
  const isLoadingMyReplays = ref(false);

  const autoResults = ref<ReplayAutoResult[]>([]);
  const autoResultsPage = ref(1);
  const autoResultsAccount = ref("");
  const autoResultsHasMore = ref(false);
  const isLoadingAutoResults = ref(false);

  const syncSelectedAccount = (accounts: string[]) => {
    if (!accounts.length) {
      selectedAccount.value = "";
      return;
    }
    if (!accounts.includes(selectedAccount.value)) {
      selectedAccount.value = accounts[0];
    }
  };

  const setSelectedAccount = (account: string) => {
    selectedAccount.value = account;
  };

  const fetchPublicReplays = async (stageId = publicStageId.value, limit = REPLAY_PAGE_LIMIT) => {
    publicStageId.value = stageId;
    isLoadingPublicReplays.value = true;
    try {
      const resp = await replayApi.listReplays({
        page: 1,
        limit,
        stage_id: stageId || undefined,
      });
      if (resp.code === API_RESPONSE_CODE.SUCCESS && resp.data) {
        publicReplays.value = resp.data;
        publicPage.value = 1;
        publicHasMore.value = resp.data.length >= limit;
        return resp;
      }
      publicReplays.value = [];
      publicPage.value = 1;
      publicHasMore.value = false;
      setMsg(resp.message || "加载录像失败", Type.Warning);
      return resp;
    } catch (error) {
      publicReplays.value = [];
      publicHasMore.value = false;
      setMsg("加载录像失败", Type.Warning);
      console.error("fetchPublicReplays:", error);
      throw error;
    } finally {
      isLoadingPublicReplays.value = false;
    }
  };

  const fetchMorePublicReplays = async (limit = REPLAY_PAGE_LIMIT) => {
    if (!publicHasMore.value || isLoadingPublicReplays.value) return null;

    const nextPage = publicPage.value + 1;
    isLoadingPublicReplays.value = true;
    try {
      const resp = await replayApi.listReplays({
        page: nextPage,
        limit,
        stage_id: publicStageId.value || undefined,
      });
      if (resp.code === API_RESPONSE_CODE.SUCCESS && resp.data) {
        publicReplays.value = mergeReplayPage(publicReplays.value, resp.data);
        publicPage.value = nextPage;
        publicHasMore.value = resp.data.length >= limit;
        return resp;
      }
      publicHasMore.value = false;
      setMsg(resp.message || "加载更多录像失败", Type.Warning);
      return resp;
    } catch (error) {
      setMsg("加载更多录像失败", Type.Warning);
      console.error("fetchMorePublicReplays:", error);
      throw error;
    } finally {
      isLoadingPublicReplays.value = false;
    }
  };

  const fetchMyReplays = async (account = selectedAccount.value, limit = REPLAY_PAGE_LIMIT) => {
    myAccount.value = account;
    if (!account) {
      myReplays.value = [];
      myPage.value = 1;
      myHasMore.value = false;
      return null;
    }

    selectedAccount.value = account;
    isLoadingMyReplays.value = true;
    try {
      const resp = await replayApi.listReplays({
        page: 1,
        limit,
        mine: true,
        account,
      });
      if (resp.code === API_RESPONSE_CODE.SUCCESS && resp.data) {
        myReplays.value = resp.data;
        myPage.value = 1;
        myHasMore.value = resp.data.length >= limit;
        return resp;
      }
      myReplays.value = [];
      myPage.value = 1;
      myHasMore.value = false;
      setMsg(resp.message || "加载我的录像失败", Type.Warning);
      return resp;
    } catch (error) {
      myReplays.value = [];
      myHasMore.value = false;
      setMsg("加载我的录像失败", Type.Warning);
      console.error("fetchMyReplays:", error);
      throw error;
    } finally {
      isLoadingMyReplays.value = false;
    }
  };

  const fetchMoreMyReplays = async (limit = REPLAY_PAGE_LIMIT) => {
    if (!myAccount.value || !myHasMore.value || isLoadingMyReplays.value) return null;

    const nextPage = myPage.value + 1;
    isLoadingMyReplays.value = true;
    try {
      const resp = await replayApi.listReplays({
        page: nextPage,
        limit,
        mine: true,
        account: myAccount.value,
      });
      if (resp.code === API_RESPONSE_CODE.SUCCESS && resp.data) {
        myReplays.value = mergeReplayPage(myReplays.value, resp.data);
        myPage.value = nextPage;
        myHasMore.value = resp.data.length >= limit;
        return resp;
      }
      myHasMore.value = false;
      setMsg(resp.message || "加载更多我的录像失败", Type.Warning);
      return resp;
    } catch (error) {
      setMsg("加载更多我的录像失败", Type.Warning);
      console.error("fetchMoreMyReplays:", error);
      throw error;
    } finally {
      isLoadingMyReplays.value = false;
    }
  };

  const fetchAutoResults = async (account = selectedAccount.value, limit = REPLAY_PAGE_LIMIT) => {
    autoResultsAccount.value = account;
    if (!account) {
      autoResults.value = [];
      autoResultsPage.value = 1;
      autoResultsHasMore.value = false;
      return null;
    }

    selectedAccount.value = account;
    isLoadingAutoResults.value = true;
    try {
      const resp = await replayApi.listAutoResults(account, {
        page: 1,
        limit,
      });
      if (resp.code === API_RESPONSE_CODE.SUCCESS && resp.data) {
        autoResults.value = resp.data;
        autoResultsPage.value = 1;
        autoResultsHasMore.value = resp.data.length >= limit;
        return resp;
      }
      autoResults.value = [];
      autoResultsPage.value = 1;
      autoResultsHasMore.value = false;
      setMsg(resp.message || "加载自动作战结果失败", Type.Warning);
      return resp;
    } catch (error) {
      autoResults.value = [];
      autoResultsHasMore.value = false;
      setMsg("加载自动作战结果失败", Type.Warning);
      console.error("fetchAutoResults:", error);
      throw error;
    } finally {
      isLoadingAutoResults.value = false;
    }
  };

  const fetchMoreAutoResults = async (limit = REPLAY_PAGE_LIMIT) => {
    if (!autoResultsAccount.value || !autoResultsHasMore.value || isLoadingAutoResults.value) {
      return null;
    }

    const nextPage = autoResultsPage.value + 1;
    isLoadingAutoResults.value = true;
    try {
      const resp = await replayApi.listAutoResults(autoResultsAccount.value, {
        page: nextPage,
        limit,
      });
      if (resp.code === API_RESPONSE_CODE.SUCCESS && resp.data) {
        autoResults.value = mergeAutoResultPage(autoResults.value, resp.data);
        autoResultsPage.value = nextPage;
        autoResultsHasMore.value = resp.data.length >= limit;
        return resp;
      }
      autoResultsHasMore.value = false;
      setMsg(resp.message || "加载更多自动作战结果失败", Type.Warning);
      return resp;
    } catch (error) {
      setMsg("加载更多自动作战结果失败", Type.Warning);
      console.error("fetchMoreAutoResults:", error);
      throw error;
    } finally {
      isLoadingAutoResults.value = false;
    }
  };

  const updateReplay = async (uuid: string, payload: UpdateReplayPayload) => {
    const resp = await replayApi.updateReplay(uuid, payload);
    if (resp.code !== API_RESPONSE_CODE.SUCCESS || !resp.data) {
      setMsg(resp.message || "更新录像失败", Type.Warning);
      return resp;
    }

    const updatedReplay = resp.data;
    myReplays.value = myReplays.value.map((item) => (item.uuid === uuid ? updatedReplay : item));
    publicReplays.value = publicReplays.value.flatMap((item) => {
      if (item.uuid !== uuid) return [item];
      if (
        updatedReplay.validation_status !== REPLAY_VALIDATION_STATUS.PASSED ||
        updatedReplay.is_hidden
      )
        return [];
      return [updatedReplay];
    });
    setMsg("录像信息已更新", Type.Success);
    return resp;
  };

  const enqueueShareAction = async (account: string, stageId: string) => {
    const resp = await replayApi.appendReplayActions(account, [
      {
        stage_id: stageId,
        uuid: "",
        action_type: REPLAY_ACTION_TYPE.SHARE,
      },
    ]);
    if (resp.code === API_RESPONSE_CODE.SUCCESS) {
      setMsg("分享动作已追加，后端不会自动去重", Type.Success);
    } else {
      setMsg(resp.message || "追加分享动作失败", Type.Warning);
    }
    return resp;
  };

  const enqueueAutoBattleAction = async (account: string, replay: ReplayRecord) => {
    const resp = await replayApi.appendReplayActions(account, [
      {
        stage_id: replay.stage_id,
        uuid: replay.uuid,
        action_type: REPLAY_ACTION_TYPE.AUTO_BATTLE,
      },
    ]);
    if (resp.code === API_RESPONSE_CODE.SUCCESS) {
      setMsg("自动作战动作已追加", Type.Success);
      await fetchAutoResults(account);
    } else {
      setMsg(resp.message || "追加自动作战动作失败", Type.Warning);
    }
    return resp;
  };

  const $reset = () => {
    selectedAccount.value = "";
    publicReplays.value = [];
    publicPage.value = 1;
    publicStageId.value = "";
    publicHasMore.value = true;
    isLoadingPublicReplays.value = false;
    myReplays.value = [];
    myPage.value = 1;
    myAccount.value = "";
    myHasMore.value = false;
    isLoadingMyReplays.value = false;
    autoResults.value = [];
    autoResultsPage.value = 1;
    autoResultsAccount.value = "";
    autoResultsHasMore.value = false;
    isLoadingAutoResults.value = false;
  };

  return {
    selectedAccount,
    publicReplays,
    publicPage,
    publicStageId,
    publicHasMore,
    isLoadingPublicReplays,
    myReplays,
    myPage,
    myAccount,
    myHasMore,
    isLoadingMyReplays,
    autoResults,
    autoResultsPage,
    autoResultsAccount,
    autoResultsHasMore,
    isLoadingAutoResults,
    syncSelectedAccount,
    setSelectedAccount,
    fetchPublicReplays,
    fetchMorePublicReplays,
    fetchMyReplays,
    fetchMoreMyReplays,
    fetchAutoResults,
    fetchMoreAutoResults,
    updateReplay,
    enqueueShareAction,
    enqueueAutoBattleAction,
    $reset,
  };
});
