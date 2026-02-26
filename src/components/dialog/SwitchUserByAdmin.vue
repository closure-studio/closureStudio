<template>
  <div class="bg-base-100 mx-4 px-6 py-4 shadow-lg max-w-md rounded-lg blog">
    <h2>用户切换</h2>
    <p>确定切换到【{{ uuid }}】用户吗?</p>

    <div class="grid gap-4 grid-cols-2 mt-2">
      <button
        class="btn btn-outline btn-sm btn-block btn-info"
        :disabled="isLoading"
        @click.stop="handleCloseBtnOnClick()"
      >
        <span v-if="isLoading" className="loading loading-spinner"></span>
        取消
      </button>
      <button
        class="btn btn-outline btn-sm btn-block btn-primary"
        @click="handleConfirmBtnOnClick()"
        :disabled="isLoading"
      >
        <span v-if="isLoading" className="loading loading-spinner"></span>
        确定
      </button>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { useLoading } from "@/shared/composables/useLoading";
import { setMsg } from "@/shared/utils/toast";
import type { DialogComponentProps } from "@/shared/components/dialog/dialog";
import { Type } from "@/shared/components/toast/enum";

interface Props extends DialogComponentProps {
  uuid: string;
  switchFunc: (account: string) => Promise<void>;
}

const props = defineProps<Props>();
const { uuid, switchFunc, dialogClose } = props;
const { isLoading } = useLoading();

const handleCloseBtnOnClick = () => {
  dialogClose();
};
const handleConfirmBtnOnClick = async () => {
  if (isLoading.value) return;
  try {
    isLoading.value = true;
    await switchFunc(uuid);
  } catch (error) {
    setMsg(error, Type.Error);
  } finally {
    isLoading.value = false;
    dialogClose();
  }
};
</script>
