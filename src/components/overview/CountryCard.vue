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
  <div>{{ props.country }}</div>
</template>

<style scoped></style>
