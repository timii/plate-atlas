<script setup lang="ts">
import type { ICountry } from '@/models/country.interface'

defineProps<{
  country: {
    type: ICountry
    required: true
  }
}>()
</script>

<template>
  <div>{{ country }}</div>
</template>

<style scoped></style>
