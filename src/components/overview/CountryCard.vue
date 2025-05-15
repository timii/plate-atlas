<script setup lang="ts">
import type { ICountry } from '@/models/country.interface'
import type { PropType } from 'vue'

const props = defineProps({
  country: {
    type: Object as PropType<ICountry>,
    required: true,
  },
})
</script>

<template>
  <div
    class="country-card flex flex-row rounded pr-2 gap-2 items-center bg-background-dark-highlight shadow-sm shadow-background-dark-highlight-layer2"
  >
    <div class="flex flex-row gap-2 items-center bg-background-dark-highlight-layer2 p-2">
      <img :src="props.country.flagThumb" :alt="'flag'" />
      <div>{{ props.country.code }}</div>
    </div>
    <div>{{ props.country.country }}</div>
  </div>
</template>

<style scoped></style>
