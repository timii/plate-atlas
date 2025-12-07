<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
// import areaCodesJson from '../data/country-area-codes.json'
import { useCountriesStore } from '@/stores/countries'
import type { ICountryDetail } from '@/models/country.model'
import countriesJson from '../data/current-license-plates.json'
import RegionCard from '@/components/detail/RegionCard.vue'
import IconButton from '@/components/shared/IconButton.vue'
import ListActions from '@/components/overview/ListActions.vue'
import NoResults from '@/components/shared/NoResults.vue'
import StarEmpty from '@/assets/icons/StarEmpty.vue'
import StarFilled from '@/assets/icons/StarFilled.vue'

const route = useRoute()
const countriesStore = useCountriesStore()

const details = ref<ICountryDetail[]>([])
const countryName = ref('')

const countryCode = computed(() => (route.params.code as string) ?? '')

const isCountryFavorited = computed(() => countriesStore.favorites.includes(countryCode.value))

onMounted(async () => {
  console.log('onMounted in Detail called -> code:', route.params.code)
  // TODO: dynamically import country details using code (always import test country for testing layout and necessary data fields)
  // TODO: add interface for json
  // details.value = areaCodesJson[route.params.code as string]

  try {
    // TODO: dynamically set language in import
    // dynamically import the country json using the country code
    const { default: countryDetails } = (await import(
      `../data/countries/en/${route.params.code}.json`
    )) as { default: ICountryDetail[] }

    details.value = countryDetails
  } catch (error) {
    console.log('Error importing detail json:', error)
  }

  console.log('onMounted in Detail:', details.value)
  console.log('onMounted in Detail -> countries', countriesStore.countries.countries)

  const countryList = countriesStore.countries.countries

  // check if country list is available in store, if not load the full json into the store.
  // included for cases when detail page is opened directly without navigating from overview page,
  // where the country list is loaded into the store
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

function onFavoriteClick() {
  if (isCountryFavorited.value) {
    // find and remove country code from favorites
    const index = countriesStore.favorites.findIndex((el) => el === countryCode.value)
    if (index === -1) return
    countriesStore.favorites.splice(index, 1)
  } else {
    // add country code to favorites
    countriesStore.favorites.push(countryCode.value)
  }
}
</script>

<template>
  <div class="flex h-full w-full flex-col items-center justify-center pt-6 pb-6">
    <div class="relative mt-4 mb-8 flex w-4/5 items-end justify-center">
      <h1 class="title text-4xl">{{ countryName }}</h1>
      <div class="absolute right-0 flex">
        <IconButton
          v-if="isCountryFavorited"
          :icon-component="StarFilled"
          :color="{
            darkMode: '#daaa3f',
            lightMode: '#daaa3f',
          }"
          @click="onFavoriteClick"
        />
        <IconButton
          v-else
          :icon-component="StarEmpty"
          :color="{
            darkMode: '#9198a1',
            lightMode: '#59636e',
          }"
          @click="onFavoriteClick"
        />
      </div>
    </div>

    <div class="content flex w-4/5 flex-col items-center justify-center gap-8">
      <ListActions></ListActions>
      <div v-if="details && details.length > 0" class="list flex w-full flex-wrap gap-4">
        <div class="list-element" v-for="detail in details" :key="detail.code">
          <RegionCard :region="detail" />
        </div>
      </div>
      <NoResults v-else />
    </div>
  </div>
</template>

<style scoped></style>
