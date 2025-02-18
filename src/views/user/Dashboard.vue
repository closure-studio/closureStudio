<template>
    <div class="flex h-full">
        <div class="w-full flex-col max-w-4xl 2xl:max-w-6xl xl:mr-auto s-margin md:!flex"
            :class="show ? 'xl:ml-0 !hidden' : 'lg:ml-[calc((100vw-56rem)/2)] 2xl:ml-[calc((100vw-72rem)/2)]'">
            <div class="bg-base-300 shadow-lg rounded-lg px-4 py-1 blog relative">
                <div class="text-2xl md:text-4xl font-bold text-info mt-3">📢 今日特价</div>
                <p v-for="k in config.announcement?.split('\n') || ['可露希尔逃跑了']">
                    {{ k }}
                </p>
                <!-- <p>
                    https://arknights.host 准备过期。
                </p>
                <p>
                    请及时更换到 https://closure.ltsc.vip 或 https://arknights.app
                </p> -->
                <div class="divider mt-0">个人信息</div>
                <StatusMessage />
            </div>
            <transition name="collapse" @before-enter="beforeEnter" @enter="enter" @leave="leave">
                <div @click="handleAPIStatusBoardOnClick" v-if="isAPIStatusBoardShow"
                    class="bg-base-300 shadow-lg rounded-lg blog relative mt-5 py-5">
                    <APIStatusBoard />
                </div>
            </transition>
            <IndexStatus />
            <div class="text-2xl font-bold">我的托管（{{userQuota?.slots.filter((slot: Registry.Slot) => slot.gameAccount
                !==
                null)?.length}} 已用 / {{ userQuota?.slots?.length }} 可用）</div>
            <div v-if="!isGameListCompletedInit" class="h-72 flex justify-center w-full">
                <span className="loading loading-ring loading-lg"></span>
                <span className="loading loading-ring loading-lg"></span>
                <span className="loading loading-ring loading-lg"></span>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div v-for="(slot, key) in userQuota?.slots" :key="key">
                    <GameAddCard v-if="!slot.gameAccount" :slot="slot" :userQuota="userQuota" :key="key"
                        @click="createGameButtonOnClick(slot, slot.uuid)" />
                    <GameAccount v-else :gameAccount="slot.gameAccount" @click="openGameConf(slot.gameAccount)">
                        <div class="divider mt-2 mb-3 text-info font-arknigths text-xl">START</div>
                        <div v-if="findGame(slot.gameAccount)">
                            <div class="grid gap-4 grid-cols-2 mt-2">
                                <button class="btn btn-outline btn-sm btn-block btn-primary"
                                    v-if="isSuspendStatus(slot.gameAccount)"
                                    @click="handleGameSuspendBtnOnClick(slot.gameAccount)"
                                    :disabled="isLoading">暂停</button>

                                <button class="btn btn-outline btn-sm btn-block btn-info" v-else
                                    @click="handleGameLoginBtnOnClick(slot.gameAccount)"
                                    :disabled="isLoginBtnDisabled(slot.gameAccount)">启动</button>

                                <button class="btn btn-outline btn-sm btn-block btn-primary" :disabled="isLoading"
                                    @click.stop="handleUpdatePasswdBtnOnClick(slot)">更新密码</button>

                                <button :disabled="isLoading" class="btn btn-outline btn-sm btn-block btn-error"
                                    @click.stop="handleDeleteBtnOnClick(slot.uuid, slot.gameAccount)">删除</button>
                            </div>
                        </div>
                        <div v-if="!findGame(slot.gameAccount) && isGameListCompletedInit">
                            <button :disabled="isLoading" class="btn btn-outline btn-sm btn-block btn-error mt-2"
                                @click.stop="handleRepairBtnOnClick(slot.uuid, slot.gameAccount)">点击进行修复</button>
                        </div>
                    </GameAccount>
                </div>
            </div>
        </div>
        <div class="bg-base-300 flex-1 flex flex-col md:ml-8 max-w-xl p-4 shadow-lg rounded-lg items-center animate__animated"
            v-show="show" :class="show ? 'animate__fadeInRight' : 'animate__fadeOutRight'">
            <GamePanel :account="selectGame" :closeFunc="() => { setShow(false) }" />
        </div>
    </div>
