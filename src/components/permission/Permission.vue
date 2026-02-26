<template>
  <div class="w-full">
    <div class="flex flex-wrap">
      <div v-for="permission in permissionValues" :key="permission">
        <button
          @click="togglePermission(Number(permission))"
          :class="`btn btn-xs m-1 ${
            hasPermission(myPermission, Number(permission))
              ? 'bg-warning text-black'
              : 'btn-outline'
          }`"
        >
          {{ getPermissionName(Number(permission)) }}
        </button>
      </div>
      <button @click="handleUpdateBtnOnClick" :class="`btn btn-xs m-1 btn-info`">
        <span v-if="isUploading" class="loading loading-bars loading-xs"></span>
        <span v-if="!isUploading"> {{ "更新" }}</span>
      </button>
    </div>
  </div>
</template>
<script setup lang="ts">
interface Props {
  userPermission: number;
  uuid: string;
}
import { ref, watch } from "vue";
import {
  getPermissionName,
  Permission,
  hasPermission,
  addPermission,
  removePermission,
} from "../../plugins/permission/permission";
import { setMsg } from "@/shared/utils/toast";
import { Type } from "@/shared/components/toast/enum";
import authClient from "@/shared/services/authClient";

const props = withDefaults(defineProps<Props>(), {
  userPermission: 0,
  uuid: "",
});
const myPermission = ref(0);
const isUploading = ref(false);
const permissionValues = Object.values(Permission).filter((value) => typeof value === "number");

watch(
  () => props.userPermission,
  (newVal) => {
    myPermission.value = newVal;
  },
  { immediate: true, deep: true }
);

const togglePermission = (permission: number) => {
  if (hasPermission(myPermission.value, permission)) {
    myPermission.value = removePermission(myPermission.value, permission);
  } else {
    myPermission.value = addPermission(myPermission.value, permission);
  }
};

const handleUpdateBtnOnClick = async () => {
  try {
    if (isUploading.value) {
      return;
    }
    if (props.uuid === "") {
      setMsg("用户ID不能为空", Type.Warning);
      return;
    }
    isUploading.value = true;
    const resp = await authClient.updateUserPermission(props.uuid, myPermission.value);
    if (resp.code === 0) {
      setMsg("更新成功", Type.Success);
    } else {
      setMsg(resp.message, Type.Error);
    }
  } catch (error) {
    // log error
    // if error is Error type
    if (error instanceof Error) {
      console.error(error.message);
      setMsg(error.message, Type.Error);
    }
  } finally {
    isUploading.value = false;
  }
};
</script>
