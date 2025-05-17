<script setup lang="ts">
import { computed } from 'vue'
import countriesJson from '../data/current-license-plates.json'
import CountryCard from '@/components/overview/CountryCard.vue'
import ListActions from '@/components/overview/ListActions.vue'

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

// const countries = ref<ICountryData>({})

// onMounted(() => {
//   console.log('Overview mounted -> json:', countriesJson, countriesJson.countries.length)
//   countries.value = countriesJson
// })
</script>

<template>
  <div class="h-full w-full flex flex-col items-center justify-center pt-6 pb-6">
    <div class="text-xs text-text-light-secondary dark:text-text-dark-secondary">
      Last Updated: {{ lastUpdated }}
    </div>
    <h1 class="title text-4xl mb-8">Countries</h1>
    <div class="content flex flex-col w-4/5 items-center justify-center gap-6">
      <ListActions></ListActions>
      <div class="list flex flex-wrap gap-4 w-full">
        <!-- <div>Letter</div> -->
        <div class="list-element" v-for="country in countriesJson.countries" :key="country.code">
          <CountryCard :country="country"></CountryCard>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
