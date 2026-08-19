<template>
  <div class="bg-base-100 mx-4 p-6 shadow-lg max-w-xl rounded-lg">
    <div class="text-3xl text-info font-bold text-center">游戏登记托管</div>
    <div class="divider">账号信息</div>
    <div class="w-full mb-3">
      <div class="s-combo mb-6">
        <input class="s-input peer focus:ring-info" v-model="form.account" />
        <label class="s-label peer-focus:text-info">登录账号</label>
      </div>
      <div class="s-combo">
        <input class="s-input peer focus:ring-info" v-model="form.password" />
        <label class="s-label peer-focus:text-info">密码（请确认无误）</label>
      </div>
    </div>
    <ServerSelector v-model="form.platform" />

    <div class="divider mt-0">必读内容</div>
    <div class="w-full">
      <div role="alert" class="rounded border-s-4 border-info bg-info/10 px-4 py-2 space-y-2">
        <p class="skd-title">
          我已阅读理解可露希尔每日生鲜
          <a href="/blog/Terms&Policies" target="_blank" class="s-underline">用户协议</a>、
          <a href="/blog/FAQ" target="_blank" class="s-underline">常见问题</a>
        </p>
        <p class="skd-title">
          具有一定阅读理解能力，已阅读<a
            class="text-info"
            href="https://github.com/ryanhanwu/How-To-Ask-Questions-The-Smart-Way/blob/main/README-zh_CN.md"
            >《提问的智慧》</a
          >，能基于此与本团队反馈问题
        </p>
      </div>
    </div>
    <div class="flex-1 mb-4" />
    <div class="grid gap-4 grid-cols-2 mt-2">
      <button
        @click="dialogClose"
        class="btn btn-block btn-outline btn-error disabled:text-base-content/90"
        :disabled="isLoading"
      >
        <span v-if="isLoading" class="loading loading-bars" />
        关闭
      </button>
      <button
        class="btn btn-block btn-info disabled:text-base-content/90"
        :disabled="isLoading"
        @click="handleCreateBtnOnClick"
      >
        <span v-if="isLoading" class="loading loading-bars" />
        明日方舟，启动
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import type { GameAccountForm } from "@/shared/types/api";
import { buildGameAccount } from "@/utils/account";
import { useLoading } from "@/shared/composables/useLoading";
import { useCaptcha } from "@/services/captchaActions";
import { setMsg } from "@/utils/toast";
import { useGamesStore } from "@/stores/useGamesStore";
import type { DialogComponentProps } from "@/shared/components/dialog/dialog";
import { Type } from "@/constants/ui";
import { GAME_PLATFORM_CODE } from "@/constants/game";
import { API_RESPONSE_CODE } from "@/constants/api";
import ServerSelector from "@/components/game/ServerSelector.vue";

interface Props extends DialogComponentProps {
  loginFunc?: (account: string) => Promise<void>;
}

const props = defineProps<Props>();
const { dialogClose, loginFunc } = props;
const gamesStore = useGamesStore();
const { isLoading } = useLoading();
const captcha = useCaptcha();

const form = ref<GameAccountForm>({
  account: "",
  password: "",
  platform: GAME_PLATFORM_CODE.OFFICIAL,
});

const handleCreateBtnOnClick = async () => {
  if (isLoading.value) return;
  try {
    isLoading.value = true;
    await createGame();
    await gamesStore.queryGameList();
    setMsg("创建账号成功。开始自动登录", Type.Success);
    if (loginFunc) {
      await loginFunc(buildGameAccount(form.value.account, form.value.platform));
      await gamesStore.queryGameList();
    }
    dialogClose();
  } catch (error) {
    console.error(error);
  } finally {
    isLoading.value = false;
  }
};

const createGame = async () => {
  if (!gamesStore.canCreateGame) {
    setMsg("托管数量已达上限", Type.Warning);
    throw new Error("game slot limit reached");
  }
  if (form.value.account.trim() === "" || form.value.password === "") {
    setMsg("请填写登录信息", Type.Warning);
    throw new Error("account or password is empty");
  }
  setMsg("叠甲成功，提交托管信息中", Type.Success);
  const createGameResp = await captcha.createGame(form.value);
  if (createGameResp.code === API_RESPONSE_CODE.SUCCESS) {
    return createGameResp;
  }
  setMsg(createGameResp.message, Type.Error);
  throw new Error(createGameResp.message);
};
</script>
