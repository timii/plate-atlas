<script setup lang="ts">
import { ref, watch } from 'vue'
import SearchBar from '../shared/SearchBar.vue'

const searchTerm = ref('')

watch(
  () => searchTerm.value,
  (value: string) => {
    console.log('searchTerm changed:', value)
    // TODO: filter country list
  },
)
</script>

<template>
  <div class="actions flex items-center justify-between gap-6 w-full">
    <SearchBar v-model:text="searchTerm"></SearchBar>
    <div>
      <div class="actions-search">group by</div>
      <div class="actions-search">sort</div>
    </div>
  </div>
</template>

<style scoped></style>
