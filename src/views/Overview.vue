<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import countriesJson from '../data/current-license-plates.json'
import CountryCard from '@/components/overview/CountryCard.vue'
import ListActions from '@/components/overview/ListActions.vue'
import type { ICountryData } from '@/models/country.model'
import { useCountriesStore } from '@/stores/countries'

const store = useCountriesStore()

const lastUpdated = computed(() => {
  const date = new Date(store.countries.lastUpdate)
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
  const formatted = date.toLocaleDateString(undefined, options)
  return formatted
})

const countriesObj = ref<ICountryData>({ lastUpdate: '', countries: [] })

onMounted(() => {
  store.countries = countriesJson
  console.log('Overview mounted -> store:', store.countries, store.mappedCountries)
  console.log('Overview mounted -> json:', countriesJson, countriesJson.countries.length)
  countriesObj.value = countriesJson
})
</script>

<template>
  <div class="flex h-full w-full flex-col items-center justify-center pt-6 pb-6">
    <div class="text-xs text-text-light-secondary dark:text-text-dark-secondary">
      Last Updated: {{ lastUpdated }}
    </div>
    <h1 class="title mb-8 text-4xl">Countries</h1>

    <div class="content flex w-4/5 flex-col items-center justify-center gap-8">
      <ListActions></ListActions>
      <div v-if="store.mappedCountries.length > 0" class="list flex w-full flex-wrap gap-4">
        <!-- <div>Letter</div> -->
        <div class="list-element" v-for="country in store.mappedCountries" :key="country.code">
          <CountryCard :country="country"></CountryCard>
        </div>
      </div>
      <div v-else class="text-text-light-info dark:text-text-dark-info">
        No results for "
        <span class="text-text-light-default dark:text-text-dark-default">
          {{ store.searchTerm }} </span
        >"
      </div>
    </div>
  </div>
</template>

<style scoped></style>
