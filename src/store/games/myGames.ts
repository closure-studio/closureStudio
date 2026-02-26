import { computed, reactive } from "vue";
import type {
  ApiSystemConfig,
  RegistryUserInfo,
  ApiGameGame,
  ApiGameSSR,
  ApiGameCaptchaInfo,
} from "@/shared/types/api";
import { Type } from "@/shared/components/toast/enum";
import { setMsg } from "@/shared/utils/toast";
import { queryGameList, startGameListPolling } from "./games";
import { startSSE } from "./sse";
import { queryUserQuota } from "./quota";

// 定义 State 的类型
interface State {
  config: ApiSystemConfig;
  userQuota: RegistryUserInfo;
  gameList: ApiGameGame[];
  globalSSR: ApiGameSSR[];
  isGameListCompletedInit: boolean;
  // others
  captchaCache: Record<string, ApiGameCaptchaInfo>;
  isStarted: boolean;
  isLoadingGameList: boolean;
}

class MyState {
  config: ApiSystemConfig = {
    isUnderMaintenance: false,
    isDebugMode: false,
    announcement: "",
    allowGameLogin: true,
    allowGameCreate: true,
    allowGameUpdate: true,
    allowGameDelete: true,
  };

  gameList: ApiGameGame[] = [];

  userQuota: RegistryUserInfo = {
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
  };

  globalSSR: ApiGameSSR[] = [];
  captchaCache: Record<string, ApiGameCaptchaInfo> = {};

  isGameListCompletedInit = false;
  isStarted = false;
  isLoadingGameList = false;
}

export const myState = reactive(new MyState());

export const initializeGameListServerConnection = async () => {
  // check is login
  if (myState.isStarted) {
    return;
  }
  myState.isStarted = true;
  const [quotaResult, gameListResult] = await Promise.all([queryUserQuota(), queryGameList()]);
  // 检查返回值是否都为 true
  if (!quotaResult || !gameListResult) {
    setMsg("初始化失败, 请刷新网页或稍后再尝试", Type.Warning);
    return;
  }
  myState.isGameListCompletedInit = true;
  const sseResult = await startSSE();
  if (sseResult) {
    setMsg("链接到服务器成功", Type.Success);
    return;
  }
  startGameListPolling();
};

export const findGame = (gameAccount: string) => {
  if (!myState.gameList) return undefined;
  return myState.gameList.find((game) => game.status.account === gameAccount);
};

export const getFirstGame = computed(() => {
  if (!myState.gameList) return null;
  if (myState.gameList.length === 0) {
    return null;
  }
  return myState.gameList[0];
});
