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
  isStarted: boolean;
  isLoadingGameList: boolean;
}

class MyState {
  config: ApiSystem.Config = {
    isUnderMaintenance: false,
    isDebugMode: false,
    announcement: "",
    allowGameLogin: true,
    allowGameCreate: true,
    allowGameUpdate: true,
    allowGameDelete: true,
  };

  gameList: ApiGame.Game[] = [];

  userQuota: Registry.UserInfo = {
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

  globalSSR: ApiGame.SSR[] = [];
  captchaCache: Record<string, ApiGame.CaptchaInfo> = {};

  isGameListCompletedInit = false;
  isStarted = false;
  isLoadingGameList = false;

  get ticketAuthorMap(): Record<string, TicketSystem.Author> {
    const result: Record<string, TicketSystem.Author> = {};

    this.gameList.forEach((game) => {
      // ✅ 过滤掉 game.status 不存在 或者 game.status.nick_name 为空的情况
      if (!game.status || !game.status.nick_name?.trim()) {
        return;
      }
      result[game.status.account] = {
        uuid: this.userQuota.uuid,
        title: game.status.nick_name,
        nickname: game.status.nick_name,
        avatar: game.status.avatar,
      };
    });

    return result;
  }
}

export const myState = reactive(new MyState());

export const initializeGameListServerConnection = async () => {
  // check is login
  if (myState.isStarted) {
    return;
  }
  myState.isStarted = true;
  const [quotaResult, gameListResult] = await Promise.all([
    queryUserQuota(),
    queryGameList(),
  ]);
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
