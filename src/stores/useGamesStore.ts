import { computed, ref, watch, onScopeDispose } from "vue";
import { defineStore } from "pinia";
import type {
  ApiGameChars,
  ApiGameGame,
  ApiGameLogEvent,
  ApiGameSSR,
  ApiSystemConfig,
} from "@/shared/types/api";
import apiClient from "@/services/apiClient";
import { arknightsGameCaptcha, resetCaptchaOperations } from "@/services/captcha";
import { createCaptchaCoordinator } from "@/services/captcha/coordinator";
import { setMsg } from "@/utils/toast";
import { API_RESPONSE_CODE } from "@/constants/api";
import { MAX_GAME_SLOTS } from "@/constants/game";
import { Type } from "@/constants/ui";
import { STORAGE_KEYS } from "@/constants/app";
import showDialog from "@/shared/components/dialog/dialog";
import NewSSRNotice from "@/components/dashboard/dialogs/NewSSRNotice.vue";
import { useUserStore } from "@/stores/useUserStore";

const intervalTime = 5000;

const initialConfig = (): ApiSystemConfig => ({
  isUnderMaintenance: false,
  isDebugMode: false,
  announcement: "",
  allowGameLogin: true,
  allowGameCreate: true,
  allowGameUpdate: true,
  allowGameDelete: true,
});

