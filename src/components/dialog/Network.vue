<template>
  <div class="bg-base-100 mx-4 px-6 py-4 shadow-lg max-w-md rounded-lg blog">
    <h2>平台打烊中</h2>
    <p>可露希尔大卖场积极维护中，欢迎明天再来！</p>
    <button @click="handleCloseBtnOnClick" class="btn btn-info btn-block mb-3">助力可露希尔砍一刀</button>
  </div>
</template>
<script lang="ts" setup>
import { watch, ref } from "vue";
import { userStore } from "../../store/user";
import { DialogComponentProps } from "../../plugins/dialog/dialog";
import { myState } from "../../store/games/myGames";
const props = defineProps<DialogComponentProps>();
const { dialogClose } = props;
const closeAnn = ref()
const user = userStore()

const handleCloseBtnOnClick = () => {
  dialogClose();
}

watch(
  () => myState.config.isUnderMaintenance,
  (v) => {
    if (v && !user.isAdmin) closeAnn.value.showModal()
  }
)
</script>
