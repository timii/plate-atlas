<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, nextTick, ref, watch, onBeforeUnmount } from 'vue'
import Close from '@/assets/icons/Close.vue'
import countriesJson from '@/data/current-license-plates.json'
import type { ICountry, ICountryData } from '@/models/country.model'
import type { ICountryOfflineImageStatus, IOfflineImageSummary } from '@/pwa/offlineDetailImages'
import {
  cacheDetailImageUrls,
  downloadableDetailImageCountries,
  getOfflineImageSummary,
} from '@/pwa/offlineDetailImages'
import { useCountriesStore } from '@/stores/countries'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
  updated: [summary: IOfflineImageSummary]
}>()

type LoadState = 'idle' | 'loading' | 'ready' | 'downloading' | 'error'

const countriesStore = useCountriesStore()
const { countries } = storeToRefs(countriesStore)
const panelRef = ref<HTMLElement | null>(null)
const closeButtonRef = ref<HTMLButtonElement | null>(null)
const previouslyFocusedElement = ref<HTMLElement | null>(null)
const state = ref<LoadState>('idle')
const errorMessage = ref('')
const summary = ref<IOfflineImageSummary | null>(null)
const downloadedCount = ref(0)
const fallbackCountryData: ICountryData = countriesJson
let previousBodyOverflow = ''

const downloadableCountries = computed<ICountry[]>(() => {
  const sourceCountries =
    countries.value.countries.length > 0 ? countries.value.countries : fallbackCountryData.countries

  return downloadableDetailImageCountries(sourceCountries)
})

const missingCountries = computed<ICountryOfflineImageStatus[]>(() => {
  return summary.value?.missingCountries ?? []
})

const missingImageUrls = computed(() => {
  return missingCountries.value.flatMap((country) => country.missingUrls)
})

const progressLabel = computed(() => {
  if (!summary.value) {
    return 'Checking offline images'
  }

  if (!summary.value.cacheAvailable) {
    return 'Offline image storage is unavailable'
  }

  if (summary.value.missingImages === 0) {
    return `${summary.value.countriesWithImages} countries ready for offline image viewing`
  }

  return `${summary.value.missingCountries.length} countries not downloaded yet`
})

const detailLabel = computed(() => {
  if (!summary.value?.cacheAvailable) {
    return 'This browser does not expose image cache storage for the app'
  }

  if (!summary.value) {
    return 'Plate Atlas is comparing local plate images with the offline cache'
  }

  if (summary.value.missingImages === 0) {
    return `${summary.value.totalImages} plate images are already cached`
  }

  return `${summary.value.missingImages} of ${summary.value.totalImages} plate images still need to be downloaded`
})

const canDownload = computed(() => {
  return state.value === 'ready' && missingImageUrls.value.length > 0
})

async function refreshSummary() {
  state.value = 'loading'
  errorMessage.value = ''

  try {
    const nextSummary = await getOfflineImageSummary(downloadableCountries.value)
    summary.value = nextSummary
    state.value = 'ready'
    emit('updated', nextSummary)
  } catch (error) {
    state.value = 'error'
    errorMessage.value = error instanceof Error ? error.message : 'Unable to inspect offline images'
  }
}

async function downloadRemainingImages() {
  if (!canDownload.value) {
    return
  }

  state.value = 'downloading'
  errorMessage.value = ''
  downloadedCount.value = 0

  try {
    await cacheDetailImageUrls(missingImageUrls.value, (count) => {
      downloadedCount.value = count
    })
    await refreshSummary()
  } catch (error) {
    state.value = 'error'
    errorMessage.value = error instanceof Error ? error.message : 'Unable to download plate images'
  }
}

function closeDialog() {
  emit('close')
}

function onDocumentKeydown(event: KeyboardEvent) {
  if (!props.open) {
    return
  }

  if (event.key === 'Escape') {
    event.preventDefault()
    closeDialog()
    return
  }

  if (event.key !== 'Tab' || !panelRef.value) {
    return
  }

  const focusableElements = panelRef.value.querySelectorAll<HTMLElement>(
    'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
  )

  if (focusableElements.length === 0) {
    event.preventDefault()
    panelRef.value.focus()
    return
  }

  const firstFocusable = focusableElements[0]
  const lastFocusable = focusableElements[focusableElements.length - 1]
  const activeElement = document.activeElement

  if (event.shiftKey && activeElement === firstFocusable) {
    event.preventDefault()
    lastFocusable.focus()
    return
  }

  if (!event.shiftKey && activeElement === lastFocusable) {
    event.preventDefault()
    firstFocusable.focus()
  }
}

