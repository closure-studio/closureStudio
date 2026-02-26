<template>
  <transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
  >
    <div v-if="showing" class="fixed inset-0 z-10 overflow-y-auto">
      <div class="flex items-center min-h-screen pt-4 px-4 pb-20">
        <div class="fixed inset-0 transition-opacity" aria-hidden="true">
          <div class="absolute inset-0 bg-base-200 opacity-40" @click="close"/>
        </div>
        <div class="m-2 p-4 inline-block overflow-visible align-middle w-full max-w-2xl bg-base-100 rounded-lg shadow-xl transform transition-all">
          <slot />
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
  defineProps({
    showing: {
      default: false,
      type: Boolean
    },
    showClose: {
      default: true,
      type: Boolean
    },
    close: {
      default: () => {},
      type: Function
    }
  })
</script>