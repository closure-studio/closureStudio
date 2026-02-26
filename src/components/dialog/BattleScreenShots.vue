<template>
  <div class="modal-box blog">
    <h2>战斗截图记录</h2>
    <div class="divider divider-warning"></div>
    <div v-if="props.screenShots?.length > 0 && props.screenShots[0].fileName">
      <div class="carousel w-full mt-2">
        <div
          :id="'screen_' + (k + 1)"
          class="carousel-item relative w-full"
          v-for="(data, k) in props.screenShots[0].fileName"
        >
          <img :src="getBattleScreenShotsLink(props.screenShots[0].host, data)" class="w-full" />
          <div
            class="absolute flex justify-between transform -translate-y-1/2 left-5 right-5 top-1/2"
          >
            <a :href="`#screen_${k}`" class="btn btn-circle btn-sm btn-info">❮</a>
            <a :href="`#screen_${k + 2}`" class="btn btn-circle btn-sm btn-info">❯</a>
          </div>
        </div>
      </div>
      <button class="btn btn-error btn-outline btn-block btn-sm mb-3" @click="dialogClose()">
        关闭
      </button>
    </div>
  </div>
</template>
<script lang="ts" setup>
import type { ApiGameScreenshot } from "@/shared/types/api";
import { DialogComponentProps } from "../../plugins/dialog/dialog";

interface Props extends DialogComponentProps {
  screenShots: ApiGameScreenshot[];
}

const props = withDefaults(defineProps<Props>(), {
  dialogClose: () => {},
  screenShots: () => [],
});

const { dialogClose } = props;

const getBattleScreenShotsLink = (host: string, fileName: string) => {
  return host + fileName;
};
</script>
