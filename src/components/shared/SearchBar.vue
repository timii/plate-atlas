<script setup lang="ts">
const text = defineModel('text', { type: String, default: '' })
</script>

<template>
  <div class="search-container">
    <input v-model="text" type="text" placeholder="Search..." />
  </div>
</template>

<style scoped></style>
