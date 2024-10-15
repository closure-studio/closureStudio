<template>
    <div>
        <button className="btn btn-ghost btn-xs">
            {{ label }}
            <input v-if="isHealth" type="radio" className="radio radio-accent radio-xs" defaultChecked />
            <input v-if="!isHealth" type="radio" className="radio radio-error radio-xs" defaultChecked />
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