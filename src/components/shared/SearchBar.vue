<script setup lang="ts">
const text = defineModel('text', { type: String, default: '' })
</script>

<template>
  <div class="search-container">
    <input
      v-model="text"
      type="text"
      placeholder="Search..."
      class="border text-text-light-default border-border-light3 text-sm rounded-lg block w-full p-2.5 dark:bg-background-dark-highlight dark:border-border-dark3 dark:placeholder-gray-400 dark:text-text-dark-default"
    />
  </div>
</template>

<style scoped></style>
