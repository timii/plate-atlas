<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { RouterLink, useRoute } from 'vue-router'
import Github from '@/assets/icons/Github.vue'
import Info from '@/assets/icons/Info.vue'
import OfflineComplete from '@/assets/icons/OfflineComplete.vue'
import OfflineDownload from '@/assets/icons/OfflineDownload.vue'
import countriesJson from '@/data/current-license-plates.json'
import type { ICountryData } from '@/models/country.model'
import type { IOfflineImageSummary } from '@/pwa/offlineDetailImages'
import {
  downloadableDetailImageCountries,
  getOfflineImageSummary,
} from '@/pwa/offlineDetailImages'
import { useCountriesStore } from '@/stores/countries'
import logo from '@/assets/logo.svg'
import AboutDialog from './AboutDialog.vue'
import OfflineImagesDialog from './OfflineImagesDialog.vue'

type OfflineImageStatus = 'checking' | 'complete' | 'missing' | 'unavailable'

const route = useRoute()
const countriesStore = useCountriesStore()
const { countries } = storeToRefs(countriesStore)
const isAboutOpen = ref(false)
const isOfflineImagesOpen = ref(false)
const showOfflineImagesAction = ref(false)
const offlineImageStatus = ref<OfflineImageStatus>('checking')
const fallbackCountryData: ICountryData = countriesJson
const repositoryUrl = 'https://github.com/timii/plate-atlas'
let mobileMediaQuery: MediaQueryList | null = null

const offlineImagesComplete = computed(() => offlineImageStatus.value === 'complete')
const offlineImagesTitle = computed(() => {
  if (offlineImagesComplete.value) {
    return 'All plate images downloaded'
  }

  if (offlineImageStatus.value === 'checking') {
    return 'Checking offline plate images'
  }

  return 'Offline plate images'
})

const downloadableCountries = computed(() => {
  const sourceCountries =
    countries.value.countries.length > 0 ? countries.value.countries : fallbackCountryData.countries

  return downloadableDetailImageCountries(sourceCountries)
})

function applyOfflineImageSummary(summary: IOfflineImageSummary) {
  if (!summary.cacheAvailable) {
    offlineImageStatus.value = 'unavailable'
    return
  }

  offlineImageStatus.value = summary.missingImages === 0 ? 'complete' : 'missing'
}

function refreshOfflineStatus() {
  offlineImageStatus.value = 'checking'

  getOfflineImageSummary(downloadableCountries.value)
    .then(applyOfflineImageSummary)
    .catch(() => {
      offlineImageStatus.value = 'unavailable'
    })
}

function openAbout() {
  isAboutOpen.value = true
}

function openOfflineImages() {
  isOfflineImagesOpen.value = true
}

function closeAbout() {
  isAboutOpen.value = false
}

function closeOfflineImages() {
  isOfflineImagesOpen.value = false
}

function onOfflineImagesUpdated(summary: IOfflineImageSummary) {
  applyOfflineImageSummary(summary)
}

function syncOfflineImagesAction(event?: MediaQueryListEvent) {
  showOfflineImagesAction.value = event ? event.matches : Boolean(mobileMediaQuery?.matches)

  if (!showOfflineImagesAction.value) {
    isOfflineImagesOpen.value = false
    return
  }

  // mobile-only because desktop users have less need for manual offline image packs
  refreshOfflineStatus()
}

// close the about dialog when navigation changes
watch(
  () => route.fullPath,
  () => {
    isAboutOpen.value = false
    isOfflineImagesOpen.value = false
  },
)

onMounted(() => {
  mobileMediaQuery = window.matchMedia('(max-width: 760px)')
  mobileMediaQuery.addEventListener('change', syncOfflineImagesAction)
  syncOfflineImagesAction()
})

onBeforeUnmount(() => {
  mobileMediaQuery?.removeEventListener('change', syncOfflineImagesAction)
})
</script>

