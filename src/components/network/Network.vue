<template>
  <div>
    <!-- header -->
    <div v-if="isLoading">
      <span className="loading loading-bars loading-lg"></span>
      <span className="loading loading-bars loading-lg"></span>
      <span className="loading loading-bars loading-lg"></span>
    </div>
    <div>
      <div class="w-full mb-3">
        <label class="label">
          <span class="text-xs"> {{ APIHostLTSC.label }}</span>
          <div
            class="cursor-pointer flex flex-row items-center gap-2"
            @click="handleAPIClientRadioOnClick(APIHostLTSC)"
          >
            <!-- 按钮在小屏幕隐藏 -->
            <!-- <span class="text-xs"> {{ APIHostLTSC.label }}</span> -->
            <button :class="ltscButtonClass">{{ ltscRadioBtnText }}</button>
            <!-- 分隔线在小屏幕隐藏 -->
            <div class="divider divider-horizontal hidden lg:inline-flex"></div>
            <input
              type="radio"
              :disabled="isAPIClientRadioDisabled"
              :checked="handleAPIClientRadioIsChecked(APIHostLTSC)"
              class="radio checked:bg-red-500 radio-xs"
            />
          </div>
        </label>
        <label class="label">
          <span class="text-xs"> {{ APIHostCloudflare.label }}</span>
          <div
            class="cursor-pointer flex flex-row items-center gap-2"
            @click="handleAPIClientRadioOnClick(APIHostCloudflare)"
          >
            <!-- 确保文本与 radio 在同一行 -->
            <button :class="cloudflareButtonClass">{{ cloudflareRadioBtnText }}</button>
            <!-- 分隔线在小屏幕隐藏 -->
            <div class="divider divider-horizontal hidden lg:inline-flex"></div>
            <input
              type="radio"
              :disabled="isAPIClientRadioDisabled"
              :checked="handleAPIClientRadioIsChecked(APIHostCloudflare)"
              class="radio checked:bg-blue-500 radio-xs"
            />
          </div>
        </label>
      </div>
      <div class="divider"></div>
      <div class="w-full mb-3">
        <label class="label">
          <span class="text-xs"> {{ AuthServer.label }}</span>
          <input type="radio" disabled checked class="radio checked:bg-blue-500 radio-xs" />
        </label>
        <label class="label">
          <span class="text-xs"> {{ RegistryServer.label }}</span>
          <input type="radio" disabled checked class="radio checked:bg-blue-500 radio-xs" />
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import apiClient, { APIClient } from "@/shared/services/apiClient";
import {
  APIHostCloudflare,
  APIHostLTSC,
  AuthServer,
  IHostServer,
  RegistryServer,
} from "@/shared/services/host";

import { setMsg } from "@/shared/utils/toast";
import { Type } from "@/shared/components/toast/enum";

const isLoading = ref(false);
const isAPIClientRadioDisabled = ref(false);

const ltscRadioBtnText = ref("N/A");
const cloudflareRadioBtnText = ref("N/A");

const selectedHost = ref(apiClient.getHostServer());

const ltscClient = new APIClient(APIHostLTSC);
const cloudflareClient = new APIClient(APIHostCloudflare);

const measureTimeCost = async (client: APIClient, setBtnText: (text: string) => void) => {
  try {
    const startTime = performance.now();
    await client.fetchSystemConfig();
    const endTime = performance.now();
    const timeCost = ((endTime - startTime) / 1000).toFixed(1);
    setBtnText(`${timeCost}s`);
  } catch (error) {
    setBtnText("失败");
    console.error("API 请求失败:", error);
  }
};

// 调用测量时间的函数
measureTimeCost(ltscClient, (text) => (ltscRadioBtnText.value = text));
measureTimeCost(cloudflareClient, (text) => (cloudflareRadioBtnText.value = text));

// 计算属性，动态设置按钮样式
const ltscButtonClass = computed(() => {
  const time = parseFloat(ltscRadioBtnText.value);
  if (isNaN(time) || ltscRadioBtnText.value === "失败") return "btn btn-outline btn-xs btn-error";
  return time < 1 ? "btn btn-outline btn-xs btn-success" : "btn btn-outline btn-xs btn-warning";
});

const cloudflareButtonClass = computed(() => {
  const time = parseFloat(cloudflareRadioBtnText.value);
  if (isNaN(time) || cloudflareRadioBtnText.value === "失败")
    return "btn btn-outline btn-xs btn-error";
  return time < 1 ? "btn btn-outline btn-xs btn-success" : "btn btn-outline btn-xs btn-warning";
});

const handleAPIClientRadioIsChecked = (host: IHostServer) => {
  return selectedHost.value.baseURL === host.baseURL;
};

const handleAPIClientRadioOnClick = (host: IHostServer) => {
  selectedHost.value = host;
  isAPIClientRadioDisabled.value = true;
  apiClient.setHostServer(host);
  apiClient.saveLocalStorage();
  setMsg(`切换 ${host.label} 成功, 将在2秒后刷新`, Type.Success);
  window.setTimeout(() => {
    window.location.reload();
  }, 1500);
};
</script>