export const useGamesStore = defineStore("games", () => {
  const config = ref<ApiSystemConfig>(initialConfig());
  const gameList = ref<ApiGameGame[]>([]);
  const globalSSR = ref<ApiGameSSR[]>([]);
  const coordinator = createCaptchaCoordinator(arknightsGameCaptcha);
  const captchaStates = coordinator.states;
  let session = 0;
  let requestId = 0;
  let polling = false;
  let observationTimer: ReturnType<typeof setTimeout> | undefined;
  const userStore = useUserStore();
  const charsCache = ref<Record<string, ApiGameChars>>({});
  const isGameListIniting = ref(false);
  const isGameListCompletedInit = ref(false);
  const isLoadingGameList = ref(false);
  const isLoadingChars = ref(false);
  const pollingTimeout = ref<ReturnType<typeof setTimeout> | null>(null);
  const sseConnection = ref<EventSource | null>(null);

  const firstGame = computed(() => {
    if (!gameList.value.length) {
      return null;
    }
    return gameList.value[0];
  });

  const occupiedSlotCount = computed(() => gameList.value.length);
  const canCreateGame = computed(() => occupiedSlotCount.value < MAX_GAME_SLOTS);

  const findGame = (gameAccount: string) => {
    return gameList.value.find((game) => game.status.account === gameAccount);
  };

  const updateGameList = (data: ApiGameGame[]) => {
    if (!data) {
      gameList.value = [];
      return;
    }
    gameList.value = data;
  };

  const updateCaptcha = (data: ApiGameGame[], readBarrier?: number) => {
    coordinator.sync(data.filter((game) => game?.status).map((game) => ({
      account: game.status.account, code: game.status.code,
      info: game.captcha_info ?? { created: 0, captcha_type: "" },
    })), readBarrier);
  };

  const queryGameList = async () => {
    const generation = session;
    const id = ++requestId;
    const barrier = coordinator.readBarrier();
    isLoadingGameList.value = true;
    try {
      const resp = await apiClient.fetchGameList({ timeout: 30_000 });
      if (generation !== session || id !== requestId) return false;
      if (resp?.code === API_RESPONSE_CODE.SUCCESS && Array.isArray(resp.data)) {
        updateGameList(resp.data);
        updateCaptcha(resp.data, barrier);
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      if (generation === session && id === requestId) isLoadingGameList.value = false;
    }
  };

  const retryCaptcha = (account: string) => coordinator.retry(account, queryGameList);
  const cancelCaptcha = coordinator.cancel;
  // 仅在提交后的60秒确认窗口兜底GET；SSE没有请求时间，不能作本次提交的确认依据。
  watch(() => Object.values(captchaStates.value).some((state) => state.phase === "awaiting-status"), (waiting) => {
    clearTimeout(observationTimer);
    if (!waiting) return;
    const generation = session;
    const observe = async () => {
      if (generation !== session) return;
      if (!polling && !isLoadingGameList.value) await queryGameList();
      if (generation === session && Object.values(captchaStates.value).some((state) => state.phase === "awaiting-status")) {
        observationTimer = setTimeout(observe, intervalTime);
      }
    };
    observationTimer = setTimeout(observe, intervalTime);
  }, { flush: "sync" });

  const startGameListPolling = () => {
    if (polling) return;
    polling = true;
    const generation = session;
    const poll = async () => {
      if (!polling || generation !== session) return;
      if (!isLoadingGameList.value) await queryGameList();
      if (polling && generation === session) pollingTimeout.value = setTimeout(poll, intervalTime);
    };
    void poll();
  };

  const stopGameListPolling = () => {
    polling = false;
    if (pollingTimeout.value) {
      clearTimeout(pollingTimeout.value);
      pollingTimeout.value = null;
    }
  };

  let cancelSSEOpening: (() => void) | undefined;
  const closeSSE = () => {
    cancelSSEOpening?.();
    cancelSSEOpening = undefined;
    if (typeof window !== "undefined") window.removeEventListener("beforeunload", closeSSE);
    if (!sseConnection.value) {
      return;
    }
    sseConnection.value.close();
    sseConnection.value = null;
  };

  const startSSE = async () => {
    const user = useUserStore();
    if (!user || !user.token) {
      setMsg("用户未登录", Type.Warning);
      return false;
    }
    if (typeof EventSource === "undefined") {
      setMsg("你的浏览器不支持 SSE 特性，访问托管列表将受到影响", Type.Warning);
      return false;
    }

    const connectionTimeout = 5000;
    const generation = session;
    closeSSE();
    try {
      const event = await new Promise<EventSource>((resolve, reject) => {
        const baseurl = apiClient.getHostServer().baseURL;
        const eventSource = new EventSource(`${baseurl}/sse/games?token=${user.token}`);
        let settled = false;
        const finish = (error?: Error) => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          cancelSSEOpening = undefined;
          if (error) { eventSource.close(); reject(error); }
          else resolve(eventSource);
        };
        const timer = setTimeout(() => finish(new Error("连接超时")), connectionTimeout);
        cancelSSEOpening = () => finish(new Error("连接已取消"));
        eventSource.onopen = () => finish();
        eventSource.onerror = () => finish(new Error("EventSource 连接失败"));
      });
      if (generation !== session) { event.close(); return false; }
      sseConnection.value = event;

      event.addEventListener("game", (sourceEvent) => {
        if (generation !== session || sseConnection.value !== event || !sourceEvent.data || isLoadingGameList.value) return;
        try {
          const data = JSON.parse(sourceEvent.data) as ApiGameGame[];
          if (!Array.isArray(data)) return;
          updateGameList(data);
          updateCaptcha(data);
        } catch { /* 保留上次可读状态，不把畸形事件认作空账号列表。 */ }
      });

      event.addEventListener("log", (sourceEvent) => {
        if (!sourceEvent.data) return;
        const parsedData = JSON.parse(sourceEvent.data) as ApiGameLogEvent;
        setMsg(parsedData.content, Type.Success);
      });

      window.addEventListener("beforeunload", closeSSE, { once: true });

      event.addEventListener("close", () => {
        setMsg("你已在其他窗口或设备访问，本页面暂停更新", Type.Warning);
        closeSSE();
      });

      event.addEventListener("ssr", (sourceEvent) => {
        globalSSR.value = JSON.parse(sourceEvent.data) ?? [];
        const lastReadTs = Number(localStorage.getItem(STORAGE_KEYS.LAST_READ_TS)) || 0;
        globalSSR.value = globalSSR.value.filter((item) => item.createdAt > lastReadTs);
        if (globalSSR.value.length > 0) {
          setMsg("可露希尔又双叒叕抽到 6 星干员啦!!!", Type.Info);
          showDialog(NewSSRNotice, { users: globalSSR.value } as Record<string, unknown>);
        }
      });

      return true;
    } catch (error) {
      if (generation === session) setMsg(error, Type.Warning);
      return false;
    }
  };

  const initializeGameListServerConnection = async () => {
    if (isGameListCompletedInit.value) {
      return;
    }
    const generation = session;
    isGameListIniting.value = true;
    const gameListResult = await queryGameList();
    if (generation !== session) return;
    if (!gameListResult) {
      setMsg("初始化失败, 请刷新网页或稍后再尝试", Type.Warning);
      isGameListIniting.value = false;
      return;
    }
    isGameListIniting.value = false;
    isGameListCompletedInit.value = true;
    const sseResult = await startSSE();
    if (generation !== session) return;
    if (sseResult) {
      setMsg("链接到服务器成功", Type.Success);
      return;
    }
    startGameListPolling();
  };

  const gameSuspend = async (account: string) => {
    return apiClient.doGamePause(account);
  };

  const fetchChars = async (account: string) => {
    // 如果缓存存在，直接返回
    if (charsCache.value[account]) {
      return charsCache.value[account];
    }

    isLoadingChars.value = true;
    try {
      const resp = await apiClient.fetchGameChars(account);
      if (resp.code === API_RESPONSE_CODE.SUCCESS && resp.data) {
        // 存入缓存
        charsCache.value[account] = resp.data;
        return resp.data;
      }
      return null;
    } catch (error) {
      console.error('Failed to fetch chars:', error);
      // 关键：API 失败不清空缓存，返回现有数据
      return charsCache.value[account] || null;
    } finally {
      isLoadingChars.value = false;
    }
  };

  const $reset = () => {
    session++; requestId++;
    coordinator.reset(); resetCaptchaOperations();
    clearTimeout(observationTimer);
    config.value = initialConfig();
    gameList.value = [];
    globalSSR.value = [];
    charsCache.value = {};
    isGameListIniting.value = false;
    isGameListCompletedInit.value = false;
    isLoadingGameList.value = false;
    isLoadingChars.value = false;
    closeSSE();
    stopGameListPolling();
  };

  watch(() => userStore.token, () => $reset(), { flush: "sync" });
  onScopeDispose($reset);

  return {
    config,
    gameList,
    globalSSR,
    captchaStates,
    retryCaptcha,
    cancelCaptcha,
    charsCache,
    isGameListIniting,
    isLoadingGameList,
    isLoadingChars,
    firstGame,
    occupiedSlotCount,
    canCreateGame,
    findGame,
    updateGameList,
    updateCaptcha,
    queryGameList,
    startGameListPolling,
    stopGameListPolling,
    startSSE,
    initializeGameListServerConnection,
    gameSuspend,
    fetchChars,
    $reset,
  };
});
