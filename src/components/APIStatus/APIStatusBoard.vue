<template>
    <div>
        <pre class="font-bold text-center mb-2">服务监控</pre>
        <div class="flex flex-wrap gap-2 ml-2">
            <div v-for="(address, label) in healthRecords" :key="address" class="text-left">
                <APIStatus :label="label" :address="address" />
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import APIStatus from "./APIStatusBtn.vue";
import { healthRecords } from "./config";
</script>