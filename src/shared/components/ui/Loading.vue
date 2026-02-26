<template>
  <div class="absolute right-0 left-0 top-0 bottom-0 z-10 flex justify-center">
    <div class="bg-base-100 border-base-300 absolute right-0 left-0 top-0 bottom-0" :class="opacity"/>
    <div class="flex items-center justify-center">
      <div class="flex items-center justify-center">
        <div class="w-16 h-16 border-4 border-dashed rounded-full animate-spin-slow border-info"/>
      </div>
    </div>
  </div>
</template>
<script setup>
defineProps({
  opacity: {
    type: String,
    default: 'opacity-70'
  }
})
</script>