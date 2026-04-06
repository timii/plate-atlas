<script setup lang="ts">
import EmptyState from '@/components/shared/EmptyState.vue'
import InfoCard from '@/components/detail/InfoCard.vue'
import type { ICountryDetailExampleImage } from '@/models/country.model'
import { useDetailsStore } from '@/stores/details'
import { pickMirroredAssetUrl } from '@/utils/assetUrl'
import { storeToRefs } from 'pinia'
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'

type ExampleImage = ICountryDetailExampleImage

type PreviewImage = {
  failureKey: string
  localPath: string
  src: string
  title: string
}

const props = defineProps<{
  countryName: string
}>()
const previewTitleId = 'detail-example-preview-title'

const detailsStore = useDetailsStore()
const { exampleImages } = storeToRefs(detailsStore)

const previewImage = ref<PreviewImage | null>(null)
const previewPanelRef = ref<HTMLElement | null>(null)
const previewCloseRef = ref<HTMLButtonElement | null>(null)
const previouslyFocusedEl = ref<HTMLElement | null>(null)
const failedPreviewKeys = ref<Record<string, true>>({})
const failedThumbnailKeys = ref<Record<string, true>>({})
// restore the page scroll state after the preview modal closes
let previousBodyOverflow = ''

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
  return pickMirroredAssetUrl(imageObj.thumbLocal)
}

function previewSource(imageObj: ExampleImage): PreviewImage {
  const localPath = imageObj.fullSizeLocal ?? imageObj.thumbLocal ?? ''

  return {
    failureKey: imageKey(imageObj, 'preview'),
    localPath,
    src: pickMirroredAssetUrl(localPath),
    title: imageTitle(imageObj),
  }
}

// keep detail cards local-only so broken mirrors fall back to the inline placeholder
function hasThumbnailSource(imageObj: ExampleImage): boolean {
  return Boolean(imageObj.thumbLocal) && !failedThumbnailKeys.value[imageKey(imageObj, 'thumb')]
}

function hasPreviewSource(imageObj: PreviewImage): boolean {
  // keep preview overlays local-only so missing mirrors open the modal fallback instead
  return Boolean(imageObj.src) && !failedPreviewKeys.value[imageObj.failureKey]
}

function markFailedImage(
  failedKeys: typeof failedPreviewKeys | typeof failedThumbnailKeys,
  key: string,
) {
  if (failedKeys.value[key]) {
    return
  }

  failedKeys.value = {
    ...failedKeys.value,
    [key]: true,
  }
}

function onThumbnailError(imageObj: ExampleImage) {
  if (!imageObj.thumbLocal) {
    return
  }

  markFailedImage(failedThumbnailKeys, imageKey(imageObj, 'thumb'))
}

function onPreviewError(failureKey: string) {
  if (!previewImage.value?.localPath) {
    return
  }

  markFailedImage(failedPreviewKeys, failureKey)
}

function openPreview(imageObj: ExampleImage) {
  // restore focus to the thumbnail trigger after closing the dialog
  previouslyFocusedEl.value =
    document.activeElement instanceof HTMLElement ? document.activeElement : null
  previewImage.value = previewSource(imageObj)
}

function closePreview() {
  previewImage.value = null
}

function countLabel(count: number): string {
  return count === 1 ? '1 example' : `${count} examples`
}

