<template>
  <div class="bg-base-100 mx-4 px-6 py-4 shadow-lg max-w-md rounded-lg blog">
    <h2>用户注销</h2>
    <p>确定注销【{{ email }}】用户吗?</p>
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
import { DialogComponentProps } from "../../plugins/dialog/dialog";
import { Type } from "@/shared/components/toast/enum";
import { userStore } from "../../store/user";

interface Props extends DialogComponentProps {
  deleteFunc: () => Promise<boolean>;
}
const props = defineProps<Props>();
const { deleteFunc, dialogClose } = props;
const { isLoading } = useLoading();
const user = userStore();
const email = user.info.email;

const handleCloseBtnOnClick = () => {
  dialogClose();
};
const handleConfirmBtnOnClick = async () => {
  if (isLoading.value) return;
  try {
    isLoading.value = true;
    const resp = await deleteFunc();
    if (resp) {
      setMsg("注销成功", Type.Success);
      user.logout();
      window.location.reload();
      return;
    }
    setMsg("注销失败", Type.Error);
  } catch (error) {
    setMsg(error, Type.Error);
  } finally {
    isLoading.value = false;
    dialogClose();
  }
};
</script>