function onDocumentFocusIn(event: FocusEvent) {
  if (!props.open || !panelRef.value) {
    return
  }

  const target = event.target
  if (target instanceof Node && panelRef.value.contains(target)) {
    return
  }

  closeButtonRef.value?.focus()
}

function addDialogListeners() {
  document.addEventListener('keydown', onDocumentKeydown)
  document.addEventListener('focusin', onDocumentFocusIn)
}

function removeDialogListeners() {
  document.removeEventListener('keydown', onDocumentKeydown)
  document.removeEventListener('focusin', onDocumentFocusIn)
}

watch(
  () => props.open,
  async (open) => {
    if (open) {
      previouslyFocusedElement.value =
        document.activeElement instanceof HTMLElement ? document.activeElement : null
      previousBodyOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      addDialogListeners()
      await refreshSummary()

      await nextTick()
      closeButtonRef.value?.focus()
      return
    }

    document.body.style.overflow = previousBodyOverflow
    removeDialogListeners()

    await nextTick()
    previouslyFocusedElement.value?.focus()
  },
)

onBeforeUnmount(() => {
  document.body.style.overflow = previousBodyOverflow
  removeDialogListeners()
})
</script>

<template>
  <Teleport to="body">
    <Transition name="offline-dialog">
      <div v-if="props.open" class="offline-overlay" @click.self="closeDialog">
        <section
          id="offline-images-dialog-panel"
          ref="panelRef"
          class="offline-panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="offline-images-dialog-title"
          tabindex="-1"
        >
          <header class="offline-head">
            <div class="offline-title-block">
              <h2 id="offline-images-dialog-title" class="offline-title">Offline plate images</h2>
              <p class="offline-subtitle">{{ progressLabel }}</p>
            </div>
            <button
              ref="closeButtonRef"
              type="button"
              class="close-button"
              aria-label="Close offline image dialog"
              @click="closeDialog"
            >
              <Close class="close-icon" />
            </button>
          </header>

          <section class="offline-status" role="status">
            <p>{{ detailLabel }}</p>
            <p v-if="state === 'downloading'" class="download-progress">
              Downloaded {{ downloadedCount }} of {{ missingImageUrls.length }}
            </p>
            <p v-if="state === 'error'" class="error-copy">{{ errorMessage }}</p>
          </section>

          <button
            type="button"
            class="download-button"
            :disabled="!canDownload"
            @click="downloadRemainingImages"
          >
            Download remaining
          </button>

          <section v-if="missingCountries.length > 0" class="missing-section">
            <h3>Not downloaded yet</h3>
            <ul class="missing-list">
              <li v-for="country in missingCountries" :key="country.code" class="missing-item">
                <span class="country-name">{{ country.country }}</span>
                <span class="image-count">{{ country.missingUrls.length }} images</span>
              </li>
            </ul>
          </section>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.offline-overlay {
  position: fixed;
  inset: 0;
  z-index: 90;
  display: grid;
  place-items: center;
  padding: var(--atlas-spacing-md);
  background: var(--atlas-backdrop);
}

.offline-panel {
  width: min(42rem, calc(100vw - 2rem));
  max-height: min(42rem, calc(100dvh - 2rem));
  display: grid;
  grid-template-rows: auto auto auto minmax(0, 1fr);
  gap: var(--atlas-spacing-md);
  overflow: hidden;
  padding: var(--atlas-spacing-md);
  border: 1px solid color-mix(in oklab, var(--atlas-line) 74%, #0b0810 26%);
  border-radius: var(--atlas-radius-panel);
  background: var(--atlas-dialog-bg);
  box-shadow: 0 14px 32px rgba(4, 3, 8, 0.24);
}

.offline-head {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: var(--atlas-spacing-sm);
  padding-bottom: calc(var(--atlas-spacing-xs) + 0.08rem);
  border-bottom: 1px solid color-mix(in oklab, var(--atlas-line) 60%, transparent);
}

.offline-title-block {
  min-width: 0;
  display: grid;
  gap: 0.22rem;
}

.offline-title {
  margin: 0;
  color: var(--atlas-text);
  font-size: clamp(1rem, 0.96rem + 0.24vw, 1.12rem);
  font-weight: 540;
  line-height: 1.2;
}

.offline-subtitle,
.offline-status p {
  margin: 0;
  color: color-mix(in oklab, var(--atlas-text) 76%, var(--atlas-muted));
  font-size: 0.86rem;
  line-height: 1.45;
}

.close-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  margin: -0.12rem -0.12rem 0 0;
  border: none;
  border-radius: var(--atlas-radius-option);
  background: transparent;
  color: color-mix(in oklab, var(--atlas-text) 66%, var(--atlas-muted));
  cursor: pointer;
  transition:
    background-color 160ms ease,
    color 160ms ease;
  flex-shrink: 0;
}

