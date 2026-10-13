<template>
  <section class="my-5 bg-info/5 shadow-md px-4 py-5 flex flex-col relative rounded-lg" aria-labelledby="version-heading">
    <h2 id="version-heading" class="font-bold text-2xl">欢迎来到可露希尔线上零售店</h2>
    <div class="mt-6 flex flex-wrap items-center gap-4 relative z-10">
      <span>当前版本：{{ version ?? '未知' }}</span>
      <span>最新版本：{{ latest ?? '未知' }}</span>
    </div>
    <img class="absolute right-0 bottom-0 w-28 md:w-36 opacity-10 rounded-t-full rounded-bl-full pointer-events-none" src="/assets/closure.ico" alt="" />
  </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { parseBuildVersion } from '@/checkVersion';
import { useVersionStatus } from './composables/useVersionStatus';
const version = parseBuildVersion(import.meta.env.VITE_APP_VERSION);
const { latest, check } = useVersionStatus(version);
onMounted(check);
</script>