<template>
  <header class="header">
    <div class="header-inner">
      <RouterLink
        class="brand-link"
        to="/overview"
        aria-label="Go to the countries and territories overview"
      >
        <img :src="logo" alt="" class="logo" />
        <span class="title">Plate Atlas</span>
      </RouterLink>

      <div class="header-actions">
        <button
          v-if="showOfflineImagesAction"
          type="button"
          class="icon-link"
          aria-haspopup="dialog"
          aria-controls="offline-images-dialog-panel"
          :aria-expanded="isOfflineImagesOpen"
          aria-label="Manage offline plate images"
          :title="offlineImagesTitle"
          @click="openOfflineImages"
        >
          <OfflineComplete v-if="offlineImagesComplete" />
          <OfflineDownload v-else />
        </button>
        <a
          :href="repositoryUrl"
          class="icon-link"
          target="_blank"
          rel="noreferrer"
          aria-label="Open the Plate Atlas repository on GitHub"
          title="GitHub repository"
        >
          <Github />
        </a>
        <button
          type="button"
          class="icon-link"
          aria-haspopup="dialog"
          aria-controls="about-dialog-panel"
          :aria-expanded="isAboutOpen"
          aria-label="About Plate Atlas"
          title="About Plate Atlas"
          @click="openAbout"
        >
          <Info />
        </button>
      </div>
    </div>
  </header>

  <OfflineImagesDialog
    :open="isOfflineImagesOpen"
    @close="closeOfflineImages"
    @updated="onOfflineImagesUpdated"
  />
  <AboutDialog :open="isAboutOpen" @close="closeAbout" />
</template>

<style scoped>
.header {
  position: static;
  z-index: 50;
  border-bottom: 1px solid color-mix(in oklab, var(--atlas-line) 74%, #0d0a11 26%);
  padding: 0 var(--atlas-page-gutter);
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--atlas-spacing-md);
  width: min(var(--atlas-content-width), 100%);
  min-height: var(--atlas-header-height);
  margin-inline: auto;
  padding: 0;
}

.brand-link {
  display: inline-flex;
  align-items: center;
  gap: var(--atlas-spacing-sm);
  min-width: 0;
  color: inherit;
  text-decoration: none;
}

/* use the active page tone so header focus states match overview and detail contexts */
.brand-link:focus-visible {
  outline: 2px solid color-mix(in oklab, var(--atlas-page-tone, #6f87d9) 64%, var(--atlas-line));
  outline-offset: 4px;
  border-radius: var(--atlas-radius-control);
}

.logo {
  width: 1.9rem;
  height: 1.9rem;
  flex: 0 0 auto;
}

.title {
  color: var(--atlas-text);
  font-size: 0.94rem;
  font-weight: 520;
  letter-spacing: 0.004em;
  white-space: nowrap;
}

.header-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--atlas-spacing-2xs);
  flex: 0 0 auto;
  min-width: 0;
}

.icon-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.4rem;
  height: 2.4rem;
  border: none;
  border-radius: var(--atlas-radius-control);
  background: transparent;
  padding: 0;
  color: color-mix(in oklab, var(--atlas-muted) 88%, #ffffff 12%);
  cursor: pointer;
  transition:
    background-color 160ms ease,
    color 160ms ease;
}

/* keep the hover fill matched to the visible icon button on pointer devices */
@media (hover: hover) and (pointer: fine) {
  .icon-link:hover {
    background: var(--atlas-control-hover);
    color: var(--atlas-text);
  }
}

.icon-link:focus-visible {
  outline: 2px solid color-mix(in oklab, var(--atlas-page-tone, #6f87d9) 64%, var(--atlas-line));
  outline-offset: 3px;
}

.icon-link svg,
.icon-link :deep(svg) {
  width: 1.16rem;
  height: 1.16rem;
}

/* expand the touch target without changing the desktop icon proportions */
@media (hover: none), (pointer: coarse) {
  .icon-link {
    width: var(--atlas-touch-target);
    height: var(--atlas-touch-target);
  }
}

@media (max-width: 760px) {
  .header {
    border-bottom: none;
    padding: 0 var(--atlas-page-gutter-mobile);
  }

  .header-inner {
    min-height: var(--atlas-header-height-mobile);
  }

  .brand-link {
    gap: var(--atlas-spacing-sm);
  }

  .logo {
    width: 1.78rem;
    height: 1.78rem;
  }

  .title {
    font-size: 0.89rem;
  }
}

@media (max-width: 520px) {
  .header-inner {
    gap: var(--atlas-spacing-sm);
  }

  .brand-link {
    gap: var(--atlas-spacing-sm);
  }

  .logo {
    width: 1.68rem;
    height: 1.68rem;
  }

  .title {
    font-size: var(--atlas-text-md);
  }
}

@media (min-width: 1500px) {
  .header-inner {
    width: min(var(--atlas-content-width-wide), 100%);
  }
}
</style>