.close-icon {
  width: 0.92rem;
  height: 0.92rem;
  flex: 0 0 auto;
}

.offline-status {
  display: grid;
  gap: var(--atlas-spacing-xs);
}

.download-progress {
  color: var(--atlas-text);
}

.error-copy {
  color: color-mix(in oklab, #f2a3a3 82%, var(--atlas-text));
}

.download-button {
  min-height: 2.45rem;
  justify-self: start;
  border: 1px solid var(--atlas-action-border-subtle);
  border-radius: var(--atlas-radius-control);
  background: color-mix(in oklab, var(--atlas-action-surface-subtle) 76%, transparent);
  color: color-mix(in oklab, var(--atlas-text) 86%, var(--atlas-muted));
  padding: 0.28rem 0.82rem;
  font-size: 0.86rem;
  font-weight: 520;
  cursor: pointer;
  transition:
    border-color 160ms ease,
    color 160ms ease,
    background-color 160ms ease,
    opacity 160ms ease;
}

.download-button:disabled {
  cursor: default;
  opacity: 0.52;
}

.missing-section {
  min-height: 0;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: var(--atlas-spacing-sm);
  overflow: hidden;
  padding-top: var(--atlas-spacing-md);
  border-top: 1px solid color-mix(in oklab, var(--atlas-line) 60%, transparent);
}

.missing-section h3 {
  margin: 0;
  color: color-mix(in oklab, var(--atlas-text) 92%, var(--atlas-muted));
  font-size: 0.88rem;
  font-weight: 540;
  line-height: 1.3;
}

.missing-list {
  min-height: 0;
  display: grid;
  gap: 0;
  overflow-y: auto;
  margin: 0;
  padding: 0;
  list-style: none;
}

.missing-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--atlas-spacing-sm);
  padding: calc(var(--atlas-spacing-sm) - 0.04rem) 0;
  border-bottom: 1px solid color-mix(in oklab, var(--atlas-line) 56%, transparent);
}

.country-name {
  min-width: 0;
  color: var(--atlas-text);
  font-size: 0.92rem;
  line-height: 1.35;
}

.image-count {
  flex-shrink: 0;
  color: color-mix(in oklab, var(--atlas-text) 58%, var(--atlas-muted));
  font-size: 0.78rem;
  line-height: 1.3;
  white-space: nowrap;
}

@media (hover: hover) and (pointer: fine) {
  .close-button:hover,
  .download-button:not(:disabled):hover {
    background: var(--atlas-control-hover);
    color: var(--atlas-text);
  }
}

.close-button:focus-visible,
.download-button:focus-visible {
  outline: 2px solid color-mix(in oklab, var(--atlas-page-tone, #6f87d9) 64%, var(--atlas-line));
  outline-offset: 3px;
}

.offline-dialog-enter-active,
.offline-dialog-leave-active {
  transition: opacity 180ms ease;
}

.offline-dialog-enter-active .offline-panel,
.offline-dialog-leave-active .offline-panel {
  transition:
    transform 180ms ease,
    opacity 180ms ease;
}

.offline-dialog-enter-from,
.offline-dialog-leave-to {
  opacity: 0;
}

.offline-dialog-enter-from .offline-panel,
.offline-dialog-leave-to .offline-panel {
  opacity: 0;
  transform: translateY(10px);
}

@media (hover: none), (pointer: coarse) {
  .close-button {
    width: 2.35rem;
    height: 2.35rem;
    margin: -0.16rem -0.16rem 0 0;
  }

  .download-button {
    min-height: var(--atlas-touch-target);
  }
}

@media (max-width: 640px) {
  .offline-overlay {
    align-items: end;
    padding: var(--atlas-spacing-sm) var(--atlas-spacing-sm)
      calc(var(--atlas-spacing-sm) + env(safe-area-inset-bottom, 0px));
  }

  .offline-panel {
    width: min(100%, 34rem);
    max-height: calc(
      100dvh - var(--atlas-spacing-sm) - var(--atlas-spacing-sm) - env(safe-area-inset-bottom, 0px)
    );
    padding: calc(var(--atlas-spacing-sm) + 0.1rem);
    gap: calc(var(--atlas-spacing-sm) + 0.08rem);
    border-radius: 0.68rem 0.68rem 0.56rem 0.56rem;
  }

  .offline-head {
    padding-bottom: var(--atlas-spacing-xs);
  }

  .offline-subtitle,
  .offline-status p {
    font-size: 0.8rem;
  }

  .download-button {
    width: 100%;
    justify-content: center;
  }
}
</style>
