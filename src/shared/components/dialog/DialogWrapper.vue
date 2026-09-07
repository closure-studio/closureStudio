<template>
  <input type="checkbox" class="modal-toggle" v-model="isCheck" />
  <div class="modal" role="dialog">
    <component
      :is="component"
      class="animate__animated animate__pulse"
      v-bind="componentProps"
      :dialogClose="dialogClose"
    />
  </div>
</template>

<script lang="ts" setup>
import { nextTick, onMounted, ref } from "vue";
import "animate.css";
interface Props {
  component: object | null; // 传入的子组件
  dialogClose: () => void;
  componentProps: Record<string, unknown>; // 新增：接收传入的组件 props
}
const isCheck = ref(false);

withDefaults(defineProps<Props>(), {
  component: null,
  dialogClose: () => {},
  componentProps: () => ({}),
});

onMounted(async () => {
  await nextTick(); // 确保DOM已经更新
  isCheck.value = true;
});
</script>
