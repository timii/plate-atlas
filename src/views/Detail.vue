<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useCountriesStore } from '@/stores/countries'
import { isOfTypeCodes, isOfTypeExampleImages, type ICountryDetails } from '@/models/country.model'
import countriesJson from '../data/current-license-plates.json'
import IconButton from '@/components/shared/IconButton.vue'
import StarEmpty from '@/assets/icons/StarEmpty.vue'
import StarFilled from '@/assets/icons/StarFilled.vue'
import Loading from '@/components/shared/Loading.vue'
import { useDetailsStore } from '@/stores/details'
import DetailCodesContent from '@/components/detail/DetailCodesContent.vue'
import DetailExampleImagesContent from '@/components/detail/DetailExampleImagesContent.vue'

const route = useRoute()
const countriesStore = useCountriesStore()
const detailsStore = useDetailsStore()

const countryName = ref('')
const loading = ref(false)
const countryHasCodes = ref(false)
const formatDescription = ref('')

const countryCode = computed(() => (route.params.code as string) ?? '')

const isCountryFavorited = computed(() => countriesStore.favorites.includes(countryCode.value))

function loadCountryName() {
  console.log('onMounted in Detail -> countries', countriesStore.countries.countries)

  const countryList = countriesStore.countries.countries

  // check if country list is available in store, if not load the full json into the store.
  // included for cases when detail page is opened directly without navigating from overview page,
  // where the country list is loaded into the store
  if (!countryList || countryList.length === 0) {
    console.log('No country list found in store, reload json')
    countriesStore.countries = countriesJson
    console.log('Countries after reload:', countriesStore.countries.countries)
  }

  // get the country name from country list in store
  const foundCountry = countryList.find(
    (country) => country.code.toLowerCase() === route.params.code,
  )
  countryName.value = foundCountry?.country ?? 'No country found'
}

async function loadDetails() {
  console.log('onMounted in Detail called -> code:', route.params.code)

  try {
    formatDescription.value = ''

    // TODO: dynamically set language in import
    // dynamically import the country json using the country code
    const { default: countryDetails } = (await import(
      `../data/countries/en/${route.params.code}.json`
    )) as { default: ICountryDetails }

    console.log('onMounted in Detail:', countryDetails)

    // depending on the type of country details, set the store values accordingly
    if (isOfTypeExampleImages(countryDetails)) {
      detailsStore.exampleImages = countryDetails
      countryHasCodes.value = false
      formatDescription.value = ''
    } else if (isOfTypeCodes(countryDetails)) {
      detailsStore.details = countryDetails.entries
      countryHasCodes.value = true
      formatDescription.value = countryDetails.format
    } else {
      console.error('Country details are of unknown type')
    }
  } catch (error) {
    console.log('Error importing detail json:', error)
  }
}

// TODO: save/read favorites in localStorage
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

onMounted(async () => {
  loading.value = true

  loadCountryName()
  await loadDetails()

  loading.value = false
})
</script>

<template>
  <div class="flex h-96 w-full items-center justify-center" v-if="loading">
    <Loading />
  </div>
  <div v-else class="flex h-full w-full flex-col items-center justify-center pt-6 pb-6">
    <div class="relative mt-4 mb-8 flex w-4/5 items-center justify-between">
      <!-- empty div so "justify-between" centers the country name -->
      <div class="w-8"></div>
      <h1 class="title text-4xl">{{ countryName }}</h1>
      <div>
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

    <DetailCodesContent v-if="countryHasCodes" :format-description="formatDescription" />

    <DetailExampleImagesContent v-else :country-name="countryName" />
  </div>
</template>

<style scoped></style>
