<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useCountriesStore } from '@/stores/countries'
import { isOfTypeCodes, isOfTypeExampleImages } from '@/models/country.model'
import countriesJson from '@/data/current-license-plates.json'
import IconButton from '@/components/detail/IconButton.vue'
import StarEmpty from '@/assets/icons/StarEmpty.vue'
import StarFilled from '@/assets/icons/StarFilled.vue'
import Loading from '@/components/detail/Loading.vue'
import PageHeader from '@/components/shared/PageHeader.vue'
import EmptyState from '@/components/shared/EmptyState.vue'
import { useDetailsStore } from '@/stores/details'
import DetailCodesContent from '@/components/detail/DetailCodesContent.vue'
import DetailExampleImagesContent from '@/components/detail/DetailExampleImagesContent.vue'
import { getContinentTone, getToneStyle } from '@/constants/continentTone'
import { hasCountryDetailsFile, loadCountryDetails } from '@/utils/countryDetailsLoader'

const route = useRoute()
const countriesStore = useCountriesStore()
const detailsStore = useDetailsStore()

type DetailStatus = 'loading' | 'ready' | 'not-found' | 'error'

const loading = ref(false)
const detailStatus = ref<DetailStatus>('loading')
const countryHasCodes = ref(false)
const formatDescription = ref('')
const detailErrorMessage = ref('')

const countryCode = computed(() => ((route.params.code as string | undefined) ?? '').toLowerCase())

const selectedCountry = computed(() => {
  return countriesStore.countries.countries.find((country) => {
    return country.code.toLowerCase() === countryCode.value
  })
})

const countryName = computed(() => selectedCountry.value?.country ?? 'No country found')
const countryContinent = computed(() => selectedCountry.value?.continent ?? '-')
const countryCodeLabel = computed(() => countryCode.value.toUpperCase() || '-')
const countryMeta = computed(() => `${countryCodeLabel.value} - ${countryContinent.value}`)
const canFavoriteCountry = computed(() => Boolean(selectedCountry.value))

// show detail state in detail title
const detailPageTitle = computed(() => {
  if (detailStatus.value === 'not-found') {
    return 'Country not found'
  }

  if (detailStatus.value === 'error') {
    return selectedCountry.value?.country ?? 'Details unavailable'
  }

  return countryName.value
})

const detailPageMeta = computed(() => {
  if (detailStatus.value === 'not-found') {
    return countryCodeLabel.value
      ? `No plate data found for ${countryCodeLabel.value}`
      : 'Unknown route'
  }

  if (detailStatus.value === 'error' && !selectedCountry.value) {
    return 'The detail route could not be resolved'
  }

  return countryMeta.value
})

const detailEmptyStateTitle = computed(() => {
  if (detailStatus.value === 'not-found') {
    return 'No plate data found for this route'
  }

  return 'Details are unavailable right now'
})

const detailEmptyStateMessage = computed(() => {
  if (detailStatus.value === 'not-found') {
    return 'Check the country code in the URL or return to the overview to choose a valid country'
  }

  return detailErrorMessage.value || 'The detail data could not be loaded, so try again later'
})

const isCountryFavorited = computed(() => countriesStore.isFavorite(countryCode.value))
// keep the button label aligned with the current favorite state
const favoriteButtonLabel = computed(() => {
  return isCountryFavorited.value
    ? `Remove ${countryName.value} from favorites`
    : `Add ${countryName.value} to favorites`
})

const toneStyle = computed(() => {
  return getToneStyle(countryContinent.value)
})

// sync global page tone with active detail tone
function syncGlobalPageTone() {
  document.documentElement.style.setProperty(
    '--atlas-page-tone',
    getContinentTone(countryContinent.value),
  )
}

function ensureCountriesLoaded() {
  if (!countriesStore.countries.countries.length) {
    countriesStore.setCountries(countriesJson)
  }
}

