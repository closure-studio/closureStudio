<template>
  <div class="bg-base-100 mx-4 px-6 py-4 shadow-lg max-w-md rounded-lg blog">
    <h2>你知道吗？</h2>
    <p>
      我再声明一次,
      登录过程持续5-10分钟。中间会出现鹰角网络的人机验证码。你必须打开网页并在1分钟内完成人机验证。
    </p>
    <button @click="dialogClose()" class="btn btn-info btn-block mb-3">我会耐心等待</button>
  </div>
</template>
<script lang="ts" setup>
import type { DialogComponentProps } from "@/shared/components/dialog/dialog";

const props = withDefaults(defineProps<DialogComponentProps>(), {
  dialogClose: () => {},
});
const { dialogClose } = props;
</script>
