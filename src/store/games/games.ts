import type { ApiGameGame } from "@/shared/types/api";
import apiClient from "@/shared/services/apiClient";
import { arknigthsGameCaptcha } from "../../plugins/captcha/captcha";
import { myState } from "./myGames";

// 轮询间隔时间（毫秒）
const intervalTime = 5000;
let pollingTimeout: NodeJS.Timeout | null = null;

// 查询游戏列表
export const queryGameList = async () => {
  myState.isLoadingGameList = true;
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
    myState.isLoadingGameList = false;
  }
};

// 启动轮询游戏列表
export const startGameListPolling = () => {
  const poll = async () => {
    try {
      const resp = await apiClient.fetchGameList();
      if (myState.isLoadingGameList) return;
      if (resp && resp.code === 1 && resp.data) {
        updateGameList(resp.data);
        updateCaptcha(resp.data);
      }
    } catch (error) {
      console.error("Error during polling:", error);
    } finally {
      // 设定下一次轮询
      pollingTimeout = setTimeout(poll, intervalTime);
    }
  };

  // 开始轮询
  poll();
};

// 停止轮询游戏列表
export const stopGameListPolling = () => {
  if (pollingTimeout) {
    clearTimeout(pollingTimeout);
    pollingTimeout = null;
  }
};
export const updateGameList = (data: ApiGameGame[]) => {
  try {
    if (!myState) return;
    if (!data) {
      myState.gameList.splice(0, myState.gameList.length); // 清空数组而不破坏响应式引用
    } else {
      myState.gameList = data;
    }
  } catch (error) {
    console.error("Error during updateGameList:", error);
  }
};

export const updateCaptcha = (data: ApiGameGame[]) => {
  if (!data) return;
  if (data.length === 0) return;
  data.forEach((game) => {
    if (!game) return;
    if (!game.status) return;
    if (game.captcha_info.challenge || game.captcha_info.geetestId) {
      // key is account
      // check if the key is already in the cache
      if (myState.captchaCache[game.status.account]) {
        const cached = myState.captchaCache[game.status.account];
        if (cached.created === game.captcha_info.created) {
          return;
        }
      }
      // add this captcha to the cache
      myState.captchaCache[game.status.account] = game.captcha_info;
      arknigthsGameCaptcha(game.status.account, game.captcha_info).catch((error) => {
        console.error("Captcha error:", error);
        delete myState.captchaCache[game.status.account];
      });
    }
  });
};
