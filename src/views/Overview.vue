<script setup lang="ts">
import { computed, onMounted } from 'vue'
import countriesJson from '../data/current-license-plates.json'
import CountryCard from '@/components/overview/CountryCard.vue'
import ListActions from '@/components/overview/ListActions.vue'
import { useCountriesStore } from '@/stores/countries'
import NoResults from '@/components/shared/NoResults.vue'
import { storeToRefs } from 'pinia'

const countriesStore = useCountriesStore()
const { mappedCountriesLength, allCountriesLength, mappedCountries, countries, searchTerm } =
  storeToRefs(countriesStore)

const lastUpdated = computed(() => {
  const date = new Date(countriesStore.countries.lastUpdate)
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
  const formatted = date.toLocaleDateString(undefined, options)
  return formatted
})

onMounted(() => {
  countriesStore.countries = countriesJson
  console.log('Overview mounted -> store:', countries.value, mappedCountries.value)
  console.log('Overview mounted -> json:', countriesJson, countriesJson.countries.length)
})
</script>

<template>
  <div class="flex h-full w-full flex-col items-center justify-center pt-6 pb-6">
    <div class="mb-8 flex flex-col items-center gap-2">
      <h1 class="title text-4xl">Countries</h1>
      <div class="text-base text-text-light-secondary dark:text-text-dark-secondary">
        List of international vehicle registration codes for countries worldwide (last updated:
        {{ lastUpdated }})
      </div>
    </div>

    <div class="content flex w-4/5 flex-col items-center justify-center gap-8">
      <ListActions
        :shown-elements-info="{ current: mappedCountriesLength, total: allCountriesLength }"
        v-model:searchTerm="searchTerm"
      ></ListActions>
      <div
        v-if="countriesStore.mappedCountries.length > 0"
        class="list flex w-full flex-wrap gap-4"
      >
        <!-- <div>Letter</div> -->
        <div class="list-element w-full" v-for="country in mappedCountries" :key="country.code">
          <CountryCard :country="country"></CountryCard>
        </div>
      </div>
      <NoResults v-else />
    </div>
  </div>
</template>

<style scoped></style>
