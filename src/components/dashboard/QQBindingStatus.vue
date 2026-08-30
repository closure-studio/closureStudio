<template>
  <div
    v-if="isVisible"
    class="flex flex-wrap items-center justify-between gap-3 pb-3"
  >
    <p class="m-0">绑定 QQ，更方便管理托管账号。</p>
    <button
      type="button"
      class="btn btn-info btn-sm"
      @click="openQQBindingDialog"
    >
      <Icon icon="basil:qq-outline" width="20" height="20" />
      绑定 QQ
    </button>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { Icon } from "@iconify/vue";
import QQBind from "@/components/profile/dialogs/QQBind.vue";
import showDialog from "@/shared/components/dialog/dialog";
import { fetchQQBindingState, QQ_BINDING_STATUS } from "@/services/qqBinding";

const isVisible = ref(false);
const initialVerificationCode = ref<string>();

const loadBindingState = async () => {
  try {
    const state = await fetchQQBindingState();
    isVisible.value = state.status === QQ_BINDING_STATUS.UNBOUND;
    initialVerificationCode.value = state.verificationCode ?? undefined;
  } catch {
    // Keep the recovery path available when the initial status request fails.
    isVisible.value = true;
    initialVerificationCode.value = undefined;
  }
};

const handleBound = () => {
  isVisible.value = false;
  initialVerificationCode.value = undefined;
};

const openQQBindingDialog = () => {
  showDialog(QQBind, {
    initialVerificationCode: initialVerificationCode.value,
    onBound: handleBound,
  });
};

onMounted(() => {
  void loadBindingState();
});
</script>
