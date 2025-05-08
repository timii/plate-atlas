<script setup lang="ts">
import { computed, onMounted } from 'vue'
import countriesJson from '../../data/current-license-plates.json'

const lastUpdated = computed(() => {
  const date = new Date(countriesJson.lastUpdate)
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
  const formatted = date.toLocaleDateString(undefined, options)
  return formatted
})

onMounted(() => {
  console.log('Overview mounted -> json:', countriesJson)
})
</script>

<template>
  <div class="h-full w-full flex flex-col items-center justify-center pt-6 border">
    <div class="text-xs">Last Updated: {{ lastUpdated }}</div>
    <h1 class="title text-4xl mb-8">Countries</h1>
    <div class="content flex flex-col w-4/5 items-center justify-center gap-6">
      <div class="actions flex justify-between gap-6 w-full bg-amber-800">
        <div class="actions-search">search</div>
        <div class="actions-search">sort</div>
      </div>
      <div class="list flex flex-col w-full bg-amber-800">
        <div>Letter</div>
        <div>Elements</div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
