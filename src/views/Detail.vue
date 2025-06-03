<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import areaCodesJson from '../data/country-area-codes.json'

const route = useRoute()

const details = ref({})

onMounted(() => {
  console.log('onMounted in Detail called -> code:', route.params.code)
  // TODO: dynamically import country details using code (always import test country for testing layout and necessary data fields)
  // TODO: add interface for json
  details.value = areaCodesJson[route.params.code as string]
  console.log('onMounted in Detail:', details.value)
})
</script>

<template>
  <div>Detail page for {{ $route.params.code }}</div>
  <div>{{ details.country }}</div>
  <div class="sections flex flex-col gap-4">
    <div v-for="section in details.sections" :key="section">
      <div class="text-xl">{{ section.title }}</div>
      <div class="areas flex flex-wrap gap-4">
        <div v-for="area in section.areas" :key="area.code" class="area">
          {{ area }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
