<template>
  <div>
    <!-- header -->
    <div v-if="isLoading">
      <span class="loading loading-bars loading-lg"></span>
      <span class="loading loading-bars loading-lg"></span>
      <span class="loading loading-bars loading-lg"></span>
    </div>
    <div>
      <div class="w-full mb-3 rounded-box bg-base-100">
        <StatusListItem
          :title="API_HOST_LTSC.label"
          :active="handleAPIClientRadioIsChecked(API_HOST_LTSC)"
          clickable
          @click="handleAPIClientRadioOnClick(API_HOST_LTSC)"
        >
          <template #suffix>
            <span :class="ltscLatencyClass">{{ formatLatencyText(ltscRadioBtnText) }}</span>
            <span
              class="text-xs font-medium"
              :class="
                handleAPIClientRadioIsChecked(API_HOST_LTSC)
                  ? 'text-primary'
                  : 'text-base-content/60'
              "
            >
              {{ handleAPIClientRadioIsChecked(API_HOST_LTSC) ? "使用中" : "切换" }}
            </span>
          </template>
        </StatusListItem>

        <div class="divider my-0" />

        <StatusListItem
          :title="API_HOST_CLOUDFLARE.label"
          :active="handleAPIClientRadioIsChecked(API_HOST_CLOUDFLARE)"
          clickable
          @click="handleAPIClientRadioOnClick(API_HOST_CLOUDFLARE)"
        >
          <template #suffix>
            <span :class="cloudflareLatencyClass">{{ formatLatencyText(cloudflareRadioBtnText) }}</span>
            <span
              class="text-xs font-medium"
              :class="
                handleAPIClientRadioIsChecked(API_HOST_CLOUDFLARE)
                  ? 'text-primary'
                  : 'text-base-content/60'
              "
            >
              {{ handleAPIClientRadioIsChecked(API_HOST_CLOUDFLARE) ? "使用中" : "切换" }}
            </span>
          </template>
        </StatusListItem>
      </div>
      <div class="divider"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import apiClient, { APIClient } from "@/services/apiClient";
import { API_HOST_CLOUDFLARE, API_HOST_LTSC, type IHostServer } from "@/constants/api";
import { computed, ref } from "vue";
import StatusListItem from "@/shared/components/ui/StatusListItem.vue";

import { Type } from "@/constants/ui";
import { setMsg } from "@/utils/toast";

const isLoading = ref(false);

const ltscRadioBtnText = ref("N/A");
const cloudflareRadioBtnText = ref("N/A");

const selectedHost = ref(apiClient.getHostServer());

const ltscClient = new APIClient(API_HOST_LTSC);
const cloudflareClient = new APIClient(API_HOST_CLOUDFLARE);

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

const formatLatencyText = (rawText: string) => {
  if (rawText === "N/A") return "检测中";
  if (rawText === "失败") return "连接失败";
  return rawText;
};

const getLatencyClass = (rawText: string) => {
  const baseClass = "text-xs font-medium";
  if (rawText === "N/A") return `${baseClass} text-base-content/60`;
  if (rawText === "失败") return `${baseClass} text-error`;

  const time = parseFloat(rawText);
  if (isNaN(time)) return `${baseClass} text-base-content/60`;
  return time < 1 ? `${baseClass} text-success` : `${baseClass} text-warning`;
};

const ltscLatencyClass = computed(() => getLatencyClass(ltscRadioBtnText.value));
const cloudflareLatencyClass = computed(() => getLatencyClass(cloudflareRadioBtnText.value));

const handleAPIClientRadioIsChecked = (host: IHostServer) => {
  return selectedHost.value.baseURL === host.baseURL;
};

const handleAPIClientRadioOnClick = (host: IHostServer) => {
  selectedHost.value = host;
  apiClient.setHostServer(host);
  apiClient.saveLocalStorage();
  setMsg(`切换 ${host.label} 成功, 将在2秒后刷新`, Type.Success);
  window.setTimeout(() => {
    window.location.reload();
  }, 1500);
};
</script>
