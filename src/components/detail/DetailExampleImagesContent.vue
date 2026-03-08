<script setup lang="ts">
import EmptyState from '@/components/shared/EmptyState.vue'
import InfoCard from '@/components/detail/InfoCard.vue'
import type { ICountryDetailExampleImage } from '@/models/country.model'
import { useDetailsStore } from '@/stores/details'
import { pickPreferredStaticAssetUrl } from '@/utils/assetUrl'
import { storeToRefs } from 'pinia'
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'

type ExampleImage = ICountryDetailExampleImage

type PreviewImage = {
  failureKey: string
  fallbackSrc: string
  src: string
  title: string
}

let previewIdCounter = 0

const props = defineProps<{
  countryName: string
}>()

const detailsStore = useDetailsStore()
const { exampleImages } = storeToRefs(detailsStore)

const previewImage = ref<PreviewImage | null>(null)
const previewPanelRef = ref<HTMLElement | null>(null)
const previewCloseRef = ref<HTMLButtonElement | null>(null)
const previouslyFocusedEl = ref<HTMLElement | null>(null)
const failedPreviewImages = ref<Record<string, true>>({})
const failedThumbnailImages = ref<Record<string, true>>({})
const previewTitleId = `example-preview-title-${++previewIdCounter}`

const countryNameInSentence = computed(() => {
  return props.countryName === 'No country found' ? 'this country' : props.countryName
})

function imageTitle(imageObj: ExampleImage): string {
  return imageObj.title || 'Plate sample'
}

function imageKey(imageObj: ExampleImage, variant: 'preview' | 'thumb'): string {
  return `${variant}:${imageObj.url}`
}

function thumbnailSrc(imageObj: ExampleImage): string {
  return pickPreferredStaticAssetUrl(imageObj.thumbLocal, imageObj.url)
}

function thumbnailFallbackSrc(imageObj: ExampleImage): string {
  return imageObj.thumbLocal ? imageObj.url : ''
}

function previewSource(imageObj: ExampleImage): PreviewImage {
  return {
    failureKey: imageKey(imageObj, 'preview'),
    fallbackSrc: imageObj.fullSizeLocal || imageObj.thumbLocal ? imageObj.url : '',
    src: pickPreferredStaticAssetUrl(imageObj.fullSizeLocal ?? imageObj.thumbLocal, imageObj.url),
    title: imageTitle(imageObj),
  }
}

function hasPreviewFailed(imageObj: PreviewImage): boolean {
  return !!failedPreviewImages.value[imageObj.failureKey]
}

function hasThumbnailFailed(imageObj: ExampleImage): boolean {
  return !!failedThumbnailImages.value[imageKey(imageObj, 'thumb')]
}

function markPreviewImageFailed(key: string) {
  if (failedPreviewImages.value[key]) {
    return
  }

  failedPreviewImages.value = {
    ...failedPreviewImages.value,
    [key]: true,
  }
}

function markThumbnailImageFailed(key: string) {
  if (failedThumbnailImages.value[key]) {
    return
  }

  failedThumbnailImages.value = {
    ...failedThumbnailImages.value,
    [key]: true,
  }
}

function tryFallbackImage(event: Event): boolean {
  const target = event.target
  if (!(target instanceof HTMLImageElement)) {
    return false
  }

  const fallbackSrc = target.dataset.fallbackSrc
  if (
    !fallbackSrc ||
    target.getAttribute('src') === fallbackSrc ||
    target.currentSrc === fallbackSrc
  ) {
    return false
  }

  target.src = fallbackSrc
  target.dataset.fallbackSrc = ''
  return true
}

function onThumbnailError(event: Event, imageObj: ExampleImage) {
  if (tryFallbackImage(event)) {
    return
  }

  markThumbnailImageFailed(imageKey(imageObj, 'thumb'))
}

function onPreviewError(event: Event, failureKey: string) {
  if (tryFallbackImage(event)) {
    return
  }

  markPreviewImageFailed(failureKey)
}

