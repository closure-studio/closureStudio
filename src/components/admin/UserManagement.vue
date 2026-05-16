<template>
  <div class="user-management p-2">
    <section class="space-y-4">
      <div>
        <h2 class="text-base font-bold">用户管理</h2>
        <p class="text-xs text-base-content/55">搜索用户并管理该用户权限</p>
      </div>

      <form class="flex flex-col gap-2 md:flex-row" @submit.prevent="handleSearch">
        <input
          v-model="searchValue"
          class="input input-bordered min-w-0 flex-1 border-base-300/55 bg-base-100"
          :disabled="isSearching"
          placeholder="输入邮箱、UUID、QQ 或手机号"
        />
        <button class="btn btn-info md:w-28" :disabled="isSearching">
          <span v-if="isSearching" class="loading loading-bars loading-sm"></span>
          <span v-else>搜索用户</span>
        </button>
      </form>
    </section>

    <section v-if="selectedUser" class="mt-5 space-y-5">
      <div class="user-info-grid rounded-lg p-4">
        <div v-for="item in userFields" :key="item.label" class="min-w-0">
          <div class="text-xs text-base-content/50">{{ item.label }}</div>
          <div class="mt-1 break-all text-sm font-medium">{{ item.value || "-" }}</div>
        </div>
      </div>

      <div class="divider !mb-2 !mt-7">权限</div>

      <section class="space-y-4">
        <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
          <ToggleInfoCard
            v-for="permission in permissionItems"
            :key="permission.value"
            :title="permission.label"
            :description="permission.description"
            :active="hasPermissionBit(draftPermission, permission.value)"
            :clickable="canEditPermission"
            :disabled="!canEditPermission || isUpdating"
            @update:active="togglePermission(permission.value)"
          />
        </div>

        <button
          v-if="canEditPermission"
          class="btn btn-info btn-block"
          :disabled="isUpdating"
          @click="handleUpdatePermission"
        >
          <span v-if="isUpdating" class="loading loading-bars loading-sm"></span>
          <span v-else>更新权限</span>
        </button>
      </section>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { PERMISSION_DETAILS, Permission } from "@/constants/auth";
import { USER_MANAGEMENT_MESSAGES } from "@/constants/systemAdmin";
import type { ApiUserUser } from "@/shared/types/api";
import ToggleInfoCard from "@/shared/components/ui/ToggleInfoCard.vue";
import {
  canUpdateUserPermission,
  saveUserPermission,
  searchFirstAdminUser,
} from "@/services/userPermissionAdmin";
import { useUserStore } from "@/stores/useUserStore";
import { Type } from "@/constants/ui";
import { setMsg } from "@/utils/toast";
import { formatTime, maskSensitiveIdentifier } from "@/utils/format";
import { addPermission, getPermissionValues, removePermission } from "@/utils/permission";

const userStore = useUserStore();

const searchValue = ref("");
const selectedUser = ref<ApiUserUser | null>(null);
const originalPermission = ref(0);
const draftPermission = ref(0);
const isSearching = ref(false);
const isUpdating = ref(false);

const permissionValues = getPermissionValues();
const hiddenPermissionBlocks = new Set<Permission>([
  Permission.TicketCreate,
  Permission.TicketUpdate,
]);
const permissionItems = permissionValues
  .filter((value) => !hiddenPermissionBlocks.has(value))
  .map((value) => ({
    value,
    ...PERMISSION_DETAILS[value],
  }));

const canEditPermission = computed(() => canUpdateUserPermission(userStore.info.permission));

const displaySensitiveValue = (value: string) =>
  canEditPermission.value ? value : maskSensitiveIdentifier(value);

const userFields = computed(() => {
  if (!selectedUser.value) return [];
  return [
    { label: "邮箱", value: selectedUser.value.UserEmail },
    { label: "QQ", value: displaySensitiveValue(selectedUser.value.QQ) },
    { label: "手机号", value: displaySensitiveValue(selectedUser.value.Phone) },
    { label: "权限值", value: String(draftPermission.value) },
    { label: "创建时间", value: formatTime(selectedUser.value.CreatedTs, "yyyy-MM-dd HH:mm") },
    { label: "更新时间", value: formatTime(selectedUser.value.UpdateTs, "yyyy-MM-dd HH:mm") },
  ];
});

const hasPermissionBit = (userPermission: number, permission: number) =>
  (userPermission & permission) === permission;

const resetSelectedUser = () => {
  selectedUser.value = null;
  originalPermission.value = 0;
  draftPermission.value = 0;
};

const handleSearch = async () => {
  const keyword = searchValue.value.trim();
  if (!keyword) {
    setMsg(USER_MANAGEMENT_MESSAGES.SEARCH_EMPTY, Type.Warning);
    return;
  }
  if (isSearching.value) return;

  isSearching.value = true;
  try {
    const user = await searchFirstAdminUser(keyword);
    if (!user) {
      resetSelectedUser();
      setMsg(USER_MANAGEMENT_MESSAGES.USER_NOT_FOUND, Type.Info);
      return;
    }

    selectedUser.value = user;
    originalPermission.value = user.Permission;
    draftPermission.value = user.Permission;
  } catch (error) {
    const message = error instanceof Error ? error.message : USER_MANAGEMENT_MESSAGES.SEARCH_FAILED;
    resetSelectedUser();
    setMsg(message, Type.Error);
  } finally {
    isSearching.value = false;
  }
};

const togglePermission = (permission: number) => {
  if (!canEditPermission.value || isUpdating.value) return;
  draftPermission.value = hasPermissionBit(draftPermission.value, permission)
    ? removePermission(draftPermission.value, permission)
    : addPermission(draftPermission.value, permission);
};

const handleUpdatePermission = async () => {
  if (!selectedUser.value || isUpdating.value) return;

  isUpdating.value = true;
  try {
    const result = await saveUserPermission({
      operatorPermission: userStore.info.permission,
      uuid: selectedUser.value.UUID,
      originalPermission: originalPermission.value,
      draftPermission: draftPermission.value,
    });
    if (!result.changed) {
      setMsg(USER_MANAGEMENT_MESSAGES.NO_CHANGES, Type.Info);
      return;
    }

    originalPermission.value = result.permission;
    selectedUser.value = {
      ...selectedUser.value,
      Permission: result.permission,
      UpdateTs: Math.floor(Date.now() / 1000),
    };
    setMsg(USER_MANAGEMENT_MESSAGES.UPDATE_SUCCESS, Type.Success);
  } catch (error) {
    const message = error instanceof Error ? error.message : USER_MANAGEMENT_MESSAGES.UPDATE_FAILED;
    setMsg(message, Type.Error);
  } finally {
    isUpdating.value = false;
  }
};
</script>

<style scoped>
.user-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
  gap: 0.9rem;
  background:
    linear-gradient(
      180deg,
      color-mix(in oklab, var(--color-base-300) 52%, var(--color-base-100) 48%),
      color-mix(in oklab, var(--color-base-300) 38%, var(--color-base-100) 62%)
    );
  box-shadow:
    inset 0 1px 0 color-mix(in oklab, var(--color-base-content) 7%, transparent),
    0 0 0 1px color-mix(in oklab, var(--color-base-content) 8%, transparent),
    0 0.35rem 0.9rem color-mix(in oklab, black 16%, transparent);
}
</style>