</template>
<script setup lang="ts">
import "animate.css";
import { computed, onMounted, ref, watch } from "vue";
import { GameAccount, GameAddCard, GamePanel, IndexStatus } from "../../components/card/index";
import { StatusMessage } from "../../components/dashboard/user";
import CreateGame from "../../components/dialog/CreateGame.vue";
import GeeTestNotify from "../../components/dialog/GeeTestNotify.vue";
import UpdateGamePasswd from "../../components/dialog/UpdateGamePasswd.vue";
import YouMayKnow from "../../components/dialog/YouMayKnow.vue";
import { Type } from "../../components/toast/enum";
import { startCaptcha } from "../../plugins/captcha/captcha";
import { getRealGameAccount, setMsg } from "../../plugins/common";
import { NOTIFY } from "../../plugins/config";
import showDialog from "../../plugins/dialog/dialog";
import { findGame, getFirstGame, initializeGameListServerConnection, myState } from "../../store/games/myGames";
import { allowGameCreate, canDeleteGame, queryUserQuota } from "../../store/games/quota";
import { userStore } from "../../store/user";
import { queryGameList } from "../../store/games/games";
import APIStatusBoard from "../../components/APIStatus/APIStatusBoard.vue";
import { processGameAccount } from "../../utils/account";
import authClient from "../../plugins/axios/authClient";
import apiClient from "../../plugins/axios/apiClient";
import registryClient from "../../plugins/axios/registryClient";

const show = ref(false);
const user = userStore();
const selectedSlotUUID = ref("");
const config = ref({} as ApiSystem.Config);
const selectedRegisterForm = ref({} as Registry.AddGameForm); // for update password
const isLoading = ref(false);
const isAPIStatusBoardShow = ref(true);
const userQuota = computed(() => {
    return myState.userQuota;
});
// start
const firstGame = getFirstGame;
// 补发验证码
watch(firstGame, (value) => {
    if (user.isVerify) {
        return;
    }
    if (!value) {
        return;
    }
    if (value.status.created_at > 0) {
        let phone = value.status.account;
        // account is G18319999999
        // if the first character is not a number, split it
        if (isNaN(parseInt(phone[0]))) {
            phone = phone.slice(1);
        }
        authClient.Send_SMS({ phone: phone });
    }
});

const isGameListCompletedInit = computed(() => {
    return myState.isGameListCompletedInit;
});

onMounted(async () => {
    initializeGameListServerConnection();
    apiClient.fetchSystemConfig().then((resp) => {
        config.value = resp.data;
    });
    showDialog(YouMayKnow);
});



const createGameButtonOnClick = (slot: Registry.Slot, slotUUID: string) => {
    if (!userQuota.value) {
        setMsg("游戏托管槽位数据异常，无法提交", Type.Warning);
        return;
    }
    const response = allowGameCreate(
        slot,
        userQuota.value,
        user.isVerify // status code == 1 || 2
    );
    if (response.isLocked) {
        setMsg(response.message, Type.Warning);
        return;
    }
    showDialog(CreateGame, {
        slotUUID: slotUUID,
        isFirst: !user.isVerify,
        loginFunc: gameLogin
    });
};

const isUpdateStatus = (gameAccount: string) => {
    const game = findGame(gameAccount);
    if (!game) return false;
    if (!game.status.password || game.status.text.includes("密码错误") || game.status.text.includes("无法解密密码")) {
        return true
    }
    return false;
};

const isSuspendStatus = (gameAccount: string) => {
    const game = findGame(gameAccount);
    if (!game) return false;
    return game.status.code === 2;
};

const isLoginBtnDisabled = (gameAccount: string) => {
    const game = findGame(gameAccount);
    if (isLoading.value) return true;
    if (!game) return false;
    return game.status.code === 1;
};

const handleAPIStatusBoardOnClick = () => {
    isAPIStatusBoardShow.value = false;
};

const handleGameSuspendBtnOnClick = (gameAccount: string) => {
    show.value = !show.value;
    gameSuspend(gameAccount);
};
const handleGameLoginBtnOnClick = (gameAccount: string) => {
    show.value = !show.value;
    gameLogin(gameAccount);
};


const handleDeleteBtnOnClick = async (slotUUID: string, gameAccount: string) => {
    // can you delete it?
    if (userQuota.value === undefined) {
        setMsg("游戏托管槽位数据异常，无法提交", Type.Warning);
        return;
    }
    if (!canDeleteGame(userQuota.value, gameAccount)) {
        setMsg(NOTIFY.NOT_ALLOW_DELETE_GAME, Type.Warning);
        return;
    }
    isLoading.value = true;
    try {
        const deleteResp = await startCaptcha(deleteGameWithCaptcha(slotUUID));
        await Promise.all([queryGameList(), queryUserQuota()]);
        if (deleteResp.code === 1) {
            setMsg("删除成功", Type.Success);
        } else {
            setMsg(deleteResp.message, Type.Warning);
        }
    } catch (error) {
        setMsg("删除失败", Type.Warning);
    } finally {
        isLoading.value = false;
    }
};


