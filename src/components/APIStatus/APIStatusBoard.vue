<template>
    <div>
        <pre class="font-bold text-center mb-2">服务监控</pre>
        <div :style="gridStyle" class="grid justify-center">
            <div v-for="(address, label) in healthRecords" :key="address" class="text-left">
                <APIStatusBtn :label="label" :address="address" />
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import APIStatusBtn from "./APIStatusBtn.vue";
import { healthRecords } from "./config";
const containerWidth = ref(0);
const elementWidth = 90; // 每个元素的宽度

// 计算动态的 grid 样式
const gridStyle = computed(() => {
    const columns = Math.floor(containerWidth.value / elementWidth);
    return {
        gridTemplateColumns: `repeat(${columns > 0 ? columns : 1}, ${elementWidth}px)`
    };
});

// 更新容器宽度
const updateGridColumns = () => {
    if (typeof window !== 'undefined') {
        const container = document.querySelector('.grid');
        if (container) {
            containerWidth.value = container.clientWidth;
        }
    }
};

onMounted(() => {
    updateGridColumns();
    window.addEventListener('resize', updateGridColumns);
});

onBeforeUnmount(() => {
    window.removeEventListener('resize', updateGridColumns);
});
</script>


<style scoped>
.grid {
    display: grid;
    justify-items: center;
}

.text-left {
    width: 82px;
    /* 每个元素的宽度 */
}
</style>