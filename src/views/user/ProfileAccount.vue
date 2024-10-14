<template>
  <form @submit.prevent="handleUpdatePasswordBtnOnClick" class="p-2 grid grid-cols-2 gap-4">
    <div class="s-combo">
      <input disabled class="s-input peer focus:ring-info" :placeholder="user.info.email">
      <label class="s-label peer-focus:text-info">可露希尔通行证 / 账号邮箱</label>
    </div>
    <div class="s-combo">
      <input disabled class="s-input peer focus:ring-info" :placeholder="createdAt">
      <label class="s-label peer-focus:text-info">注册时间</label>
    </div>
    <div class="s-combo col-span-2">
      <input class="s-input peer focus:ring-info" v-model="currentPassword" type="password" required>
      <label class="s-label peer-focus:text-info">当前密码</label>
    </div>
    <div class="s-combo">
      <input class="s-input peer focus:ring-info" v-model="newPassword" type="password" required>
      <label class="s-label peer-focus:text-info">新密码（如需修改）</label>
    </div>
    <div class="s-combo">
      <input class="s-input peer focus:ring-info" v-model="repeatNewPassword" type="password" required>
      <label class="s-label peer-focus:text-info">重复新密码</label>
    </div>
    <button type="submit" class="btn btn-info btn-sm btn-block col-span-2 mt-2" :disabled="isLoading">
      <span v-if="isLoading" class="loading loading-spinner"></span>
      修改密码
    </button>
  </form>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue';
import { userStore } from '../../store/user';
import { setMsg } from '../../plugins/common';
import { Type } from '../../components/toast/enum';

const user = userStore();
const createdAt = computed(() => new Date(user.info.exp * 1000).toLocaleString());
// current password
const currentPassword = ref("");
const newPassword = ref("");
const repeatNewPassword = ref("");
const isLoading = ref(false);

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
    // sleep 2 seconds
    await new Promise((resolve) => setTimeout(resolve, 2000));
    // const updatePasswordResp = await UpdatePassword(currentPassword.value, newPassword.value);
    // if (updatePasswordResp.code === 1) {
    //   setMsg("密码修改成功", Type.Success);
    //   user.logout();
    // }
    setMsg("该功能暂未开放", Type.Error);
  } catch (e) {
    setMsg("密码修改失败", Type.Error);
  } finally {
    isLoading.value = false;
  }
}

</script>