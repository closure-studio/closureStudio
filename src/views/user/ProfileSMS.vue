<template>
  <div v-if="!isGameListCompletedInit" class="flex justify-center w-full">
    <span className="loading loading-ring loading-lg"></span>
    <span className="loading loading-ring loading-lg"></span>
    <span className="loading loading-ring loading-lg"></span>
  </div>
  <div v-if="isGameListCompletedInit">
    <div v-if="!user.isVerify" class="flex items-center space-x-4">
      <label class="form-control w-full max-w-xs">
        <div class="label">
          <span class="label-text">请输入【{{ phone }}】收到的验证码</span>
        </div>
        <input type="text" placeholder="验证码" class="input input-bordered max-w-xs" v-model="smsCode" />
      </label>
      <button class="btn btn-outline btn-error mt-auto" @click="handleCloseBtnOnClick">
        取消
      </button>
      <button class="btn btn-info mt-auto" @click="handleSubmitBtnOnClick">
        确认
      </button>
    </div>
    <div v-if="user.isVerify" class="flex items-center space-x-4">
      太棒了，你已完成身份验证！绑定手机号是: {{ phone }}
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue';
import { Type } from '../../components/toast/enum';
import { Auth_Verify } from '../../plugins/axios';
import { setMsg } from '../../plugins/common';
import { myState } from '../../store/games/myGames';
import { getSMSSendPhone } from '../../store/games/quota';
import { userStore } from '../../store/user';

const smsCode = ref("");

const user = userStore();
const phone = computed(() => getSMSSendPhone());
const isGameListCompletedInit = computed(() => myState.isGameListCompletedInit);
const handleCloseBtnOnClick = () => {
  smsCode.value = "";
}

const handleSubmitBtnOnClick = async () => {
  if (smsCode.value === "") {
    setMsg("请输入验证码", Type.Warning);
    return;
  }
  try {
    const authResp = await Auth_Verify(smsCode.value);
    if (authResp.code === 1) {
      setMsg("认证成功,请重新登录", Type.Success);
      user.logout();
      window.location.reload();
      return;
    }
    if (authResp.code !== 1) {
      setMsg("验证码错误", Type.Warning);
      return;
    }
  } catch (error) {
    console.error(error);

  }
};

</script>