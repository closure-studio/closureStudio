import { computed, ref } from "vue";
import { defineStore } from "pinia";
import type {
  ApiGameCaptchaInfo,
  ApiGameChars,
  ApiGameConfig,
  ApiGameGame,
  ApiGameLogEvent,
  ApiGameSSR,
  ApiSystemConfig,
  RegistryUserInfo,
} from "@/shared/types/api";
import apiClient from "@/shared/services/apiClient";
import registryClient from "@/shared/services/registryClient";
import { arknightsGameCaptcha } from "@/shared/services/captcha";
import { setMsg } from "@/shared/utils/toast";
import { API_RESPONSE_CODE } from "@/constants/api";
import { Type } from "@/constants/ui";
import { STORAGE_KEYS } from "@/constants/app";
import showDialog from "@/shared/components/dialog/dialog";
import NewSSRNotice from "@/features/games/components/NewSSRNotice.vue";
import { useUserStore } from "@/stores/useUserStore";
import { quotaSlotsSort } from "@/features/games/composables/useGameQuota";

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

const initialUserQuota = (): RegistryUserInfo => ({
  createdAt: 0,
  idServerPermission: 0,
  idServerPhone: "",
  idServerQQ: "",
  idServerStatus: 0,
  ruleFlags: [],
  rules: [],
  slots: [],
  updatedAt: 0,
  uuid: "",
});

export const useGamesStore = defineStore("games", () => {
  const config = ref<ApiSystemConfig>(initialConfig());
  const userQuota = ref<RegistryUserInfo>(initialUserQuota());
  const gameList = ref<ApiGameGame[]>([]);
  const globalSSR = ref<ApiGameSSR[]>([]);
  const captchaCache = ref<Record<string, ApiGameCaptchaInfo>>({});
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

  const updateCaptcha = (data: ApiGameGame[]) => {
    if (!data || data.length === 0) return;
    data.forEach((game) => {
      if (!game || !game.status) return;
      if (game.captcha_info.challenge || game.captcha_info.geetestId) {
        if (captchaCache.value[game.status.account]) {
          const cached = captchaCache.value[game.status.account];
          if (cached.created === game.captcha_info.created) {
            return;
          }
        }
        captchaCache.value[game.status.account] = game.captcha_info;
        arknightsGameCaptcha(game.status.account, game.captcha_info).catch(() => {
          delete captchaCache.value[game.status.account];
        });
      }
    });
  };

  const queryGameList = async () => {
    isLoadingGameList.value = true;
    try {
      const resp = await apiClient.fetchGameList();
      if (resp && resp.code === API_RESPONSE_CODE.SUCCESS) {
        updateGameList(resp.data);
        updateCaptcha(resp.data);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error during queryGameList:", error);
      return false;
    } finally {
      isLoadingGameList.value = false;
    }
  };

  const startGameListPolling = () => {
    const poll = async () => {
      try {
        const resp = await apiClient.fetchGameList();
        if (isLoadingGameList.value) return;
        if (resp && resp.code === API_RESPONSE_CODE.SUCCESS && resp.data) {
          updateGameList(resp.data);
          updateCaptcha(resp.data);
        }
      } catch (error) {
        console.error("Error during polling:", error);
      } finally {
        pollingTimeout.value = setTimeout(poll, intervalTime);
      }
    };
    poll();
  };

  const stopGameListPolling = () => {
    if (pollingTimeout.value) {
      clearTimeout(pollingTimeout.value);
      pollingTimeout.value = null;
    }
  };

  const closeSSE = () => {
    if (!sseConnection.value) {
      return;
    }
    sseConnection.value.close();
    sseConnection.value = null;
  };

  const queryUserQuota = async () => {
    try {
      const resp = await registryClient.fetchUserSlots();
      if (resp.code === API_RESPONSE_CODE.SUCCESS && resp.data) {
        resp.data.slots = quotaSlotsSort(resp.data.slots);
        userQuota.value = resp.data;
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error during queryMe:", error);
      return false;
    }
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
    closeSSE();
    try {
      const event = await new Promise<EventSource>((resolve, reject) => {
        const baseurl = apiClient.getHostServer().baseURL;
        const eventSource = new EventSource(`${baseurl}/sse/games?token=${user.token}`);
        const timer = setTimeout(() => {
          eventSource.close();
          reject(new Error("连接超时"));
        }, connectionTimeout);

        eventSource.onopen = () => {
          clearTimeout(timer);
          resolve(eventSource);
        };
        eventSource.onerror = () => {
          clearTimeout(timer);
          eventSource.close();
          reject(new Error("EventSource 连接失败"));
        };
      });
      sseConnection.value = event;

      event.addEventListener("game", (sourceEvent) => {
        if (!sourceEvent.data || isLoadingGameList.value) return;
        const data = JSON.parse(sourceEvent.data) as ApiGameGame[];
        updateGameList(data);
        updateCaptcha(data);
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
      setMsg(error, Type.Warning);
      return false;
    }
  };

  const initializeGameListServerConnection = async () => {
    if (isGameListCompletedInit.value) {
      return;
    }
    isGameListIniting.value = true;
    const [quotaResult, gameListResult] = await Promise.all([queryUserQuota(), queryGameList()]);
    if (!quotaResult || !gameListResult) {
      setMsg("初始化失败, 请刷新网页或稍后再尝试", Type.Warning);
      isGameListIniting.value = false;
      return;
    }
    isGameListIniting.value = false;
    isGameListCompletedInit.value = true;
    const sseResult = await startSSE();
    if (sseResult) {
      setMsg("链接到服务器成功", Type.Success);
      return;
    }
    startGameListPolling();
  };

  const gameSuspend = async (account: string) => {
    const payload: ApiGameConfig = {
      is_stopped: true,
    };
    return apiClient.doUpdateGameConf(account, payload);
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
    config.value = initialConfig();
    userQuota.value = initialUserQuota();
    gameList.value = [];
    globalSSR.value = [];
    captchaCache.value = {};
    charsCache.value = {};
    isGameListIniting.value = false;
    isGameListCompletedInit.value = false;
    isLoadingGameList.value = false;
    isLoadingChars.value = false;
    closeSSE();
    stopGameListPolling();
  };

  return {
    config,
    userQuota,
    gameList,
    globalSSR,
    captchaCache,
    charsCache,
    isGameListIniting,
    isLoadingGameList,
    isLoadingChars,
    firstGame,
    findGame,
    updateGameList,
    updateCaptcha,
    queryGameList,
    startGameListPolling,
    stopGameListPolling,
    queryUserQuota,
    startSSE,
    initializeGameListServerConnection,
    gameSuspend,
    fetchChars,
    $reset,
  };
});
