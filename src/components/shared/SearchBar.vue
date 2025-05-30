<script setup lang="ts">
import Close from '@/assets/icons/Close.vue'

const text = defineModel('text', { type: String, default: '' })
</script>

<template>
  <div
    class="search-container flex h-action-element-height w-42 items-center gap-x-1.5 rounded-lg border border-border-light3 p-2.5 text-sm text-text-light-default dark:border-border-dark3 dark:bg-background-dark-highlight dark:text-text-dark-default dark:placeholder-gray-400"
  >
    <input v-model="text" type="text" placeholder="Search..." class="w-full focus:outline-none" />

    <Close
      v-if="text.length > 0"
      @click="text = ''"
      class="cursor-pointer rounded text-gray-400 transition-all duration-200 ease-cubic hover:bg-background-light-hover hover:dark:bg-background-dark-hover"
    ></Close>
  </div>
</template>

<style scoped></style>
