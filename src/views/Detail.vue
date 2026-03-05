<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useCountriesStore } from '@/stores/countries'
import { isOfTypeCodes, isOfTypeExampleImages, type ICountryDetails } from '@/models/country.model'
import countriesJson from '@/data/current-license-plates.json'
import IconButton from '@/components/shared/IconButton.vue'
import StarEmpty from '@/assets/icons/StarEmpty.vue'
import StarFilled from '@/assets/icons/StarFilled.vue'
import Loading from '@/components/shared/Loading.vue'
import PageHeader from '@/components/shared/PageHeader.vue'
import { useDetailsStore } from '@/stores/details'
import DetailCodesContent from '@/components/detail/DetailCodesContent.vue'
import DetailExampleImagesContent from '@/components/detail/DetailExampleImagesContent.vue'
import { getToneStyle } from '@/constants/continentTone'

const route = useRoute()
const countriesStore = useCountriesStore()
const detailsStore = useDetailsStore()

const loading = ref(false)
const countryHasCodes = ref(false)
const formatDescription = ref('')

const countryCode = computed(() => ((route.params.code as string | undefined) ?? '').toLowerCase())

const selectedCountry = computed(() => {
  return countriesStore.countries.countries.find((country) => {
    return country.code.toLowerCase() === countryCode.value
  })
})

const countryName = computed(() => selectedCountry.value?.country ?? 'No country found')
const countryContinent = computed(() => selectedCountry.value?.continent ?? '-')
const countryCodeLabel = computed(() => countryCode.value.toUpperCase() || '-')
// keep detail metadata aligned with overview header copy
const countryMeta = computed(() => `${countryCodeLabel.value} - ${countryContinent.value}`)

const isCountryFavorited = computed(() => countriesStore.favorites.includes(countryCode.value))

const toneStyle = computed(() => {
  return getToneStyle(countryContinent.value)
})

function ensureCountriesLoaded() {
  if (!countriesStore.countries.countries.length) {
    countriesStore.setCountries(countriesJson)
  }
}

async function loadDetailsFor(code: string) {
  loading.value = true
  formatDescription.value = ''
  countryHasCodes.value = false
  detailsStore.details = []
  detailsStore.exampleImages = []

  try {
    // dynamically import detail json for the selected country
    const { default: countryDetails } = (await import(`../data/countries/en/${code}.json`)) as {
      default: ICountryDetails
    }

    if (isOfTypeExampleImages(countryDetails)) {
      detailsStore.exampleImages = countryDetails
      countryHasCodes.value = false
      return
    }

    if (isOfTypeCodes(countryDetails)) {
      detailsStore.details = countryDetails.entries
      formatDescription.value = countryDetails.format
      countryHasCodes.value = true
      return
    }
  } catch (error) {
    console.error('failed to load detail json', error)
  } finally {
    loading.value = false
  }
}

function onFavoriteClick() {
  if (!countryCode.value) return

  if (isCountryFavorited.value) {
    const index = countriesStore.favorites.findIndex((el) => el === countryCode.value)
    if (index !== -1) {
      countriesStore.favorites.splice(index, 1)
    }
    return
  }

  countriesStore.favorites.push(countryCode.value)
}

watch(
  countryCode,
  (code) => {
    if (!code) return

    ensureCountriesLoaded()
    void loadDetailsFor(code)
  },
  { immediate: true },
)
</script>

<template>
  <section class="detail-page -mx-4 sm:-mx-6 -mt-14 min-h-screen px-4 sm:px-6 pt-20 pb-12" :style="toneStyle">
    <div class="content-shell">
      <div class="loading-wrap" v-if="loading">
        <Loading />
      </div>

      <template v-else>
        <PageHeader :title="countryName" :meta="countryMeta">
          <template #actions>
            <div class="favorite-wrap">
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
          </template>
        </PageHeader>

        <DetailCodesContent v-if="countryHasCodes" :format-description="formatDescription" />
        <DetailExampleImagesContent v-else :country-name="countryName" />
      </template>
    </div>
  </section>
</template>

<style scoped>
.detail-page {
  --tone: #97a0b5;
  --surface: var(--atlas-surface);
  --surface-2: var(--atlas-surface-2);
  --text: var(--atlas-text);
  --muted: var(--atlas-muted);
  --line: var(--atlas-line);
  background: linear-gradient(165deg, var(--atlas-bg-1), var(--atlas-bg-2));
  color: var(--text);
  padding-bottom: calc(env(safe-area-inset-bottom) + 2.8rem);
}

.content-shell {
  width: min(78rem, 100%);
  margin-inline: auto;
  display: grid;
  gap: 0.9rem;
}

.loading-wrap {
  min-height: 24rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.favorite-wrap {
  display: inline-flex;
}

@media (min-width: 1500px) {
  .content-shell {
    width: min(82rem, 100%);
  }
}
</style>

