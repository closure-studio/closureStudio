<template>
  <section v-if="entries.length" aria-label="游戏验证状态" class="my-4 rounded-lg border border-base-content/20 bg-base-200 p-4">
    <h2 class="font-bold text-lg">游戏验证</h2>
    <p class="text-sm my-2">人工验证提交不等于登录成功。取消只停止本地等待，不撤销服务器操作。</p>
    <ul class="divide-y divide-base-content/20">
      <li v-for="[id, state] in entries" :key="id" class="py-3" :data-captcha-account="id">
        <p class="font-semibold">{{ maskSensitiveIdentifier(id) }}</p>
        <p role="status" aria-live="polite">{{ state.message }}</p>
        <p class="text-sm mt-1">服务器当前状态：{{ serverLabel(state.serverCode) }}</p>
        <div class="flex flex-wrap gap-2 mt-2">
          <button v-if="canCancel(state.phase)" type="button" class="btn btn-outline min-h-11" @click="store.cancelCaptcha(id)">取消验证</button>
          <button type="button" class="btn btn-outline min-h-11 aria-disabled:opacity-50" :aria-disabled="busy || store.isLoadingGameList || !canRetry(state.phase)" @click="canRetry(state.phase) && act(id)">重新读取并验证</button>
          <button type="button" class="btn btn-ghost min-h-11" :aria-disabled="busy || store.isLoadingGameList" @click="act()">重新读取状态</button>
        </div>
      </li>
    </ul>
    <p v-if="readError" role="alert" class="mt-2">读取失败，未重新提交验证，请稍后重试。</p>
  </section>
</template>
<script setup lang="ts">
import { computed, ref } from "vue";
import { useGamesStore } from "@/stores/useGamesStore";
import { maskSensitiveIdentifier } from "@/utils/format";
const props = defineProps<{ account?: string }>();
const store = useGamesStore();
const entries = computed(() => Object.entries(store.captchaStates).filter(([id]) => !props.account || props.account === id));
const busy = ref(false);
const readError = ref(false);
const canCancel = (phase: string) => ["queued", "initializing", "awaiting-user", "submitting"].includes(phase);
const canRetry = (phase: string) => ["cancelled", "error", "timed-out", "unconfirmed", "server-failed"].includes(phase);
const serverLabel = (code: number) => ({ "-1": "登录失败", "0": "未开启", "1": "登录中", "2": "运行中", "3": "游戏错误" })[String(code)] ?? "未知";
async function act(account?: string) {
  if (busy.value || store.isLoadingGameList) return;
  busy.value = true; readError.value = false;
  try {
    const ok = account ? await store.retryCaptcha(account) : await store.queryGameList();
    readError.value = ok === false;
  } catch { readError.value = true; }
  finally { busy.value = false; }
}
</script>
