<template>
  <!-- 移动端底部导航 -->
  <div class="btm-nav lg:hidden z-50">
    <button
      :class="{ active: activeTab === 'chars' }"
      @click="$emit('change', 'chars')"
    >
      <span class="text-xs">干员</span>
    </button>
    <button
      :class="{ active: activeTab === 'items' }"
      @click="$emit('change', 'items')"
    >
      <span class="text-xs">道具</span>
    </button>
    <button
      :class="{ active: activeTab === 'logs' }"
      @click="$emit('change', 'logs')"
    >
      <span class="text-xs">日志</span>
    </button>
    <button
      :class="{ active: activeTab === 'config' }"
      @click="$emit('change', 'config')"
    >
      <span class="text-xs">配置</span>
    </button>
  </div>
</template>

<script setup lang="ts">
export type NavTab = 'chars' | 'items' | 'logs' | 'config';

defineProps<{
  activeTab: NavTab;
}>();

defineEmits<{
  change: [tab: NavTab];
}>();
</script>
