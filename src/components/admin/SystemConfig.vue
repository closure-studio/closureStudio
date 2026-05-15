<template>
  <div class="system-config p-2">
    <div v-if="isLoadingConfig" class="flex min-h-64 items-center justify-center">
      <span class="loading loading-bars loading-lg text-info"></span>
    </div>

    <div v-else-if="draftConfig" class="space-y-5">
      <section class="space-y-5">
        <div>
          <h2 class="text-base font-bold">公告广播</h2>
          <p class="text-xs text-base-content/55">公告更新后会通知默认 QQ 群和自定义 QQ 群。</p>
        </div>
        <textarea
          v-model="draftConfig.announcement"
          class="admin-announcement-field textarea textarea-bordered min-h-36 w-full resize-y border-base-300/55 text-sm leading-6 focus:border-info/60"
          :disabled="isPublishing"
          placeholder="请输入系统公告"
        ></textarea>
      </section>

      <div class="divider mb-3 mt-0">权限开关</div>

      <section class="grid grid-cols-1 gap-3 md:grid-cols-2">
        <label
          v-for="item in serviceSwitches"
          :key="item.key"
          class="admin-switch-card flex min-h-24 cursor-pointer items-center justify-between gap-4 rounded-lg px-4 py-3 transition-colors"
        >
          <span class="min-w-0">
            <span class="block text-sm font-semibold">{{ item.title }}</span>
            <span class="mt-1 block text-xs leading-5 text-base-content/60">
              {{ item.description }}
            </span>
          </span>
          <input
            v-model="draftConfig[item.key]"
            type="checkbox"
            class="toggle toggle-sm toggle-info shrink-0"
            :disabled="isPublishing"
          />
        </label>
      </section>

      <div class="divider mb-3 mt-0">QQ 群通知</div>

      <section class="space-y-3">
        <div class="flex w-full flex-col gap-2 rounded-box bg-base-100">
          <div
            v-for="group in systemAdminStore.defaultQQGroups"
            :key="group"
            class="block rounded-lg bg-[#251E15] px-3 py-3 transition-colors"
          >
            <div class="flex items-center justify-between gap-3">
              <div class="flex min-w-0 flex-1 items-center gap-3">
                <span class="h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
                <div class="min-w-0">
                  <p class="truncate text-sm font-semibold">{{ group }}</p>
                </div>
              </div>
              <span class="shrink-0 text-xs font-medium text-base-content/60">默认通知</span>
            </div>
          </div>
          <button
            v-for="(group, index) in systemAdminStore.customQQGroups"
            :key="group"
            type="button"
            class="block w-full rounded-lg px-3 py-3 text-left transition-colors hover:bg-base-200/20"
            :disabled="isPublishing"
            @click="systemAdminStore.removeCustomQQGroup(group)"
          >
            <div class="flex items-center justify-between gap-3">
              <div class="flex min-w-0 flex-1 items-center gap-3">
                <span class="h-2.5 w-2.5 shrink-0 rounded-full bg-base-300" />
                <div class="min-w-0">
                  <p class="truncate text-sm font-semibold">{{ group }}</p>
                </div>
              </div>
              <span class="shrink-0 text-xs font-medium text-base-content/60">点击移除</span>
            </div>
            <div
              v-if="index < systemAdminStore.customQQGroups.length - 1"
              class="divider my-0"
            />
          </button>
        </div>
      </section>

      <button class="btn btn-info btn-block" :disabled="isPublishing" @click="handlePublish">
        <span v-if="isPublishing" class="loading loading-bars loading-sm"></span>
        发布
      </button>
    </div>

    <div v-else class="py-10 text-center">
      <button class="btn btn-outline btn-info btn-sm" :disabled="isLoadingConfig" @click="loadConfig">
        重新加载
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import type { ApiSystemConfigEditable } from "@/shared/types/api";
import {
  buildApiSystemConfigUpdate,
  loadApiSystemConfigEditable,
  saveApiSystemConfigEditable,
} from "@/services/systemConfigAdmin";
import { SYSTEM_CONFIG_MESSAGES } from "@/constants/systemAdmin";
import { setMsg } from "@/utils/toast";
import { Type } from "@/constants/ui";
import { useSystemAdminStore } from "@/stores/useSystemAdminStore";
import { useUserStore } from "@/stores/useUserStore";

