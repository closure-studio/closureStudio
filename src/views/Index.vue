<template>
    <div class="flex flex-col lg:flex-row pt-6 lg:pt-12 px-2 lg:px-10w h-full">
        <div class="flex flex-col justify-center items-start slide-in-bottom">
            <div class="gap-2 mb-4 hidden md:flex">
                <div class="badge bg-info/80 text-xl py-8 px-6 md:p-4">当前版本：V3.0.2</div>
                <div class="badge badge-info badge-outline text-xl py-8 px-6 md:p-4">游戏版本：2.1.01</div>
            </div>
            <div class="text-6xl font-extrabold md:text-7xl flex duration-200">
                最
                <div class="avatar slide-in-left delay-200 absolute duration-1000"
                    :class="{ 'ml-16 md:ml-20': closure }">
                    <div class="w-[3.75rem] md:w-20 mask mask-squircle">
                        <img src="/assets/closure.ico" alt="LOGO" />
                    </div>
                </div>
                <div ref="textRef" class="text-hinge text-info delay-380">{{ closure ? "　" : "不" }}</div>
                <div class="duration-1000" :class="{ 'ml-2 md:ml-6': closure }">智能的</div>
            </div>
            <h1
                class="text-5xl font-extrabold text-transparent sm:text-6xl my-3 bg-clip-text bg-gradient-to-r from-green-300 via-blue-500 to-purple-600">
                无人托管</h1>
            <h1 class="text-4xl font-extrabold sm:text-7xl" :class="isNight ? 'font-san' : 'font-en'">Closure Cloud</h1>
            <p
                class="text-base-content/70 text-2xl mb-8 mt-8 md:mt-4 text-center md:text-left slide-in-bottom delay-50">
                使用<span class="s-underline">可露希尔云平台</span>，只需点击几下，便可安然入睡。</p>
            <div class="flex-1" />
            <div class="slide-in-bottom delay-75 w-full mb-4 md:mt-[6.5rem]">
                <router-link to="/dashboard" class="space-btn" v-if="user.isLogin">
                    <strong>管理终端</strong>
                    <div id="container-stars">
                        <div id="stars" />
                    </div>
                </router-link>
                <a onclick="login.showModal()" class="space-btn" v-else>
                    <strong>管理终端</strong>
                    <div id="container-stars">
                        <div id="stars" />
                    </div>
                </a>
            </div>
            <div class="flex flex-wrap gap-4 slide-in-bottom delay-75 w-full">
                <a href="https://jq.qq.com/?_wv=1027&k=FiJjOEe8" class="btn btn-info flex-grow btn-outline">官方 Q1
                    群（人满）</a>
                <a href="https://jq.qq.com/?_wv=1027&k=8C3DZiQM"
                    class="btn btn-info w-1/2 md:w-1/3 hover:bg-base-100 hover:text-info">官方 Q2 群</a>
                <a href="/dashboard" class="btn btn-info flex-grow hover:bg-base-100 hover:text-info">[筹备中] 官方 Q 频</a>
            </div>
        </div>
        <div class="flex flex-col slide-in-bottom delay-75 lg:ml-6 flex-auto">
            <div class="space-x-4 hidden lg:flex">
                <div class="mockup-code bg-base-300 text-base-content shadow-lg rounded-lg w-1/2">
                    <pre class="font-bold text-center mb-2">你站公告</pre>
                    <pre data-prefix=">"><code>无所事事的公告</code></pre>
                </div>
                <div @click="ticketBtnOnClick()"
                    class="bg-base-300 shadow-lg rounded-lg p-2 w-1/2 flex flex-col items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                        stroke="currentColor" class="w-12 h-12 mt-2">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
                    </svg>
                    <span class="font-bold text-4xl">在线工单（Beta）</span>
                </div>
            </div>
            <div class="divider text-2xl 2xl:text-4xl 2xl:my-8 font-extrabold">罗 德 岛 名 人 堂</div>
            <div class="flex-auto grid content-between grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                <div v-for="k in list">
                    <div class="rounded-t-md bg-info text-center pt-1 text-2xl font-zhCN">
                        {{ k.nickName }}
                    </div>
                    <div class="w-full items-center flex flex-col border px-2 border-info pt-5 rounded-b-md s-pro">
                        <div class="indicator avatar">
                            <div class="w-16 mask mask-squircle">
                                <img :src="`https://assets.ltsc.vip/avatar/${k.avatar?.type == 'ICON' ? 'DEFAULT' : 'ASSISTANT'}/${k.avatar?.id?.replace('@', '_').replace('#', '_') || 'avatar_activity_GK'}.png`"
                                    alt="斯卡蒂" />
                            </div>
                            <span class="indicator-item indicator-bottom badge badge-info g-glossy text-lg font-en">
                                Lv{{ k.level }} </span>
                        </div>
                        <button class="btn btn-block btn-sm btn-info btn-outline mt-6 my-2">
                            <span class="text-white/60">理智使用：{{ k.totalAPCosts }}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <Login />
</template>
<script lang="ts" setup>
import { onMounted, ref } from "vue";
import Login from "../components/card/Login.vue";
import { userStore } from "../store/user";
import { isNight } from "../plugins/common";
import { router } from "../router";
const closure = ref(false); // Closure 图标动画
const textRef = ref();
const user = userStore();
const ticketBtnOnClick = () => {
    router.push("/ticket");
};

onMounted(() => {
    textRef.value.addEventListener("animationend", function () {
        // textRef.value.parentNode.removeChild(textRef.value);
        closure.value = true;
    });
});
const list = ref<ApiSystem.Hall[]>([]);
</script>