const handleRepairBtnOnClick = async (slotUUID: string, gameAccount: string) => {
    // can you delete it?
    if (userQuota.value === undefined) {
        setMsg("游戏托管槽位数据异常，无法提交", Type.Warning);
        return;
    }
    if (!canDeleteGame(userQuota.value, gameAccount)) {
        setMsg(NOTIFY.NOT_ALLOW_DELETE_GAME, Type.Warning);
        return;
    }
    isLoading.value = true;
    try {
        const accountInfo = processGameAccount(gameAccount)
        if (!accountInfo) {
            setMsg("账号格式不正确", Type.Warning);
            return;
        }
        const form: Registry.AddGameForm = {
            account: accountInfo.remaining,
            password: "123456",
            platform: accountInfo.code,
        }
        const createGameResp = await startCaptcha(createGameWithCaptcha(slotUUID, form))
        if (createGameResp.code == 1) {
            return createGameResp
        }
        setMsg(createGameResp.message, Type.Error)
        await Promise.all([queryGameList(), queryUserQuota()]);
        if (createGameResp.code === 1) {
            setMsg("修复成功", Type.Success);
        } else {
            setMsg(createGameResp.message, Type.Warning);
        }
    } catch (error) {
        setMsg("修复失败", Type.Warning);
    } finally {
        isLoading.value = false;
    }
};



const handleUpdatePasswdBtnOnClick = async (slot: Registry.Slot) => {
    // can you delete it?
    if (!slot.gameAccount) return;
    const game = findGame(slot.gameAccount);
    if (!game) return;
    selectedSlotUUID.value = slot.uuid;
    selectedRegisterForm.value.account = getRealGameAccount(game.status.account);
    selectedRegisterForm.value.platform = game.status.platform;
    selectedRegisterForm.value.password = "";
    showDialog(UpdateGamePasswd, {
        slotUUID: slot.uuid,
        form: selectedRegisterForm.value
    });
};

const gameLogin = async (account: string) => {
    try {
        isLoading.value = true;
        const loginResp = await startCaptcha(loginGameWithCaptcha(account));
        await Promise.all([queryGameList(), queryUserQuota()]);
        if (loginResp.code === 1) {
            setMsg("启动成功", Type.Success);
            showDialog(GeeTestNotify);
        } else {
            setMsg(loginResp.message, Type.Warning);
        }
    } catch (e) {
        setMsg("启动失败", Type.Warning);
    } finally {
        isLoading.value = false;
    };
};


const gameSuspend = async (account: string) => {
    isLoading.value = true;
    const config: ApiGame.Config = {
        is_stopped: true
    };
    try {
        const resp = await apiClient.doUpdateGameConf(account, config);
        await queryGameList();
        if (resp.code === 1) {
            setMsg("暂停成功", Type.Success);
        } else {
            setMsg(resp.message, Type.Warning);
        }
    } catch (error) {
        setMsg("暂停失败", Type.Warning);
    } finally {
        isLoading.value = false;

    }
};

const createGameWithCaptcha = (slotUUID: string, data: Registry.AddGameForm) => {
    return async (captchaToken: string) => {
        return await registryClient.doAddGame(slotUUID, captchaToken, data)
    }
}

const deleteGameWithCaptcha = (slotUUID: string) => {
    return async (captchaToken: string) => {
        return await registryClient.doDelGame(captchaToken, slotUUID);
    };
};
const loginGameWithCaptcha = (gameAccount: string) => {
    return async (captchaToken: string) => {
        return await apiClient.doGameLogin(captchaToken, gameAccount);
    };
};

const selectGame = ref("");
const setShow = (value: boolean) => {
    show.value = value;
};
const openGameConf = (account: string) => {
    const game = findGame(account);
    if (!game) return;
    // 这些感觉可以再优化下
    selectGame.value = show.value ? "" : game.status.account;
    show.value = !show.value;
};
const beforeEnter = (el: Element): void => {
    (el as HTMLElement).style.height = '0';
    (el as HTMLElement).style.opacity = '0';
};

const enter = (el: Element, done: () => void): void => {
    (el as HTMLElement).style.transition = 'all 0.3s ease';
    (el as HTMLElement).style.height = (el as HTMLElement).scrollHeight + 'px';
    (el as HTMLElement).style.opacity = '1';
    setTimeout(done, 300); // 动画持续时间 0.3s
};

const leave = (el: Element, done: () => void): void => {
    (el as HTMLElement).style.transition = 'all 0.2s ease';
    (el as HTMLElement).style.height = (el as HTMLElement).scrollHeight + 'px'; // 确保在消失前先设置高度
    setTimeout(() => {
        (el as HTMLElement).style.height = '0'; // 折叠动画
        (el as HTMLElement).style.opacity = '0'; // 渐隐动画
        setTimeout(done, 100); // 等待动画完成再移除元素
    }, 0);
};
</script>
<style>
div,
img {
    user-select: none;
    -webkit-user-drag: none;
}

.collapse-enter-active,
.collapse-leave-active {
    overflow: hidden;
    /* 防止高度动画过程中内容溢出 */
}
</style>
