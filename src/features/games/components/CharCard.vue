<template>
  <div
    class="char-card group relative overflow-hidden shadow-md transition-all duration-300 cursor-pointer hover:shadow-2xl hover:scale-105 hover:-translate-y-1 rounded-md"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <!-- 头像容器 -->
    <div class="char-card__image-wrapper relative aspect-square overflow-hidden">
      <!-- 普通头像 -->
      <img
        v-show="!showElite2"
        :src="normalAvatar"
        :alt="char.charId"
        loading="lazy"
        class="char-card__image w-full h-full object-cover transition-all duration-300"
        :class="{ 'opacity-0': showElite2 }"
        @error="handleImageError"
      />

      <!-- 精2头像（如果有） -->
      <img
        v-if="hasElite2"
        v-show="showElite2"
        :src="elite2Avatar"
        :alt="char.charId"
        loading="lazy"
        class="char-card__image absolute inset-0 w-full h-full object-cover transition-all duration-300"
        :class="{ 'opacity-0': !showElite2 }"
        @error="handleImageError"
      />

      <!-- 光效闪烁 -->
      <div
        v-if="showFlash"
        class="elite2-flash absolute inset-0 pointer-events-none"
      ></div>

      <!-- 粒子爆发 -->
      <div v-if="showParticles" class="particles-container absolute inset-0 pointer-events-none overflow-visible">
        <div
          v-for="i in 12"
          :key="i"
          class="particle"
          :style="getParticleStyle(i)"
        ></div>
      </div>

      <!-- 渐变遮罩（悬停时显示） -->
      <div class="char-card__overlay absolute inset-0 bg-gradient-to-t from-base-300/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </div>

    <!-- 信息栏（从右侧滑入） -->
    <div class="char-card__info absolute bottom-0 right-0 transition-transform duration-300 translate-x-full group-hover:translate-x-0">
      <div class="px-2 py-1 rounded" style="background: rgba(0, 0, 0, 0.85);">
        <h3 class="text-xs font-bold text-white whitespace-nowrap">{{ charName }}</h3>
        <div class="text-[10px] text-white/80 mt-0.5">Lv.{{ char.level }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onUnmounted } from 'vue';
import { getCharAvatarUrl } from '@/shared/utils/resource';
import { assets } from '@/plugins/assets/assets';
import type { ApiGameChar } from '@/shared/types/api';

const props = defineProps<{ char: ApiGameChar }>();

const normalAvatar = computed(() => getCharAvatarUrl(props.char.charId));
const elite2Avatar = computed(() => getCharAvatarUrl(`${props.char.charId}_2`));
const charName = computed(() => assets.value.getCharName(props.char.charId));

const hasElite2 = computed(() => props.char.evolvePhase === 2);
const showElite2 = ref(false);
const showFlash = ref(false);
const showParticles = ref(false);

const timers: number[] = [];

const getParticleStyle = (index: number) => {
  const angle = (index * 360) / 12;
  return {
    '--angle': `${angle}deg`,
    '--delay': `${index * 0.05}s`,
  };
};

const handleMouseEnter = () => {
  if (hasElite2.value) {
    // 触发光效
    showFlash.value = true;

    // 延迟100ms触发粒子
    timers.push(window.setTimeout(() => {
      showParticles.value = true;
    }, 100));

    // 切换头像
    showElite2.value = true;

    // 清理光效（600ms后）
    timers.push(window.setTimeout(() => {
      showFlash.value = false;
    }, 600));

    // 清理粒子（900ms后）
    timers.push(window.setTimeout(() => {
      showParticles.value = false;
    }, 900));
  }
};

const handleMouseLeave = () => {
  showElite2.value = false;
  showFlash.value = false;
  showParticles.value = false;

  // 清理所有定时器
  timers.forEach(timer => clearTimeout(timer));
  timers.length = 0;
};

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  // 图片加载失败时的占位图
  img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3E加载失败%3C/text%3E%3C/svg%3E';
};

onUnmounted(() => {
  timers.forEach(timer => clearTimeout(timer));
});
</script>

<style scoped>
/* 光效闪烁 */
.elite2-flash {
  background: radial-gradient(circle, rgba(255, 201, 14, 0.8) 0%, transparent 70%);
  animation: flash 0.6s ease-out;
}

@keyframes flash {
  0% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

/* 粒子容器 */
.particles-container {
  position: absolute;
  inset: 0;
}

/* 粒子 */
.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: #FFC90E;
  border-radius: 50%;
  top: 50%;
  left: 50%;
  animation: particle-burst 0.8s ease-out forwards;
  animation-delay: var(--delay);
  box-shadow: 0 0 4px #FFC90E;
}

@keyframes particle-burst {
  0% {
    transform: translate(-50%, -50%) rotate(var(--angle)) translateY(0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) rotate(var(--angle)) translateY(60px) scale(0);
    opacity: 0;
  }
}
</style>
