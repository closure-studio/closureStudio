<template>
  <form @submit.prevent="handleUpdatePasswordBtnOnClick" class="p-2 grid grid-cols-2 gap-4">
    <div class="s-combo">
      <input disabled class="s-input peer focus:ring-info" :placeholder="user.info.email" />
      <label class="s-label peer-focus:text-info">可露希尔通行证 / 账号邮箱</label>
    </div>
    <div class="s-combo">
      <input disabled class="s-input peer focus:ring-info" :placeholder="createdAt" />
      <label class="s-label peer-focus:text-info">注册时间</label>
    </div>
    <div class="s-combo col-span-2">
      <input
        class="s-input peer focus:ring-info"
        v-model="currentPassword"
        type="password"
        required
      />
      <label class="s-label peer-focus:text-info">当前密码</label>
    </div>
    <div class="s-combo">
      <input class="s-input peer focus:ring-info" v-model="newPassword" type="password" required />
      <label class="s-label peer-focus:text-info">新密码（如需修改）</label>
    </div>
    <div class="s-combo">
      <input
        class="s-input peer focus:ring-info"
        v-model="repeatNewPassword"
        type="password"
        required
      />
      <label class="s-label peer-focus:text-info">重复新密码</label>
    </div>
    <button
      type="submit"
      class="btn btn-info btn-sm btn-block col-span-2 mt-2"
      :disabled="isLoading"
    >
      <span v-if="isLoading" class="loading loading-spinner"></span>
      修改密码
    </button>
  </form>

  <form @submit.prevent="handleDeleteAccountBtnOnClick" class="p-2 grid grid-cols-2 gap-4">
    <button
      type="submit"
      class="btn btn-error btn-outline btn-sm btn-block col-span-2 mt-2"
      :disabled="isLoading"
    >
      <span v-if="isLoading" class="loading loading-spinner"></span>
      注销账号
    </button>
  </form>
</template>
<script setup lang="ts">
import { computed, ref } from "vue";
import DeleteAccount from "../../components/dialog/DeleteAccount.vue";
import { Type } from "@/shared/components/toast/enum";
import { setMsg } from "@/shared/utils/toast";
import { useLoading } from "@/shared/composables/useLoading";
import showDialog from "../../plugins/dialog/dialog";
import { useUserStore } from "@/stores/useUserStore";
import authClient from "@/shared/services/authClient";

const user = useUserStore();
const createdAt = computed(() => new Date(user.info.createdAt * 1000).toLocaleString());
// current password
const currentPassword = ref("");
const newPassword = ref("");
const repeatNewPassword = ref("");
const { isLoading } = useLoading();

const handleUpdatePasswordBtnOnClick = async () => {
  if (currentPassword.value === "") {
    setMsg("请输入当前密码", Type.Warning);
    return;
  }
  if (newPassword.value === "") {
    setMsg("请输入新密码", Type.Warning);
    return;
  }
  if (repeatNewPassword.value === "") {
    setMsg("请重复新密码", Type.Warning);
    return;
  }
  if (newPassword.value !== repeatNewPassword.value) {
    setMsg("两次输入的新密码不一致", Type.Warning);
    return;
  }
  if (isLoading.value) {
    return;
  }
  try {
    isLoading.value = true;
    const updatePasswordResp = await authClient.updatePasswd({
      email: user.info.email,
      currentPasswd: currentPassword.value,
      newPasswd: newPassword.value,
    });
    if (updatePasswordResp.code === 1) {
      setMsg("密码修改成功，请重新登录", Type.Success);
      user.logout();
      window.location.reload();
    }
  } catch (e) {
    setMsg("密码修改失败", Type.Error);
  } finally {
    isLoading.value = false;
  }
};

const deleteFunc = async () => {
  try {
    // sleep 5s to prevent user from clicking the button too fast
    await new Promise((resolve) => setTimeout(resolve, 5000));
    setMsg("未实装", Type.Success);
    return true;
  } catch (error) {
    return false;
  }
};

const handleDeleteAccountBtnOnClick = async () => {
  if (isLoading.value) {
    return;
  }
  if (user.isAdmin) {
    setMsg("管理员账号无法注销", Type.Warning);
    return;
  }
  showDialog(DeleteAccount, { deleteFunc: deleteFunc });
};
</script>
