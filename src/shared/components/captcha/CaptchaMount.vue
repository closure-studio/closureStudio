<template>
  <div id="captcha" class="captcha h-0"></div>
  <div v-if="operationCaptcha" class="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-xl rounded-lg border border-base-content/20 bg-base-200 p-4 shadow-sm">
    <p role="status">托管操作验证中。取消只停止本地等待，服务器结果可能仍需确认。</p>
    <button type="button" class="btn btn-outline min-h-11 mt-2" @click="cancelOperationCaptcha">取消本地等待</button>
  </div>
</template>
<script setup lang="ts">
import { operationCaptcha, cancelOperationCaptcha } from "@/services/captcha";
</script>
