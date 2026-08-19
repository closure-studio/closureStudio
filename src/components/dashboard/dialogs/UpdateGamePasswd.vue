<template>
  <div class="bg-base-100 w-96 mx-4 px-6 py-4 shadow-lg max-w-md rounded-lg blog">
    <div class="text-3xl text-info font-bold text-center">修改密码</div>
    <div class="divider">账号信息</div>
    <div class="w-full mb-3">
      <div class="s-combo mb-6">
        <input class="s-input peer" disabled v-model="myForm.account" />
        <label class="s-label">登录账号</label>
      </div>
      <div class="s-combo">
        <input class="s-input peer" v-model="myForm.password" />
        <label class="s-label">密码（请确认无误）</label>
      </div>
    </div>
    <ServerSelector v-model="myForm.platform" />
    <div class="flex justify-center space-x-4 mb-3">
      <button @click="dialogClose" class="btn btn-error btn-outline w-32" :disabled="isLoading">
        <span v-if="isLoading" class="loading loading-bars" />
        关闭
      </button>
      <button
        class="btn btn-info w-32"
        :disabled="isLoading"
        @click="handleUpdateGamePasswdOnBtnClick"
      >
        <span v-if="isLoading" class="loading loading-bars" />
        更新游戏密码
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import type { GameAccountForm } from "@/shared/types/api";
import { useLoading } from "@/shared/composables/useLoading";
import { useCaptcha } from "@/services/captchaActions";
import { setMsg } from "@/utils/toast";
import { useGamesStore } from "@/stores/useGamesStore";
import type { DialogComponentProps } from "@/shared/components/dialog/dialog";
import { Type } from "@/constants/ui";
import { API_RESPONSE_CODE } from "@/constants/api";
import ServerSelector from "@/components/game/ServerSelector.vue";

export interface UpdateGamePasswdProps extends DialogComponentProps {
  form: GameAccountForm;
}

const props = defineProps<UpdateGamePasswdProps>();
const { dialogClose } = props;
const gamesStore = useGamesStore();
const myForm = ref<GameAccountForm>({ ...props.form });
const { isLoading } = useLoading();
const captcha = useCaptcha();

const handleUpdateGamePasswdOnBtnClick = async () => {
  if (isLoading.value) return;
  if (myForm.value.account.trim() === "" || myForm.value.password.length === 0) {
    setMsg("请填写完整的账号和密码", Type.Warning);
    return;
  }
  if (myForm.value.password.length > 32) {
    setMsg("密码长度不能超过 32 位", Type.Warning);
    return;
  }
  try {
    isLoading.value = true;
    const resp = await captcha.updateGamePassword(myForm.value);
    if (resp.code === API_RESPONSE_CODE.SUCCESS) {
      await gamesStore.queryGameList();
      setMsg("更新密码成功", Type.Success);
      dialogClose();
    } else {
      setMsg(resp.message || "更新密码失败", Type.Warning);
    }
  } catch (error) {
    setMsg(error, Type.Error);
  } finally {
    isLoading.value = false;
  }
};
</script>
