<template>
    <div class="bg-base-100 w-96 mx-4 px-6 py-4 shadow-lg max-w-md rounded-lg blog">
        <h2>QQ 绑定</h2>
        <div class="divider divider-warning"></div>
        <div class="flex justify-center">
            <span v-if="isLoading" class="loading loading-bars" />
        </div>
        <div v-if="!isLoading">
            <div role="alert" class="rounded border-s-4 border-warning bg-warning/10 p-4 space-y-2 my-4">
                请点击下方QQ进行复制(包括verifyCode), 并发送到QQ官方群组 1345795, 450555868 中。</div>
            <input v-model="qqCode" class="input input-bordered join-item input-sm w-full max-w-xs" readonly
                @click="selectAll" />
            <div>
                <div class="flex justify-center p-2 mb-3">
                    <a target="_blank" @click="copyQQCodeAndOpenLink"
                        href="https://qm.qq.com/cgi-bin/qm/qr?k=YNU1S-_hVFD89w3cj8-ewkPFXXSiBRbY&jump_from=webapi&authKey=BU70QS4whXzJIi62KWNd9h8HZB5Vl2FSnjlrqYYf08RL5tbxnZhf2NMr9uLJNoYu">
                        <Icon icon="basil:qq-outline" width="48" height="48" />
                    </a>
                    <a target="_blank" @click="copyQQCodeAndOpenLink"
                        href="https://qm.qq.com/cgi-bin/qm/qr?k=y4He1C5OYZQPzojywTh_wlCywlfR5r-M&jump_from=webapi&authKey=13UJLWzqSVhwTXI9BPksnM7c9eogNcIdX/TC3xo6ShTAOJPgU2vlFR2rt3DxhJ2d">
                        <Icon icon="basil:qq-outline" width="48" height="48" />
                    </a>
                </div>
                <!-- <button @click="copyQQCode" class="btn btn-outline btn-info mb-3">{{ qqCode }}</button> -->
            </div>
        </div>
        <button @click="
            dialogClose();
        $emit('close');
        " class="btn btn-info btn-block mb-3 btn-sm">
            关闭
        </button>
    </div>
</template>
<script lang="ts" setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import { fetchQQBindCode } from "../../plugins/axios";
import { NOTIFY } from "../../plugins/config";
import { setMsg, sleep } from "../../plugins/common";
import { Type } from "../toast/enum";
import { Icon } from "@iconify/vue";
import { DialogComponentProps } from "../../plugins/dialog/dialog";
import { myState } from "../../store/games/myGames";

const props = defineProps<DialogComponentProps>();
const { dialogClose } = props;
const qqCode = ref("");
const isLoading = ref(true);
let intervalId: number | null = null;

const userQuota = computed(() => {
    return myState.userQuota;
});

onMounted(() => {
    fetchQQBindCode();
    intervalId = window.setInterval(getQQBindCode, 5000);
});

onUnmounted(() => {
    if (intervalId) clearInterval(intervalId);
});
const copyQQCodeAndOpenLink = async (event: MouseEvent) => {
    event.preventDefault();
    const target = event.currentTarget as HTMLAnchorElement;
    await copyQQCode();
    await sleep(2000);
    window.open(target.href, "_blank");
};
const selectAll = (event: Event) => {
    const target = event.target as HTMLInputElement;
    target.select();
};

const copyQQCode = async () => {
    try {
        await navigator.clipboard.writeText(qqCode.value);
        setMsg("绑定代码已复制到剪贴板", Type.Success);
        await sleep(500);
        setMsg("准备打开QQ群组", Type.Success);
    } catch (err) {
        setMsg("复制失败", Type.Warning);
    }
};

const getQQBindCode = () => {
    if (userQuota?.value?.idServerQQ) {
        qqCode.value = userQuota.value.idServerQQ;
        return;
    }
    fetchQQBindCode()
        .then((res) => {
            if (res.code === 1) {
                qqCode.value = ("verifyCode:" + res.data) as string;
                return;
            }
            if (res.code === 2) {
                qqCode.value = NOTIFY.ALREADY_BIND_QQ;
                if (intervalId) {
                    clearInterval(intervalId);
                    intervalId = null;
                }
                return;
            }
        })
        .finally(() => {
            isLoading.value = false;
        });
};
</script>
