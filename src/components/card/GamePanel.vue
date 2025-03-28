<template>
    <a class="text-3xl mt-2 text-info font-bold">托管详情</a>
    <template v-if="selectedGame?.status.code || 0 > 1">
        <div class="divider">账号信息</div>
        <div class="w-full grid grid-cols-3 justify-items-center">
            <div class="flex flex-col" v-for="m in 3">
                <span class="text-base-content/70 text-xl font-extrabold">{{ ["龙门币", "合成玉", "源石"][m - 1] }}</span>
                <span class="text-2xl md:text-3xl text-center mt-2 font-en">
                    {{ [details?.status?.gold, details?.status?.diamondShard, details?.status?.androidDiamond][m - 1] }}
                </span>
            </div>
        </div>
        <div class="divider text-info text-lg font-bold">
            理智溢出: {{ formatTime(((details?.status.maxAp || 0) - (Math.floor((Date.now() / 1000 -
                (details?.status.lastApAddTime || 0)) / 360) + (details?.status.ap || 0))) * 360 + Math.ceil(Date.now() /
                    1000), "hh:MM") }}
        </div>
    </template>
    <div class="divider" v-else>你的游戏尚未启动，请先配置</div>
    <button class="btn btn-info btn-outline btn-block my-1" @click="handleGameConfigDialogOpen">托管配置</button>
    <div class="divider">不实时日志</div>
    <div class="h-[calc(100vh-32rem)] overflow-y-auto">
        <table class="text-[1rem]">
            <tbody>
                <tr v-for="log in gameLogs.logs">
                    <td class="text-info whitespace-nowrap">{{ formatTime(log.ts, "HH:mm") }}</td>
                    <td class="pl-2">{{ log.content }}</td>
                </tr>
            </tbody>
        </table>
        <button :disabled="!gameLogs.hasMore || isLoadingGameLogs" class="btn btn-info btn-outline btn-block my-1"
            @click="getLogs">
            {{ "加载更多" }}
        </button>
    </div>
    <button @click="openScreenShots()" class="btn btn-block btn-info my-2">查看托管截图</button>
    <button @click.stop="handleCloseBtnOnClick" class="btn btn-outline btn-sm btn-block btn-error">关闭托管详情</button>
</template>
<script lang="ts" setup>
import { ref, watch } from "vue";
import apiClient from "../../plugins/axios/apiClient";
import { formatTime, setMsg } from "../../plugins/common";
import showDialog from "../../plugins/dialog/dialog";
import { findGame } from "../../store/games/myGames";
import BattleScreenShots from "../dialog/BattleScreenShots.vue";
import GameConfig from "../dialog/GameConfig.vue";
import { Type } from "../toast/enum";
interface Props {
    account: string;
    closeFunc: () => void;
    // statusCode: number // 当前用户状态，-1=登陆失败 0=未开启/未初始化/正在初始化但未登录 1=登录中 2=登陆完成/运行中 3=游戏错误
}
const props = withDefaults(defineProps<Props>(), {
    account: ""
});

const gameLogs = ref<ApiGame.GameLogs>({
    logs: [],
    hasMore: false
});

const selectedGame = ref<ApiGame.Game>();
const isLoadingGameLogs = ref(false);
const details = ref<ApiGame.Detail>();

watch(
    () => props.account,
    (newVal) => {
        selectedGame.value = findGame(newVal);
        if (selectedGame.value?.status?.code && selectedGame.value?.status?.code > 1) {
            getGameDetails();
            // clear logs
            gameLogs.value = {
                logs: [],
                hasMore: false
            };
            getLogs();
        }
    }
);

const getGameDetails = async () => {
    try {
        const res = await apiClient.fetchGameDetails(props.account);
        if (res.data) {
            details.value = res.data;
        } else {
            setMsg(res.message, Type.Warning);
        }
    } catch (error) {
        reportError(error);
    }
};

const openScreenShots = () => {
    if (!details.value?.screenshot || details.value?.screenshot.length === 0) {
        setMsg("暂时没有截图数据", Type.Warning);
        return;
    }
    showDialog(BattleScreenShots, {
        screenShots: details.value.screenshot
    });
};

const getLogs = async () => {
    if (isLoadingGameLogs.value) return;
    isLoadingGameLogs.value = true;
    const lastLogId = gameLogs.value.logs[gameLogs.value.logs.length - 1]?.id || 0; // 设置为0如果为undefined

    try {
        const res = await apiClient.fetchGameLogs(props.account, lastLogId);
        if (res.data) {
            gameLogs.value.logs.push(...res.data.logs);
            gameLogs.value.hasMore = res.data.hasMore;
        } else {
            setMsg(res.message, Type.Warning);
        }
    } catch (error) {
        reportError(error);
    } finally {
        isLoadingGameLogs.value = false;
    }
};

const handleGameConfigDialogOpen = () => {
    showDialog(GameConfig, {
        account: props.account
    });
};

const handleCloseBtnOnClick = () => {
    if (!props.closeFunc) return;
    props.closeFunc();
};
</script>
