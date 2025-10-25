<script setup lang="ts">
import { useCountriesStore } from '@/stores/countries'

const store = useCountriesStore()
</script>

<template>
  <div>
    <div class="text-text-light-info dark:text-text-dark-info">
      No results for "<span class="text-text-light-default dark:text-text-dark-default">
        {{ store.searchTerm }} </span
      >"
    </div>
  </div>
</template>

<style scoped></style>
