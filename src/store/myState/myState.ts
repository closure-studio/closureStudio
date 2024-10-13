import { computed, reactive } from "vue";
import { Type } from "../../components/toast/enum";
import { setMsg } from "../../plugins/common";
import { queryGameList, startGameListPolling } from "./games";
import { startSSE } from "./sse";
import { queryUserQuota } from "./quota";




// 定义 State 的类型
interface State {
  config: ApiSystem.Config;
  userQuota: Registry.UserInfo;
  gameList: ApiGame.Game[];
  globalSSR: ApiGame.SSR[];
  isGameListCompletedInit: boolean;
  // others
  captchaCache: Record<string, ApiGame.CaptchaInfo>;
  isLoadingGameList: boolean;
}

// 使用 reactive 创建状态
export const myState = reactive<State>({
  config: {
    isUnderMaintenance: false,
    isDebugMode: false,
    announcement: '',
    allowGameLogin: true,
    allowGameCreate: true,
    allowGameUpdate: true,
    allowGameDelete: true,
  },
  gameList: [],
  userQuota: {
    createdAt: 0,
    idServerPermission: 0,
    idServerPhone: '',
    idServerQQ: '',
    idServerStatus: 0,
    ruleFlags: [],
    rules: [],
    slots: [],
    updatedAt: 0,
    uuid: '',
  },
  globalSSR: [],

  //
  isGameListCompletedInit: false,
  captchaCache: {},
  isLoadingGameList: false,
});



export const initializeGameListServerConnection = async () => {
  // check is login
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
  return myState.gameList.find((game) => game.status.account === gameAccount);
};

export const getFirstGame = computed(() => {
  if (!myState.gameList) return null;
  if (myState.gameList.length === 0) {
    return null;
  }
  return myState.gameList[0];
});

