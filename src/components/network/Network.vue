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
        <label
          class="block rounded-lg px-3 py-3 cursor-pointer transition-colors"
          :class="
            handleAPIClientRadioIsChecked(API_HOST_LTSC)
              ? 'bg-primary/5'
              : 'bg-base-100 hover:bg-base-200/20'
          "
          @click="handleAPIClientRadioOnClick(API_HOST_LTSC)"
        >
          <div class="flex items-center justify-between gap-3">
            <div class="flex items-center gap-3 min-w-0 flex-1">
              <span
                class="h-2.5 w-2.5 rounded-full shrink-0"
                :class="handleAPIClientRadioIsChecked(API_HOST_LTSC) ? 'bg-primary' : 'bg-base-300'"
              />
              <div class="min-w-0">
                <p class="text-sm font-semibold truncate">{{ API_HOST_LTSC.label }}</p>
              </div>
            </div>
            <div class="flex items-center gap-3 shrink-0">
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
            </div>
          </div>
        </label>

        <div class="divider my-0" />

        <label
          class="block rounded-lg px-3 py-3 cursor-pointer transition-colors"
          :class="
            handleAPIClientRadioIsChecked(API_HOST_CLOUDFLARE)
              ? 'bg-primary/5'
              : 'bg-base-100 hover:bg-base-200/20'
          "
          @click="handleAPIClientRadioOnClick(API_HOST_CLOUDFLARE)"
        >
          <div class="flex items-center justify-between gap-3">
            <div class="flex items-center gap-3 min-w-0 flex-1">
              <span
                class="h-2.5 w-2.5 rounded-full shrink-0"
                :class="
                  handleAPIClientRadioIsChecked(API_HOST_CLOUDFLARE) ? 'bg-primary' : 'bg-base-300'
                "
              />
              <div class="min-w-0">
                <p class="text-sm font-semibold truncate">{{ API_HOST_CLOUDFLARE.label }}</p>
              </div>
            </div>
            <div class="flex items-center gap-3 shrink-0">
              <span :class="cloudflareLatencyClass">{{
                formatLatencyText(cloudflareRadioBtnText)
              }}</span>
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
            </div>
          </div>
        </label>
      </div>
      <div class="divider"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import apiClient, { APIClient } from "@/shared/services/apiClient";
import { API_HOST_CLOUDFLARE, API_HOST_LTSC, type IHostServer } from "@/constants/hosts";
import { computed, ref } from "vue";

import { Type } from "@/constants/toast";
import { setMsg } from "@/shared/utils/toast";

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
