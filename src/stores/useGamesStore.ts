import { computed, ref } from "vue";
import { defineStore } from "pinia";
import type {
  ApiGameCaptchaInfo,
  ApiGameConfig,
  ApiGameGame,
  ApiGameLogEvent,
  ApiGameSSR,
  ApiSystemConfig,
  RegistryUserInfo,
} from "@/shared/types/api";
import apiClient from "@/shared/services/apiClient";
import registryClient from "@/shared/services/registryClient";
import { arknightsGameCaptcha } from "@/plugins/captcha/captcha";
import { setMsg } from "@/shared/utils/toast";
import { Type } from "@/shared/components/toast/enum";
import showDialog from "@/plugins/dialog/dialog";
import NewSSRNotice from "@/components/dialog/NewSSRNotice.vue";
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
  const isGameListCompletedInit = ref(false);
  const isStarted = ref(false);
  const isLoadingGameList = ref(false);
  const pollingTimeout = ref<ReturnType<typeof setTimeout> | null>(null);

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
      if (resp && resp.code === 1) {
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
        if (resp && resp.code === 1 && resp.data) {
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

  const queryUserQuota = async () => {
    try {
      const resp = await registryClient.fetchUserSlots();
      if (resp.code === 1 && resp.data) {
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

      window.addEventListener("beforeunload", () => {
        event.close();
      });

      event.addEventListener("close", () => {
        setMsg("你已在其他窗口或设备访问，本页面暂停更新", Type.Warning);
        event.close();
      });

      event.addEventListener("ssr", (sourceEvent) => {
        globalSSR.value = JSON.parse(sourceEvent.data) ?? [];
        const lastReadTs = Number(localStorage.getItem("lastReadTs")) || 0;
        globalSSR.value = globalSSR.value.filter((item) => item.createdAt > lastReadTs);
        if (globalSSR.value.length > 0) {
          setMsg("可露希尔又双叒叕抽到 6 星干员啦!!!", Type.Info);
          showDialog(NewSSRNotice, { users: globalSSR.value } as any);
        }
      });

      return true;
    } catch (error) {
      setMsg(error, Type.Warning);
      return false;
    }
  };

  const initializeGameListServerConnection = async () => {
    if (isStarted.value) {
      return;
    }
    isStarted.value = true;
    const [quotaResult, gameListResult] = await Promise.all([queryUserQuota(), queryGameList()]);
    if (!quotaResult || !gameListResult) {
      setMsg("初始化失败, 请刷新网页或稍后再尝试", Type.Warning);
      return;
    }
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

  const $reset = () => {
    config.value = initialConfig();
    userQuota.value = initialUserQuota();
    gameList.value = [];
    globalSSR.value = [];
    captchaCache.value = {};
    isGameListCompletedInit.value = false;
    isStarted.value = false;
    isLoadingGameList.value = false;
    stopGameListPolling();
  };

  return {
    config,
    userQuota,
    gameList,
    globalSSR,
    captchaCache,
    isGameListCompletedInit,
    isStarted,
    isLoadingGameList,
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
    $reset,
  };
});
