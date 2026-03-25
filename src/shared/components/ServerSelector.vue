<template>
  <div>
    <div class="divider my-4">服务器选择</div>
    <div class="flex flex-col md:flex-row gap-4 w-full mb-3">
      <div v-for="server in servers" :key="server.value" @click="selectServer(server.value)" :class="[
        'flex-1 rounded-lg p-4 cursor-pointer transition-all duration-200',
        'flex items-center justify-between',
        modelValue === server.value
          ? 'bg-blue-500/10 shadow-md'
          : 'bg-base-100 hover:bg-base-300 hover:shadow-sm'
      ]">
        <span class="text-xl font-medium">{{ server.label }}</span>
        <div v-if="modelValue === server.value"
          class="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clip-rule="evenodd" />
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
/**
 * ServerSelector - 服务器选择组件
 *
 * 使用方法:
 * <ServerSelector v-model="form.platform" />
 *
 * @param modelValue - 当前选中的平台 (1=官服, 2=B站服)
 * @emits update:modelValue - 平台选择变更事件
 */

interface ServerSelectorProps {
  modelValue: number;
}

defineProps<ServerSelectorProps>();

const emit = defineEmits<{
  "update:modelValue": [value: number];
}>();

const servers = [
  { value: 2, label: "BiliBili服" },
  { value: 1, label: "官服(安卓 / IOS)" },
];

const selectServer = (platform: number) => {
  emit("update:modelValue", platform);
};
</script>
