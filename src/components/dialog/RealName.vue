<template>
  <div class="modal-box">
    <div class="text-3xl text-info font-bold text-center">归属验证</div>
    <div class="s-combo mb-6 mt-4">
      <input class="s-input peer focus:ring-info" v-model="smsCode" />
      <label class="s-label peer-focus:text-info">请输入收到的验证码</label>
    </div>
    <button class="btn btn-block btn-info mt-2" @click="handleCloseBtnOnClick">
      取消
    </button>
    <button class="btn btn-block btn-info mt-2" @click="handleSubmitBtnOnClick">
      确认
    </button>
  </div>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import { Auth_Refresh, Auth_Verify } from "../../plugins/axios/axios";
import { setMsg } from "../../plugins/common";
import { Type } from "../toast/enum";
import { userStore } from "../../store/user";
import { DialogComponentProps } from "../../plugins/dialog/dialog";

const props = withDefaults(defineProps<DialogComponentProps>(), {
  dialogClose: () => { }
});
const { dialogClose } = props;

const smsCode = ref("");
const user = userStore();

const handleCloseBtnOnClick = () => {
  dialogClose();
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
      dialogClose();
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