function formatCategoryHeading(category: string): string {
  const normalized = category.trim()
  const hasUppercase = /[A-Z]/.test(normalized)
  const hasLowercase = /[a-z]/.test(normalized)

  if (!hasUppercase || hasLowercase) {
    return normalized
  }

  const lowered = normalized.toLocaleLowerCase()

  return `${lowered.charAt(0).toLocaleUpperCase()}${lowered.slice(1)}`
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

function addPreviewListeners() {
  document.addEventListener('keydown', onPreviewKeydown)
  document.addEventListener('focusin', onPreviewFocusIn)
}

function removePreviewListeners() {
  document.removeEventListener('keydown', onPreviewKeydown)
  document.removeEventListener('focusin', onPreviewFocusIn)
}

// keep the preview modal lifecycle in one place for scroll lock and focus handoff
watch(previewImage, async (value) => {
  if (value) {
    previousBodyOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    addPreviewListeners()

    await nextTick()
    previewCloseRef.value?.focus()
    return
  }

  document.body.style.overflow = previousBodyOverflow
  removePreviewListeners()

  await nextTick()
  previouslyFocusedEl.value?.focus()
})

onBeforeUnmount(() => {
  document.body.style.overflow = previousBodyOverflow
  removePreviewListeners()
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
          <h2>{{ formatCategoryHeading(imageCategory.category) }}</h2>
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
                <img
                  v-if="hasThumbnailSource(imageObj)"
                  :src="thumbnailSrc(imageObj)"
                  :alt="`Example image for ${imageTitle(imageObj)}`"
                  loading="lazy"
                  @error="onThumbnailError(imageObj)"
                />
                <div v-else class="plate-fallback" aria-hidden="true">
                  <span>Image unavailable</span>
                </div>
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
      <div class="preview-head">
        <p :id="previewTitleId" class="preview-title">{{ previewImage.title }}</p>
        <button
          ref="previewCloseRef"
          type="button"
          class="preview-close"
          aria-label="close preview"
          @click="closePreview"
        >
          Close
        </button>
      </div>
      <div class="preview-media">
        <div v-if="!hasPreviewSource(previewImage)" class="preview-fallback" role="status">
          <strong>Image unavailable</strong>
          <span>The local mirrored image is unavailable</span>
        </div>
        <img
          v-else
          :src="previewImage.src"
          :alt="previewImage.title"
          @error="onPreviewError(previewImage.failureKey)"
        />
      </div>
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
  gap: var(--atlas-spacing-md);
}

.group {
  border: 1px solid color-mix(in oklab, var(--line) 72%, #09070d 28%);
  border-radius: 0.52rem;
  background: color-mix(in oklab, var(--atlas-panel-bg) 64%, transparent);
  padding: calc(var(--atlas-spacing-sm) - 0.04rem) var(--atlas-spacing-sm);
  display: grid;
  gap: calc(var(--atlas-spacing-sm) - 0.04rem);
}

.group-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--atlas-spacing-sm);
  border-bottom: 1px solid color-mix(in oklab, var(--line) 54%, transparent);
  padding-bottom: calc(var(--atlas-spacing-sm) - 0.12rem);
}

.group-head h2 {
  margin: 0;
  font-size: clamp(0.88rem, 0.84rem + 0.18vw, 0.96rem);
  font-weight: 520;
  letter-spacing: 0;
  color: color-mix(in oklab, var(--text) 92%, var(--muted));
  line-height: 1.3;
  min-width: 0;
}

.group-count {
  margin: 0;
  font-size: 0.72rem;
  color: color-mix(in oklab, var(--text) 44%, var(--muted));
  line-height: 1.2;
  white-space: nowrap;
  flex-shrink: 0;
}

.samples {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
  gap: var(--atlas-spacing-sm);
}

.samples--single {
  grid-template-columns: minmax(0, 1fr);
}

.samples--single .sample {
  max-width: min(36rem, 100%);
  justify-self: start;
}

.sample {
  border: 1px solid color-mix(in oklab, var(--line) 78%, #0c0910 22%);
  border-radius: 0.5rem;
  background: color-mix(in oklab, var(--surface) 88%, #17121f 12%);
  overflow: hidden;
  align-self: start;
  transition:
    border-color 160ms ease,
    background-color 160ms ease,
    box-shadow 180ms ease;
}

.sample:hover {
  border-color: color-mix(in oklab, var(--tone, #97a0b5) 56%, var(--line));
  background: color-mix(in oklab, var(--surface) 84%, #1d1527 16%);
  box-shadow: 0 5px 12px rgba(0, 0, 0, 0.1);
}

.sample-hit {
  display: flex;
  flex-direction: column;
  width: 100%;
  border: none;
  border-radius: inherit;
  background: transparent;
  padding: 0;
  text-align: left;
  cursor: pointer;
  color: inherit;
}

.sample-hit:focus-visible {
  outline: none;
}

@supports selector(.sample:has(.sample-hit:focus-visible)) {
  .sample:has(.sample-hit:focus-visible) {
    border-color: color-mix(in oklab, var(--tone, #97a0b5) 62%, var(--line));
    box-shadow:
      0 0 0 1px color-mix(in oklab, var(--tone, #97a0b5) 58%, var(--line)),
      0 5px 12px rgba(0, 0, 0, 0.1);
  }
}

@supports not selector(.sample:has(.sample-hit:focus-visible)) {
  .sample:focus-within {
    border-color: color-mix(in oklab, var(--tone, #97a0b5) 62%, var(--line));
    box-shadow:
      0 0 0 1px color-mix(in oklab, var(--tone, #97a0b5) 58%, var(--line)),
      0 5px 12px rgba(0, 0, 0, 0.1);
  }
}

.plate-wrap {
  border-bottom: 1px solid color-mix(in oklab, var(--line) 74%, transparent);
  background: color-mix(in oklab, var(--surface-2) 82%, #1b1522 18%);
  height: 7rem;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--atlas-spacing-sm);
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
  border: 1px dashed color-mix(in oklab, var(--line) 74%, #ffffff 26%);
  border-radius: var(--atlas-radius-option);
  background: color-mix(in oklab, var(--surface) 96%, #0b0a12 4%);
  color: var(--muted);
  display: grid;
  place-items: center;
  text-align: center;
  padding: var(--atlas-spacing-sm);
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
  padding: var(--atlas-spacing-sm) var(--atlas-spacing-sm) var(--atlas-spacing-sm);
  font-size: 0.78rem;
  line-height: 1.28;
  color: color-mix(in oklab, var(--text) 92%, var(--muted));
  overflow-wrap: anywhere;
}

.preview-backdrop {
  position: fixed;
  inset: 0;
  z-index: 80;
  background: var(--atlas-backdrop);
  display: grid;
  place-items: center;
  padding: var(--atlas-spacing-md);
}

.preview-panel {
  width: min(46rem, calc(100vw - 2rem));
  border: 1px solid color-mix(in oklab, var(--line) 72%, #0b0810 28%);
  border-radius: var(--atlas-radius-panel);
  background: color-mix(in oklab, var(--atlas-panel-bg) 92%, #100c14 8%);
  box-shadow: 0 14px 28px rgba(3, 2, 7, 0.22);
  padding: calc(var(--atlas-spacing-sm) - 0.04rem);
  display: grid;
  gap: calc(var(--atlas-spacing-sm) - 0.04rem);
}

.preview-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--atlas-spacing-sm);
  border-bottom: 1px solid color-mix(in oklab, var(--line) 56%, transparent);
  padding-bottom: var(--atlas-spacing-xs);
}

.preview-title {
  margin: 0;
  min-width: 0;
  font-size: 0.82rem;
  font-weight: 500;
  line-height: 1.32;
  color: color-mix(in oklab, var(--text) 90%, var(--muted));
  overflow-wrap: anywhere;
}

.preview-close {
  min-height: 2rem;
  border: 1px solid var(--atlas-action-border-subtle);
  border-radius: var(--atlas-radius-control);
  background: color-mix(in oklab, var(--atlas-action-surface-subtle) 76%, transparent);
  color: color-mix(in oklab, var(--text) 74%, var(--muted));
  font-size: 0.76rem;
  font-weight: 500;
  letter-spacing: 0;
  padding: 0.22rem 0.68rem;
  justify-self: end;
  cursor: pointer;
  transition:
    border-color 160ms ease,
    color 160ms ease,
    background-color 160ms ease;
  flex-shrink: 0;
}

.preview-close:hover {
  border-color: color-mix(in oklab, var(--tone, #97a0b5) 48%, var(--line));
  color: var(--text);
  background: color-mix(in oklab, var(--atlas-action-surface-subtle) 92%, var(--surface));
}

.preview-close:active {
  border-color: color-mix(in oklab, var(--tone, #97a0b5) 54%, var(--line));
  background: color-mix(in oklab, var(--atlas-action-surface-subtle) 84%, var(--surface));
}

.preview-close:focus-visible {
  outline: none;
  border-color: color-mix(in oklab, var(--tone, #97a0b5) 62%, var(--line));
  box-shadow: inset 0 0 0 1px color-mix(in oklab, var(--tone, #97a0b5) 56%, var(--line));
}

/* expand the touch target without inflating the desktop button shape */
@media (hover: none), (pointer: coarse) {
  .preview-close {
    min-height: var(--atlas-touch-target);
  }
}

.preview-panel img {
  display: block;
  width: 100%;
  max-height: min(70vh, 34rem);
  object-fit: contain;
}

.preview-media {
  border-radius: 0.5rem;
  background: color-mix(in oklab, var(--surface-2) 90%, #08070d 10%);
  overflow: hidden;
  padding: 0;
}

.preview-fallback {
  min-height: 16rem;
  gap: var(--atlas-spacing-xs);
}

.preview-fallback strong {
  color: var(--text);
  font-size: 0.94rem;
}

.preview-fallback span {
  font-size: 0.82rem;
  line-height: 1.4;
}

@media (min-width: 980px) {
  .samples {
    grid-template-columns: repeat(auto-fit, minmax(15.5rem, 1fr));
    gap: var(--atlas-spacing-sm);
  }

  .group {
    padding: calc(var(--atlas-spacing-sm) - 0.02rem) var(--atlas-spacing-sm);
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
    gap: var(--atlas-spacing-sm);
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
    font-size: 0.84rem;
  }

  .preview-backdrop {
    padding: calc(var(--atlas-spacing-sm) + 0.1rem);
  }

  .preview-panel {
    width: min(100%, calc(100vw - 1.2rem));
    padding: calc(var(--atlas-spacing-sm) - 0.08rem);
    gap: calc(var(--atlas-spacing-sm) - 0.08rem);
  }

  .preview-head {
    gap: calc(var(--atlas-spacing-xs) + 0.1rem);
    padding-bottom: calc(var(--atlas-spacing-xs) - 0.02rem);
  }

  .preview-media {
    padding: 0;
  }

  .preview-panel img {
    max-height: min(64vh, 28rem);
  }
}

@media (max-width: 560px) {
  .group-head {
    flex-wrap: nowrap;
    align-items: center;
    gap: var(--atlas-spacing-sm);
  }

  .group-head h2 {
    flex: 1 1 auto;
    min-width: 0;
    font-size: 0.82rem;
  }

  .group-count {
    margin-left: 0;
    font-size: var(--atlas-text-xxs);
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

  .preview-head {
    align-items: center;
    gap: var(--atlas-spacing-xs);
  }

  .preview-title {
    font-size: 0.8rem;
    line-height: 1.28;
    padding-top: 0;
  }

  .preview-close {
    min-height: 2.2rem;
    padding-inline: 0.74rem;
  }

  .preview-panel {
    width: calc(100vw - 1rem);
    padding: calc(var(--atlas-spacing-xs) + 0.14rem);
    gap: calc(var(--atlas-spacing-xs) + 0.14rem);
  }

  .preview-backdrop {
    padding: 0.5rem;
  }

  .preview-media {
    border-radius: 0.44rem;
  }

  .preview-panel img {
    max-height: min(58vh, 22rem);
  }
}
</style>