function openPreview(imageObj: ExampleImage) {
  // restore focus to the thumbnail trigger after closing the dialog
  previouslyFocusedEl.value =
    document.activeElement instanceof HTMLElement ? document.activeElement : null
  previewImage.value = previewSource(imageObj)

  nextTick(() => {
    previewCloseRef.value?.focus()
  })
}

function closePreview() {
  previewImage.value = null

  nextTick(() => {
    previouslyFocusedEl.value?.focus()
  })
}

function countLabel(count: number): string {
  return count === 1 ? '1 example' : `${count} examples`
}

function onPreviewKeydown(event: KeyboardEvent) {
  if (!previewImage.value) {
    return
  }

  if (event.key === 'Escape') {
    event.preventDefault()
    closePreview()
    return
  }

  if (event.key !== 'Tab' || !previewPanelRef.value) {
    return
  }

  // keep tab focus inside the preview dialog
  const focusableElements = previewPanelRef.value.querySelectorAll<HTMLElement>(
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
  )

  if (focusableElements.length === 0) {
    event.preventDefault()
    previewPanelRef.value.focus()
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

function onPreviewFocusIn(event: FocusEvent) {
  if (!previewImage.value || !previewPanelRef.value) {
    return
  }

  const target = event.target
  if (target instanceof Node && previewPanelRef.value.contains(target)) {
    return
  }

  // move focus back if something outside the dialog gets it
  previewCloseRef.value?.focus()
}

watch(previewImage, (value) => {
  if (value) {
    document.addEventListener('keydown', onPreviewKeydown)
    document.addEventListener('focusin', onPreviewFocusIn)
    return
  }

  document.removeEventListener('keydown', onPreviewKeydown)
  document.removeEventListener('focusin', onPreviewFocusIn)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onPreviewKeydown)
  document.removeEventListener('focusin', onPreviewFocusIn)
})
</script>

<template>
  <section class="detail-examples">
    <InfoCard title="Plate format">
      <p>
        License plates in {{ countryNameInSentence }} do not include region-specific codes; the
        examples below show common plate formats.
      </p>
    </InfoCard>

    <template v-if="exampleImages && exampleImages.length > 0">
      <section v-for="imageCategory in exampleImages" :key="imageCategory.category" class="group">
        <header class="group-head">
          <h2>{{ imageCategory.category }}</h2>
          <p class="group-count">{{ countLabel(imageCategory.images.length) }}</p>
        </header>

        <div class="samples" :class="{ 'samples--single': imageCategory.images.length === 1 }">
          <figure v-for="imageObj in imageCategory.images" :key="imageObj.url" class="sample">
            <button
              type="button"
              class="sample-hit"
              :aria-label="`Open preview for ${imageTitle(imageObj)}`"
              @click="openPreview(imageObj)"
            >
              <div class="plate-wrap">
                <div v-if="hasThumbnailFailed(imageObj)" class="plate-fallback" aria-hidden="true">
                  <span>Image unavailable</span>
                </div>
                <img
                  v-else
                  :src="thumbnailSrc(imageObj)"
                  :data-fallback-src="thumbnailFallbackSrc(imageObj)"
                  :alt="`Example image for ${imageTitle(imageObj)}`"
                  loading="lazy"
                  @error="onThumbnailError($event, imageObj)"
                />
              </div>
              <span class="sample-caption">{{ imageTitle(imageObj) }}</span>
            </button>
          </figure>
        </div>
      </section>
    </template>

    <EmptyState
      v-else
      title="No examples available"
      message="There are currently no preview images for this country"
    />
  </section>

  <div
    v-if="previewImage"
    class="preview-backdrop"
    role="dialog"
    aria-modal="true"
    :aria-labelledby="previewTitleId"
    @click.self="closePreview"
  >
    <div ref="previewPanelRef" class="preview-panel" tabindex="-1">
      <button
        ref="previewCloseRef"
        type="button"
        class="preview-close"
        aria-label="close preview"
        @click="closePreview"
      >
        close
      </button>
      <div v-if="hasPreviewFailed(previewImage)" class="preview-fallback" role="status">
        <strong>Image unavailable</strong>
        <span>The original source could not be loaded</span>
      </div>
      <img
        v-else
        :src="previewImage.src"
        :data-fallback-src="previewImage.fallbackSrc"
        :alt="previewImage.title"
        @error="onPreviewError($event, previewImage.failureKey)"
      />
      <p :id="previewTitleId">{{ previewImage.title }}</p>
    </div>
  </div>
</template>

<style scoped>
.detail-examples {
  --surface: var(--atlas-surface);
  --surface-2: var(--atlas-surface-2);
  --text: var(--atlas-text);
  --muted: var(--atlas-muted);
  --line: var(--atlas-line);
  width: 100%;
  display: grid;
  gap: 0.86rem;
}

.group {
  border: 1px solid color-mix(in oklab, var(--line) 82%, #ffffff 18%);
  border-radius: 0.56rem;
  background: color-mix(in oklab, var(--surface) 92%, #07060d 8%);
  padding: 0.72rem;
  display: grid;
  gap: 0.72rem;
}

.group-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.7rem;
  border-bottom: 1px solid color-mix(in oklab, var(--line) 86%, #ffffff 14%);
  padding-bottom: 0.52rem;
}

.group-head h2 {
  margin: 0;
  font-size: clamp(0.82rem, 0.78rem + 0.18vw, 0.9rem);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--text);
  line-height: 1.3;
  min-width: 0;
}

.group-count {
  margin: 0;
  font-size: 0.7rem;
  border: 1px solid color-mix(in oklab, var(--line) 82%, #ffffff 18%);
  border-radius: 999px;
  background: color-mix(in oklab, var(--surface) 90%, #ffffff 10%);
  color: var(--muted);
  padding: 0.12rem 0.48rem;
  line-height: 1.1;
  white-space: nowrap;
  flex-shrink: 0;
}

.samples {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
  gap: 0.58rem;
}

.samples--single {
  grid-template-columns: minmax(0, 1fr);
}

.samples--single .sample {
  max-width: min(36rem, 100%);
  justify-self: start;
}

.sample {
  border: 1px solid color-mix(in oklab, var(--line) 66%, #ffffff 34%);
  border-radius: 0.5rem;
  background: color-mix(in oklab, var(--surface) 94%, #07060e 6%);
  overflow: hidden;
  align-self: start;
  transition:
    border-color 160ms ease,
    box-shadow 180ms ease;
}

.sample:hover {
  border-color: color-mix(in oklab, var(--tone, #97a0b5) 54%, var(--line));
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.16);
}

.sample-hit {
  display: flex;
  flex-direction: column;
  width: 100%;
  border: none;
  background: transparent;
  padding: 0;
  text-align: left;
  cursor: pointer;
  color: inherit;
}

.sample-hit:focus-visible {
  outline: none;
}

.sample:focus-within {
  border-color: color-mix(in oklab, var(--tone, #97a0b5) 66%, var(--line));
  box-shadow:
    0 0 0 1px color-mix(in oklab, var(--tone, #97a0b5) 62%, var(--line)),
    0 8px 18px rgba(0, 0, 0, 0.16);
}

.plate-wrap {
  border-bottom: 1px solid color-mix(in oklab, var(--line) 70%, #ffffff 30%);
  background: color-mix(in oklab, var(--surface-2) 88%, #09080f 12%);
  height: 7rem;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.42rem;
}

.samples--single .plate-wrap {
  height: 8.4rem;
}

.plate-wrap img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.plate-fallback,
.preview-fallback {
  width: 100%;
  height: 100%;
  border: 1px dashed color-mix(in oklab, var(--line) 70%, #ffffff 30%);
  border-radius: 0.34rem;
  background: color-mix(in oklab, var(--surface) 92%, #0b0a12 8%);
  color: var(--muted);
  display: grid;
  place-items: center;
  text-align: center;
  padding: 0.75rem;
}

.plate-fallback span {
  font-size: 0.78rem;
  line-height: 1.3;
}

.sample-caption {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 2.6rem;
  padding: 0.44rem 0.5rem 0.54rem;
  font-size: 0.78rem;
  line-height: 1.28;
  color: color-mix(in oklab, var(--text) 92%, var(--muted));
  overflow-wrap: anywhere;
}

.preview-backdrop {
  position: fixed;
  inset: 0;
  z-index: 80;
  background: rgba(6, 6, 10, 0.74);
  backdrop-filter: blur(2px);
  display: grid;
  place-items: center;
  padding: 1rem;
}

.preview-panel {
  width: min(52rem, 100%);
  border: 1px solid color-mix(in oklab, var(--line) 80%, #ffffff 20%);
  border-radius: 0.64rem;
  background: color-mix(in oklab, var(--surface, #100f18) 92%, #05060b 8%);
  box-shadow: 0 20px 44px rgba(0, 0, 0, 0.46);
  padding: 0.7rem;
  display: grid;
  gap: 0.56rem;
}

.preview-close {
  border: 1px solid color-mix(in oklab, var(--line) 84%, #ffffff 16%);
  border-radius: 0.4rem;
  background: transparent;
  color: var(--muted);
  font-size: 0.74rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 0.26rem 0.46rem;
  justify-self: end;
  cursor: pointer;
  transition:
    border-color 160ms ease,
    color 160ms ease,
    background-color 160ms ease,
    transform 120ms ease;
}

.preview-close:hover {
  border-color: color-mix(in oklab, var(--tone, #97a0b5) 58%, #ffffff 42%);
  color: var(--text);
  background: color-mix(in oklab, var(--surface-2) 78%, #ffffff 22%);
}

.preview-close:active {
  border-color: color-mix(in oklab, var(--tone, #97a0b5) 68%, #ffffff 32%);
  background: color-mix(in oklab, var(--surface-2) 70%, #ffffff 30%);
}

.preview-close:focus-visible {
  outline: none;
  border-color: color-mix(in oklab, var(--tone, #97a0b5) 62%, var(--line));
  box-shadow: inset 0 0 0 1px color-mix(in oklab, var(--tone, #97a0b5) 56%, var(--line));
}

.preview-panel img {
  width: 100%;
  max-height: 70vh;
  object-fit: contain;
}

.preview-fallback {
  min-height: 16rem;
  gap: 0.35rem;
}

.preview-fallback strong {
  color: var(--text);
  font-size: 0.94rem;
}

.preview-fallback span {
  font-size: 0.82rem;
  line-height: 1.4;
}

.preview-panel p {
  margin-top: 0.5rem;
  color: var(--text);
  font-size: 0.86rem;
  line-height: 1.34;
}

@media (min-width: 980px) {
  .samples {
    grid-template-columns: repeat(auto-fit, minmax(15.5rem, 1fr));
    gap: 0.62rem;
  }

  .group {
    padding: 0.78rem;
  }

  .plate-wrap {
    height: 7.4rem;
  }

  .samples--single .plate-wrap {
    height: 9rem;
  }
}

@media (max-width: 760px) {
  .samples {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.48rem;
  }

  .samples--single {
    grid-template-columns: minmax(0, 1fr);
  }

  .samples--single .sample {
    max-width: 100%;
  }

  .plate-wrap {
    height: 6.6rem;
  }

  .samples--single .plate-wrap {
    height: 7.7rem;
  }

  .sample-caption {
    min-height: 2.4rem;
  }

  .group-head h2 {
    font-size: 0.8rem;
  }
}

@media (max-width: 560px) {
  .group-head {
    flex-wrap: nowrap;
    align-items: center;
    gap: 0.45rem;
  }

  .group-head h2 {
    flex: 1 1 auto;
    min-width: 0;
    font-size: 0.76rem;
    letter-spacing: 0.03em;
  }

  .group-count {
    margin-left: 0;
    font-size: 0.66rem;
    padding: 0.1rem 0.38rem;
  }

  .samples {
    grid-template-columns: minmax(0, 1fr);
  }

  .plate-wrap {
    height: 7.2rem;
  }

  .samples--single .plate-wrap {
    height: 7.9rem;
  }
}
</style>
