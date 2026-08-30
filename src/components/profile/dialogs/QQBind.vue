<template>
  <div
    class="bg-base-100 w-96 mx-4 px-6 py-4 shadow-lg max-w-md rounded-lg blog"
  >
    <h2>QQ 绑定</h2>
    <div class="divider divider-warning"></div>
    <div v-if="status === 'loading'" class="flex justify-center py-6">
      <span v-if="isLoading" class="loading loading-bars" />
    </div>
    <div v-else-if="status === 'unbound'">
      <div
        role="alert"
        class="rounded border-s-4 border-warning bg-warning/10 p-4 space-y-2 my-4"
      >
        请点击下方QQ进行复制(包括verifyCode), 并发送到QQ官方群组 1345795,
        450555868 中。
      </div>
      <input
        v-model="qqCode"
        class="input join-item input-sm w-full max-w-xs"
        readonly
        @click="selectAll"
      />
      <div>
        <div class="flex justify-center p-2 mb-3">
          <a
            target="_blank"
            @click="copyQQCodeAndOpenLink"
            href="https://qm.qq.com/cgi-bin/qm/qr?k=YNU1S-_hVFD89w3cj8-ewkPFXXSiBRbY&jump_from=webapi&authKey=BU70QS4whXzJIi62KWNd9h8HZB5Vl2FSnjlrqYYf08RL5tbxnZhf2NMr9uLJNoYu"
          >
            <Icon icon="basil:qq-outline" width="48" height="48" />
          </a>
          <a
            target="_blank"
            @click="copyQQCodeAndOpenLink"
            href="https://qm.qq.com/cgi-bin/qm/qr?k=y4He1C5OYZQPzojywTh_wlCywlfR5r-M&jump_from=webapi&authKey=13UJLWzqSVhwTXI9BPksnM7c9eogNcIdX/TC3xo6ShTAOJPgU2vlFR2rt3DxhJ2d"
          >
            <Icon icon="basil:qq-outline" width="48" height="48" />
          </a>
        </div>
      </div>
    </div>
    <div
      v-else-if="status === 'bound'"
      role="alert"
      class="alert alert-success my-4"
    >
      QQ 绑定已完成
    </div>
    <div v-else role="alert" class="alert alert-warning my-4">
      <span>暂时无法获取 QQ 绑定状态</span>
      <button
        type="button"
        class="btn btn-sm"
        :disabled="isLoading"
        @click="getQQBindCode"
      >
        重试
      </button>
    </div>
    <button
      type="button"
      @click="dialogClose"
      class="btn btn-info btn-block mb-3 btn-sm"
    >
      关闭
    </button>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from "vue";
import { setMsg } from "@/utils/toast";
import { sleep } from "@/utils/misc";
import { Type } from "@/constants/ui";
import { Icon } from "@iconify/vue";
import type { DialogComponentProps } from "@/shared/components/dialog/dialog";
import { fetchQQBindingState, QQ_BINDING_STATUS } from "@/services/qqBinding";

interface Props extends DialogComponentProps {
  initialVerificationCode?: string;
  onBound?: () => void;
}

const props = defineProps<Props>();
const qqCode = ref(props.initialVerificationCode ?? "");
const status = ref<"loading" | "unbound" | "bound" | "error">(
  props.initialVerificationCode ? "unbound" : "loading",
);
const isLoading = ref(!props.initialVerificationCode);
let intervalId: number | null = null;
let isRequestInFlight = false;
let hasNotifiedBound = false;

const stopPolling = () => {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
};

onMounted(() => {
  if (!props.initialVerificationCode) {
    void getQQBindCode();
  }
  intervalId = window.setInterval(getQQBindCode, 5000);
});

onUnmounted(() => {
  stopPolling();
});

const copyQQCodeAndOpenLink = async (event: MouseEvent) => {
  event.preventDefault();
  const target = event.currentTarget as HTMLAnchorElement;
  const didCopy = await copyQQCode();
  if (!didCopy) return;
  await sleep(2000);
  window.open(target.href, "_blank", "noopener,noreferrer");
};

const selectAll = (event: Event) => {
  const target = event.target as HTMLInputElement;
  target.select();
};

const copyQQCode = async () => {
  if (!qqCode.value) return false;
  try {
    await navigator.clipboard.writeText(qqCode.value);
    setMsg("绑定代码已复制到剪贴板", Type.Success);
    await sleep(500);
    setMsg("准备打开QQ群组", Type.Success);
    return true;
  } catch {
    setMsg("复制失败", Type.Warning);
    return false;
  }
};

const getQQBindCode = async () => {
  if (isRequestInFlight) return;
  isRequestInFlight = true;
  isLoading.value = true;
  try {
    const state = await fetchQQBindingState();
    if (state.status === QQ_BINDING_STATUS.UNBOUND) {
      qqCode.value = state.verificationCode;
      status.value = "unbound";
      return;
    }

    status.value = "bound";
    stopPolling();
    if (!hasNotifiedBound) {
      hasNotifiedBound = true;
      props.onBound?.();
    }
  } catch {
    status.value = "error";
  } finally {
    isLoading.value = false;
    isRequestInFlight = false;
  }
};
</script>
