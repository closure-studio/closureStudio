<template>
    <p v-if="user.info.status === -1 && userQuota?.idServerPhone.length === 0 && gameList[0]?.status.created_at != 0">
        手机验证码已经发送, 完成【手机号：{{ gameList[0]?.status.account?.replace(/(\d{3})\d{6}(\d{2})/,
            "$1****$2") }}】绑定认证<b class="cursor-pointer" @click="handleRealNameDialogOpen">👉点我解锁👈</b>不限时游戏托管，并提升托管数量。
        剩余托管体验时间 <b>【{{
            calc(gameList[0]?.status.created_at, now) }}】</b>。<br />
    </p>
    <p v-if="user.isVerify && userQuota?.idServerQQ.length === 0">完成QQ账号验证解锁更多槽位。<b class="cursor-pointer"
            @click="handleQQBindDialogOpen()">👉点我解锁👈</b>提升托管数量</p>
    <p>如果博士遇到问题（验证码、游戏异常等），欢迎加入QQ群<a href="https://qm.qq.com/q/RCzNIaQOKi" target="_blank" class="font-bold text-blue-600 hover:text-blue-800 underline">1081140227</a>寻求技术支援。</p>

</template>
<script lang="ts" setup>
import { computed, onMounted } from "vue";
import showDialog from "../../../plugins/dialog/dialog";
import { myState } from "../../../store/games/myGames";
import { useWXPusher } from "../../../plugins/wxPusher/wxPusher";
import { userStore } from "../../../store/user";
import QQBind from "../../dialog/QQBind.vue";
import RealName from "../../dialog/RealName.vue";
import { router } from "../../../router";

const user = userStore();
const { isQueryWxPusher, wxPusher, queryWxPusher } = useWXPusher();

const gameList = computed(() => myState.gameList);
const userQuota = computed(() => myState.userQuota);

onMounted(() => {
    queryWxPusher();
});

const now = Math.round(Date.now() / 1000);

const calc = (ts1: number, ts2: number) => {
    if (!ts1) return "24小时";
    ts1 += 86400;
    const during = ts1 - ts2;
    if (during <= 0) return "请先启动游戏托管";
    const hours = Math.floor(during / (60 * 60));
    const minutes = Math.abs(Math.floor((during % (60 * 60)) / 60));
    return `${hours}小时${minutes}分钟`;
};

const navigateToWXPusher = () => {
    // using vue-router
    router.push("/profile/wechat");
};

const navigateToTicket = () => {
    // using vue-router
    router.push("/ticket");
};

const handleQQBindDialogOpen = () => {
    showDialog(QQBind);
};

const handleRealNameDialogOpen = () => {
    showDialog(RealName);
};

</script>