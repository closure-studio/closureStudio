<template>
  <section aria-labelledby="public-announcements-heading">
    <pre id="public-announcements-heading" class="font-bold text-center mb-2" role="heading" aria-level="2">你站公告</pre>
    <div class="max-h-64 overflow-y-auto pr-5 font-mono">
      <p v-if="message" class="grid grid-cols-[2rem_minmax(0,1fr)] gap-x-[2ch]" role="status" aria-live="polite">
        <span aria-hidden="true" class="text-right opacity-50">&gt;</span>
        <span>{{ message }}</span>
      </p>
      <ul v-if="data?.events.length" class="space-y-2">
        <li v-for="event in data.events" :key="event.newsId" class="grid grid-cols-[2rem_minmax(0,1fr)] gap-x-[2ch]">
          <span aria-hidden="true" class="pt-2 text-right opacity-50">&gt;</span>
          <div class="min-w-0 break-words">
            <a class="flex min-h-11 items-center py-2 underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-offset-2" :href="event.sourceUrl" target="_blank" rel="noopener noreferrer">{{ event.title }}</a>
            <p v-for="(window, index) in event.windows" :key="index" class="whitespace-pre-line">{{ window.rawTimeText }}</p>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>
<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { usePublicAnnouncements } from './composables/usePublicAnnouncements';
const endpoint = import.meta.env.VITE_PUBLIC_ANNOUNCEMENTS_URL?.trim() ?? '';
const {data, loading, status, load} = usePublicAnnouncements(endpoint);
const message = computed(() => {
  if (loading.value && !data.value) return '公告加载中…';
  if (status.value === 'disabled' || status.value === 'unavailable') return '公告暂不可用。';
  if (status.value === 'stale') return '公告可能不是最新，请以公告原文为准。';
  if (status.value === 'partial') return '部分内容请以公告原文为准。';
  return data.value?.events.length ? '' : '暂无公告。';
});
onMounted(load);
</script>
