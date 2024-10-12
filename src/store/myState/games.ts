import { Type } from "../../components/toast/enum";
import { fetchGameList } from "../../plugins/axios";
import { arknigthsGameCaptcha } from "../../plugins/captcha/captcha";
import { setMsg } from "../../plugins/common";
import { router } from "../../plugins/router";
import { userStore } from "../user";
import { myState } from "./myState";

// 轮询间隔时间（毫秒）
const intervalTime = 5000;
let pollingTimeout: NodeJS.Timeout | null = null;

// 检查用户登录和 token 是否有效
const checkUserStatus = (): boolean => {
    const user = userStore();
    if (!user) {
        setMsg("userStore 未初始化", Type.Warning);
        return false;
    }
    if (!user.isLogin) {
        return false;
    }
    if (user.user.Info && user.user.Info.exp < Math.floor(Date.now() / 1000)) {
        setMsg("登录已过期，请重新登录", Type.Warning);
        user.logout();
        router.push("/");
        return false;
    }
    return true;
};

// 查询游戏列表
export const queryGameList = async () => {
    if (!checkUserStatus()) return false;
    try {
        const resp = await fetchGameList();
        if (resp && resp.code === 1 && resp.data) {
            updateGameList(resp.data);
            updateCaptcha(resp.data);
            return true;
        }
        return false;
    } catch (error) {
        console.error("Error during queryGameList:", error);
        return false;
    }
};

// 启动轮询游戏列表
export const startGameListPolling = () => {
    if (!checkUserStatus()) return;

    const poll = async () => {
        try {
            const resp = await fetchGameList();
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
export const updateGameList = (data: ApiGame.Game[]) => {
    myState.gameList = data;
}

export const updateCaptcha = (data: ApiGame.Game[]) => {
    if (!data) return;
    if (data.length === 0) return;
    data.forEach((game) => {
        if (!game) return;
        if (!game.status) return;
        if (game.status.code === 999 && game.captcha_info.challenge) {
            // key is challenge
            // check if the key is already in the cache
            if (myState.captchaCache[game.status.account]) {
                return;
            }
            // add this captcha to the cache
            myState.captchaCache[game.captcha_info.challenge] = game.captcha_info;
            arknigthsGameCaptcha(game.status.account, game.captcha_info);
        }
    });
};