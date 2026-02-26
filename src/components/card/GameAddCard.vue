<template>
  <label
    for="addModel"
    class="hover:scale-105 hover:shadow-lg hover:bg-info/10 active:bg-info/10 active:scale-95 duration-300 shadow-lg rounded-2xl p-3 s-pro flex justify-center min-h-[8rem]"
  >
    <div class="text-center flex justify-center flex-col">
      <div class="text-4xl font-bold">+</div>
      <div class="text-xl text-info font-bold">{{ message }}</div>
    </div>
  </label>
</template>
<script setup lang="ts">
import { computed, ref } from "vue";
import type { RegistrySlot, RegistryUserInfo } from "@/shared/types/api";
import { userStore } from "../../store/user";
import { allowGameCreate } from "../../store/games/quota";
interface Props {
  slot: RegistrySlot | undefined;
  userQuota: RegistryUserInfo | undefined;
}
const props = withDefaults(defineProps<Props>(), {
  slot: undefined,
  userQuota: undefined,
});
const user = userStore();
const isLocked = ref(false);

const message = computed(() => {
  if (props.slot === undefined || props.userQuota === undefined) return "请稍后";
  const response = allowGameCreate(props.slot, props.userQuota, user.isVerify);
  isLocked.value = response.isLocked;
  return response.message;
});
</script>
