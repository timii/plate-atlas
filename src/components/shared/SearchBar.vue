<script setup lang="ts">
const text = defineModel('text', { type: String, default: '' })
</script>

<template>
  <div class="search-container">
    <input
      v-model="text"
      type="text"
      placeholder="Search..."
      class="block h-action-element-height w-full rounded-lg border border-border-light3 p-2.5 text-sm text-text-light-default focus:outline-none dark:border-border-dark3 dark:bg-background-dark-highlight dark:text-text-dark-default dark:placeholder-gray-400"
    />
  </div>
</template>

<style scoped></style>
