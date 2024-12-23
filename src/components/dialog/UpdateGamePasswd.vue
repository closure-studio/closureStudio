<template>
    <div class="bg-base-100 w-96 mx-4 px-6 py-4 shadow-lg max-w-md rounded-lg blog">
        <div class="text-3xl text-info font-bold text-center">修改密码</div>
        <div class="divider">账号信息</div>
        <div class="w-full mb-3">
            <div class="s-combo mb-6">
                <input class="s-input peer focus:ring-info" disabled v-model="props.form.account">
                <label class="s-label peer-focus:text-info">登录账号</label>
            </div>
            <div class="s-combo">
                <input class="s-input peer focus:ring-info" v-model="form.password">
                <label class="s-label peer-focus:text-info">密码（请确认无误）</label>
            </div>
        </div>
        <div class="divider my-4">服务器选择</div>
        <div class="w-full mb-3">
            <label class="label cursor-pointer">
                <span class="text-xl">BiliBili服</span>
                <input disabled type="radio" :value="2" v-model="form.platform" id="bili"
                    class="radio checked:bg-blue-500" />
            </label>
            <label class="label cursor-pointer">
                <span class="text-xl">官服(安卓 / IOS)</span>
                <input disabled type="radio" :value="1" v-model="form.platform" id="official"
                    class="radio checked:bg-red-500" />
            </label>
        </div>
        <div class="flex justify-center space-x-4 mb-3">
            <button @click="dialogClose()" class="btn btn-error btn-outline w-28">
                <span v-if="isLoading" class="loading loading-bars" />
                关闭
            </button>
            <button class="btn btn-info w-28" @click="handleUpdateGamePasswdOnBtnClick">
                <span v-if="isLoading" class="loading loading-bars" />
                <span v-else>更新游戏密码</span>
            </button>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import { setMsg } from '../../plugins/common';
import { Type } from '../toast/enum';
import { doUpdateGamePasswd } from '../../plugins/axios';
import { DialogComponentProps } from '../../plugins/dialog/dialog';
import { startCaptcha } from '../../plugins/captcha/captcha';
import { queryGameList } from '../../store/games/games';
import { queryUserQuota } from '../../store/games/quota';


export interface UpdateGamePasswdProps extends DialogComponentProps {
    slotUUID: string;
    form: Registry.AddGameForm;
}

const props = defineProps<UpdateGamePasswdProps>();
const { dialogClose, slotUUID, form } = props;

const myForm = ref<Registry.AddGameForm>(props.form)
const isLoading = ref(false);

const handleUpdateGamePasswdOnBtnClick = async () => {
    if (isLoading.value) return;
    if (slotUUID === '') {
        setMsg('请刷新页面后重试', Type.Warning)
        return;
    }
    if (myForm.value.password.length === 0 || myForm.value.password.length > 32) {
        setMsg('请刷新页面后重试', Type.Warning)
        return;
    }
    try {
        isLoading.value = true;
        const data = myForm.value;
        const resp = await startCaptcha(updateGamePasswdWithCaptcha(slotUUID, data));
        await Promise.all([queryGameList(), queryUserQuota()]);
        if (resp.code === 1) {
            setMsg('更新密码成功', Type.Success)
            dialogClose();
        } else {
            setMsg('请刷新页面后重试', Type.Warning)
        }
    } catch (error) {
        setMsg(error, Type.Error)
    } finally {
        isLoading.value = false;
    }
}

const updateGamePasswdWithCaptcha = (uuid: string, data: Registry.AddGameForm) => {
    return async (captchaToken: string) => {
        return await doUpdateGamePasswd(uuid, captchaToken, data)
    }
}

</script>