// clear whichever detail branch was rendered for the previous route
function resetDetailContent() {
  formatDescription.value = ''
  countryHasCodes.value = false
  detailsStore.details = []
  detailsStore.exampleImages = []
}

function showNotFoundState() {
  detailStatus.value = 'not-found'
  detailErrorMessage.value = ''
  loading.value = false
  resetDetailContent()
}

function showErrorState(message: string) {
  detailStatus.value = 'error'
  detailErrorMessage.value = message
}

async function loadDetailsFor(code: string) {
  loading.value = true
  detailStatus.value = 'loading'
  detailErrorMessage.value = ''
  resetDetailContent()

  try {
    // reuse the preloaded request when navigation started from the overview
    const countryDetails = await loadCountryDetails(code)

    if (isOfTypeExampleImages(countryDetails)) {
      detailsStore.exampleImages = countryDetails
      countryHasCodes.value = false
      detailStatus.value = 'ready'
      return
    }

    if (isOfTypeCodes(countryDetails)) {
      detailsStore.details = countryDetails.entries
      formatDescription.value = countryDetails.format
      countryHasCodes.value = true
      detailStatus.value = 'ready'
      return
    }

    showErrorState('The detail data format is not supported yet')
  } catch (error) {
    showErrorState('The detail data could not be loaded')
    console.error('failed to load detail json', error)
  } finally {
    loading.value = false
  }
}

function onFavoriteClick() {
  if (!countryCode.value || !selectedCountry.value) {
    return
  }

  countriesStore.toggleFavorite(countryCode.value)
}

// update the shared page tone whenever the resolved country changes
watch(
  countryContinent,
  () => {
    syncGlobalPageTone()
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  document.documentElement.style.removeProperty('--atlas-page-tone')
})

// route flow:
// 1) make sure the country list exists so the route can resolve its metadata
// 2) stop early for invalid codes or countries without a detail file
// 3) hand the code to the shared loader which either starts or reuses the import promise
watch(
  countryCode,
  async (code) => {
    if (!code) {
      showNotFoundState()
      return
    }

    ensureCountriesLoaded()

    if (!selectedCountry.value || !hasCountryDetailsFile(code)) {
      // treat missing data files as explicit not-found states
      showNotFoundState()
      return
    }

    await loadDetailsFor(code)
  },
  { immediate: true },
)
</script>

<template>
  <section class="detail-page -mx-4 min-h-screen px-4 pb-12 sm:-mx-6 sm:px-6" :style="toneStyle">
    <div class="content-shell">
      <div v-if="loading" class="loading-wrap">
        <Loading />
      </div>

      <template v-else>
        <PageHeader :title="detailPageTitle" :meta="detailPageMeta">
          <template #actions>
            <div v-if="canFavoriteCountry" class="favorite-wrap">
              <IconButton
                v-if="isCountryFavorited"
                :icon-component="StarFilled"
                color="#daaa3f"
                :label="favoriteButtonLabel"
                :pressed="true"
                @click="onFavoriteClick"
              />
              <IconButton
                v-else
                :icon-component="StarEmpty"
                color="#9198a1"
                :label="favoriteButtonLabel"
                :pressed="false"
                @click="onFavoriteClick"
              />
            </div>
          </template>
        </PageHeader>

        <DetailCodesContent
          v-if="detailStatus === 'ready' && countryHasCodes"
          :format-description="formatDescription"
        />
        <DetailExampleImagesContent
          v-else-if="detailStatus === 'ready'"
          :country-name="countryName"
        />
        <EmptyState
          v-else
          :title="detailEmptyStateTitle"
          :message="detailEmptyStateMessage"
          aria-live="polite"
        />
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
  margin-top: -3.5rem;
  padding-top: 5rem;
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

@media (max-width: 760px) {
  /* return the page to normal flow when the mobile header scrolls away */
  .detail-page {
    margin-top: 0;
    padding-top: 0.95rem;
  }
}

@media (min-width: 1500px) {
  .content-shell {
    width: min(82rem, 100%);
  }
}
</style>
