<template>
  <div class="bg-base-100 mx-4 px-6 py-4 shadow-lg max-w-md rounded-lg blog">
    <h2>你知道吗？</h2>
    <p>{{ message }}</p>
    <button @click="iknow" class="btn btn-info btn-block mb-3">我知道了</button>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, ref } from "vue";
import { YOU_MAY_KNOW_MESSAGES } from "@/constants/ui";
import { selectRandomElement } from "@/shared/utils/misc";
import type { DialogComponentProps } from "@/shared/components/dialog/dialog";

const props = defineProps<DialogComponentProps>();
const { dialogClose } = props;
const message = ref("");

onMounted(() => {
  const element = selectRandomElement<string>(YOU_MAY_KNOW_MESSAGES);
  if (element) message.value = element;
});

const iknow = () => {
  dialogClose();
};
</script>
