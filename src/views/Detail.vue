<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import areaCodesJson from '../data/country-area-codes.json'
import { useCountriesStore } from '@/stores/countries'
import countriesJson from '../data/current-license-plates.json'

const route = useRoute()
const countriesStore = useCountriesStore()

const details = ref({})
const countryName = ref('')

onMounted(async () => {
  console.log('onMounted in Detail called -> code:', route.params.code)
  // TODO: dynamically import country details using code (always import test country for testing layout and necessary data fields)
  // TODO: add interface for json
  // TODO: dynamically set language in import
  const imported = await import(`../data/countries/en/${route.params.code}.json`)
  details.value = imported.default
  console.log('onMounted in Detail:', details.value)

  const countryList = countriesStore.countries.countries

  // check if country list is available from store, if not load the full json into the store
  if (!countryList || countryList.length === 0) {
    console.log('No country list found in store, reload json')
    countriesStore.countries = countriesJson
  }

  // get the country name from country list in store
  const foundCountry = countryList.find(
    (country) => country.code.toLowerCase() === route.params.code,
  )
  countryName.value = foundCountry?.country ?? 'No country found'
})
</script>

<template>
  <div>Detail page for {{ $route.params.code }}</div>
  <div>{{ countryName }}</div>
  <div class="sections flex flex-col gap-4">
    <div v-for="detail in details" :key="detail">
      <div>{{ detail }}</div>
    </div>
    <!-- TODO: add component for each area element -->
    <!-- <AreaCard></AreaCard> -->
  </div>
</template>

<style scoped></style>