type ServiceSwitchKey = Exclude<keyof ApiSystemConfigEditable, "announcement">;

interface ServiceSwitch {
  key: ServiceSwitchKey;
  title: string;
  description: string;
}

const serviceSwitches: ServiceSwitch[] = [
  {
    key: "allowGameLogin",
    title: "游戏登录",
    description: "当前允许玩家登录游戏",
  },
  {
    key: "allowGameCreate",
    title: "游戏创建",
    description: "当前允许创建托管账号",
  },
  {
    key: "allowGameUpdate",
    title: "游戏更新",
    description: "当前允许更新托管配置",
  },
  {
    key: "allowGameDelete",
    title: "游戏删除",
    description: "当前允许删除托管账号",
  },
];

const userStore = useUserStore();
const systemAdminStore = useSystemAdminStore();

const originalConfig = ref<ApiSystemConfigEditable | null>(null);
const draftConfig = ref<ApiSystemConfigEditable | null>(null);
const isLoadingConfig = ref(false);
const isPublishing = ref(false);

const customQQGroups = computed(() => systemAdminStore.customQQGroups);

const cloneConfig = (config: ApiSystemConfigEditable): ApiSystemConfigEditable => ({ ...config });

const loadConfig = async () => {
  if (isLoadingConfig.value) return;
  isLoadingConfig.value = true;
  try {
    const config = await loadApiSystemConfigEditable();
    originalConfig.value = cloneConfig(config);
    draftConfig.value = cloneConfig(config);
  } catch (error) {
    const message = error instanceof Error ? error.message : SYSTEM_CONFIG_MESSAGES.LOAD_FAILED;
    setMsg(message, Type.Error);
    originalConfig.value = null;
    draftConfig.value = null;
  } finally {
    isLoadingConfig.value = false;
  }
};

const handlePublish = async () => {
  if (!originalConfig.value || !draftConfig.value || isPublishing.value) return;

  const payload = buildApiSystemConfigUpdate(originalConfig.value, draftConfig.value);
  if (Object.keys(payload).length === 0) {
    setMsg(SYSTEM_CONFIG_MESSAGES.NO_CHANGES, Type.Info);
    return;
  }

  isPublishing.value = true;
  try {
    const result = await saveApiSystemConfigEditable({
      userPermission: userStore.info.permission,
      originalConfig: originalConfig.value,
      draftConfig: draftConfig.value,
      customQQGroups: customQQGroups.value,
    });
    originalConfig.value = cloneConfig(result.config);
    draftConfig.value = cloneConfig(result.config);
    setMsg(SYSTEM_CONFIG_MESSAGES.PUBLISH_SUCCESS, Type.Success);
  } catch (error) {
    const message = error instanceof Error ? error.message : SYSTEM_CONFIG_MESSAGES.UPDATE_FAILED;
    setMsg(message, Type.Error);
  } finally {
    isPublishing.value = false;
  }
};

onMounted(loadConfig);
</script>

<style scoped>
.admin-announcement-field {
  background:
    linear-gradient(
      180deg,
      color-mix(in oklab, var(--color-base-100) 94%, var(--color-base-content) 6%),
      color-mix(in oklab, var(--color-base-100) 82%, var(--color-base-200) 18%)
    );
}

.admin-switch-card {
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

.admin-switch-card:hover {
  background:
    linear-gradient(
      180deg,
      color-mix(in oklab, var(--color-base-300) 62%, var(--color-base-100) 38%),
      color-mix(in oklab, var(--color-base-300) 46%, var(--color-base-100) 54%)
    );
  box-shadow:
    inset 0 1px 0 color-mix(in oklab, var(--color-base-content) 9%, transparent),
    0 0 0 1px color-mix(in oklab, var(--color-base-content) 11%, transparent),
    0 0.45rem 1rem color-mix(in oklab, black 18%, transparent);
}

</style>
