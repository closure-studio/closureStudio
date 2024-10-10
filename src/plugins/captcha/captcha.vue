<template>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue';

// 定义一个函数来动态加载外部脚本
const loadExternalScript = (src: string, id: string) => {
    return new Promise<void>((resolve, reject) => {
        // 检查是否已经加载该脚本，避免重复加载
        if (document.getElementById(id)) {
            resolve();
            return;
        }

        // 创建 script 标签
        const script = document.createElement('script');
        script.src = src;
        script.id = id;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
        document.head.appendChild(script);
    });
};

// 在组件首次挂载时执行
onMounted(async () => {
    try {
        // 使用 Promise.all 并行加载所有外部脚本
        await Promise.all([
            loadExternalScript('//www.recaptcha.net/recaptcha/api.js?render=6LfrMU0mAAAAADoo9vRBTLwrt5mU0HvykuR3l8uN', 'recaptcha'),
            loadExternalScript('//static.geetest.com/v4/gt4.js', 'geetest')
        ]);
        console.log('All external scripts loaded successfully.');
    } catch (error) {
        console.error('Failed to load one or more external scripts:', error);
    }
});
</script>