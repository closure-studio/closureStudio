<template>
    <div>
        <button class="btn btn-ghost btn-xs">
            {{ label }}
            <input v-if="isHealth" type="radio" class="radio radio-accent radio-xs animate-blink" defaultChecked />
            <input v-if="!isHealth" type="radio" class="radio radio-error radio-xs animate-blink" defaultChecked />
        </button>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
interface Props {
    label: string;
    address: string;
}
const props = defineProps<Props>();
const { label, address } = props
const isHealth = ref<boolean | null>(null)
const checkSVG = async () => {
    try {
        const response = await fetch(address);
        const svgText = await response.text();
        console.log(svgText);
        if (svgText.includes('Health')) {
            isHealth.value = true;
            return;
        }
        isHealth.value = false;
    } catch (error) {
        console.error('Error fetching SVG:', error)
        isHealth.value = false;
    }
}

// 在组件挂载时调用 checkSVG
onMounted(() => {
    checkSVG()
})
</script>

<style>
@keyframes blink {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0;
    }
}

.animate-blink {
    animation: blink 1s infinite;
}
</style>