<template>
  <div class="container w-full md:max-w-4xl mx-auto">
    <div class="flex w-full flex-col">
      <span class="font-bold text-4xl">可露希尔杂货店</span>
      <div class="divider my-2" />
    </div>
    <div class="mt-2 flex items-start">
      <ul class="menu w-[15rem] rounded-box shadow-md mr-4 space-y-2 font-bold s-pro">
        <li v-for="k in menu">
          <router-link :to="k.to" :class="{ active: route.path == k.to }">
            {{ k.name }}
          </router-link>
        </li>
      </ul>
      <div class="grow shadow-md py-4 px-5 rounded-box">
        <div class="p-2 flex items-center">
          <div class="avatar mr-3">
            <div class="w-16 rounded-full">
              <img src="/assets/closure.ico" alt="avatar" />
            </div>
          </div>
          <div class="font-bold flex flex-col">
            <span class="text-3xl">博士！</span>
            <span class="text-base-content/50">今天是你加入可露希尔俱乐部第 {{ days }} 天!</span>
          </div>
        </div>
        <div class="divider my-2" />
        <router-view v-slot="{ Component }">
          <transition name="slide-fade">
            <component :is="Component" v-if="Component" />
            <div v-else>
              <div v-if="user.user.Info.status === 1" role="alert"
                class="rounded border-s-4 border-success bg-info/10 p-4 mt-4">
                <strong class="block font-bold text-lg">你已完成身份绑定，可正常使用可露希尔云服务</strong>
                <p class="mt-4 text-sm">
                  <a class="btn btn-info btn-sm px-4 btn-outline">你的绑定手机号是：可露希尔也不知道(&gt;﹏&lt;)</a>
                </p>
              </div>
              <div v-if="user.user.Info.status <= 0" role="alert"
                class="rounded border-s-4 border-warning bg-warning/10 p-4 mt-4">
                <strong class="block font-bold text-lg">你还没有绑定手机号，请先添加游戏/启动游戏</strong>
                <p class="mt-4 text-sm">
                  <router-link to="/dashboard" class="btn btn-info btn-sm px-4 btn-outline btn-block">点击传送</router-link>
                </p>
              </div>
              <div class="divider" />
              <span class="text-2xl font-bold">你是可露希尔旗舰店<a class="text-info">{{ levels[gameList.length] }}级</a>会员</span>
              <div class="text-xl">可在平台内添加托管 {{ 3 - gameList.length }} 个游戏账号</div>
              <div class="grid grid-cols-2 gap-4 mt-2">
                <GameAccount v-for="(v, k) in gameList" :key="k" :gameAccount="v.game_config.account" />
              </div>
              <div class="divider my-2" />
              <span class="text-info text-lg">托管额度已全部使用，无法添加更多账号；<br />若想增加额度，请<b
                  class="text-base-content s-underline">验证账号所有权</b>（尚未开放）</span>
            </div>
          </transition>
        </router-view>
      </div>
    </div>
  </div>
</template>
<style scoped>
.slide-fade-enter-active {
  transition: all 0.2s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.2s ease-in;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(4rem);
  opacity: 0;
}
</style>

<script setup lang="ts">
import { useRoute } from "vue-router";
import GameAccount from "../../components/card/GameAccount.vue";
import { computed, onMounted, ref } from "vue";
import { userStore } from "../../store/user";
import { initializeGameListServerConnection } from "../../store/games/myGames";
import apiClient from "../../plugins/axios/apiClient";
const route = useRoute();
const user = userStore();
const levels = ["杰斯顿", "深海杰斯顿", "海上杰斯顿", "空中杰斯顿", "兽主杰斯顿"];
const menu = [
  {
    name: "平台信息",
    to: "/profile"
  },
  {
    name: "消息推送",
    to: "/profile/wechat"
  },
  {
    name: "账号安全",
    to: "/profile/account"
  },
  {
    name: "账号认证",
    to: "/profile/smsVerify"
  }
];
const gameList = ref<ApiGame.Game[]>([]);
apiClient.fetchGameList().then((res) => {
  if (res.data) gameList.value = res.data;
});
const days = computed(() => {
  if (!gameList.value.length) return 1;
  return Math.ceil((Math.floor(Date.now() / 1000) - gameList.value[0].status.created_at) / 60 / 60 / 24);
});
onMounted(async () => {
  initializeGameListServerConnection();
});
</script>
