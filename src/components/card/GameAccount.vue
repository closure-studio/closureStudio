<template>
  <div
    class="hover:scale-105 hover:shadow-lg hover:bg-info/10 active:bg-info/10 active:scale-95 duration-300 shadow-lg rounded-2xl px-4 py-3 s-pro">
    <div class="flex items-center">
      <div class="avatar mr-2">
        <div class="w-12 rounded-md">
          <img :src="`https://assets.ltsc.vip/avatar/${getAvatarType()}/${getAvatarId()}.png`" alt="斯卡蒂" />
          <!-- <img :src="`https://cc-im-kefu-cos.7moor-fs1.com/im/4d2c3f00-7d4c-11e5-af15-41bf63ae4ea0/ch9KONh0.jpg`" -->
          alt="斯卡蒂" />

        </div>
      </div>
      <div class="flex">
        <span class="text-4xl font-en">{{ getGameLevel() }}</span>
      </div>
      <div class="divider divider-horizontal mx-0 py-1" />
      <div class="flex flex-col text-base-content/60 font-bold">
        <span>Lv.</span>
        <span class="-mt-2">博士等级</span>
      </div>
      <div class="flex-1" />
      <div class="badge p-3 px-4 badge-info font-zhCN text-lg">
        {{ getGamePlatformStr() }}
      </div>
    </div>
    <div class="mt-1 text-2xl font-zhCN">
      Dr. {{ getGameNickName() }}
      <span class="text-lg text-info">【{{ getMaskedGameAccount() }}】</span>
    </div>
    <div class="grid grid-cols-3">
      <div class="flex flex-col" v-for="m in 3">
        <span class="text-base-content/70">{{ ["理智", "地图", "状态"][m - 1] }}
          <b class="text-info">//</b>
        </span>
        <span class="text-md font-bold font-en" v-html="getContent(m)"></span>
      </div>
    </div>
    <slot />

  </div>
</template>
<script lang="ts" setup>
import { assets } from "../../plugins/assets/assets";
import { maskPhoneNumber } from "../../plugins/common";
import { ref, onMounted, onUnmounted, computed } from "vue";
import { myState } from "../../store/games/myGames";
interface Props {
  gameAccount?: string
}
const props = defineProps<Props>();
const { gameAccount } = props;

const game = computed(() => {
  if (!gameAccount) return null;
  return myState.gameList.find((game) => game.status.account === gameAccount);
});


const getAvatarId = () => {
  if (!game.value) return "avatar_activity_GK";
  // 如果有 avatar id，则进行替换处理
  return (game.value.status?.avatar.id || "avatar_activity_GK")
    .replace(/@/g, "_") // 替换 @ 为 _
    .replace(/#/g, "_"); // 替换 # 为 _
};

const getAvatarType = () => {
  if (!game.value) return "DEFAULT";
  return game.value.status?.avatar.type || "DEFAULT";
};

const getGameLevel = () => {
  if (!game.value) return 0;
  return game.value.status?.level || 0;
};

const getGamePlatformStr = () => {
  if (!game.value) return "未知";
  return game.value.status?.platform === 1 ? "官服" : "B服";
};

const getGameNickName = () => {
  if (!game.value) return "Nameless";
  return game.value.status?.nick_name || "Nameless";
};

const getMaskedGameAccount = () => {
  if (!game.value) return "未知账号";
  return maskPhoneNumber(game.value.game_config?.account);
};

const loadingIndex = ref<number | null>(null);

let interval: number;

onMounted(() => {
  interval = window.setInterval(() => {
    loadingIndex.value = Math.floor(Math.random() * 3) + 1; // 随机选择 1 到 3
    // 显示 1 秒后重置
    setTimeout(() => {
      loadingIndex.value = null;
    }, 1000);
  }, 3000);
});

onUnmounted(() => {
  clearInterval(interval);
});

const getContent = (m: number): string => {
  if (!game.value) return "未知";

  if (loadingIndex.value === m) {
    return '<span class="loading loading-bars loading-xs"></span>';
  }

  switch (m) {
    case 1:
      return game.value?.status?.ap?.toString() ?? "0";

    case 2:
      return assets.value.getStageName(game.value?.game_config?.map_id ?? "") || "未选择";

    case 3:
      return game.value?.status?.text ?? "未知";

    default:
      return "";
  }
};
</script>
