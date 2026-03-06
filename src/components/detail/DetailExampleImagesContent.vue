<script setup lang="ts">
import EmptyState from '@/components/shared/EmptyState.vue'
import InfoCard from '@/components/detail/InfoCard.vue'
import type { ICountryDetailExampleImages } from '@/models/country.model'
import { useDetailsStore } from '@/stores/details'
import { storeToRefs } from 'pinia'
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'

type ExampleImage = ICountryDetailExampleImages['images'][number]

const props = defineProps<{
  countryName: string
}>()

const detailsStore = useDetailsStore()
const { exampleImages } = storeToRefs(detailsStore)

const previewImage = ref<{
  title: string
  url: string
} | null>(null)
const previewCloseRef = ref<HTMLButtonElement | null>(null)
const previouslyFocusedEl = ref<HTMLElement | null>(null)

const countryNameInSentence = computed(() => {
  return props.countryName === 'No country found' ? 'this country' : props.countryName
})

function imageTitle(imageObj: ExampleImage): string {
  return imageObj.title || 'Plate sample'
}

function openPreview(imageObj: ExampleImage) {
  // restore keyboard focus to the trigger after closing the preview
  previouslyFocusedEl.value = document.activeElement instanceof HTMLElement ? document.activeElement : null
  previewImage.value = {
    title: imageTitle(imageObj),
    url: imageObj.url,
  }

  void nextTick(() => {
    previewCloseRef.value?.focus()
  })
}

function closePreview() {
  previewImage.value = null

  void nextTick(() => {
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

  // keep modal keyboard handling scoped while preview is open
  if (event.key === 'Escape') {
    event.preventDefault()
    closePreview()
    return
  }

  // keep focus in the preview while modal is open
  if (event.key === 'Tab') {
    event.preventDefault()
    previewCloseRef.value?.focus()
  }
}

watch(previewImage, (value) => {
  if (value) {
    document.addEventListener('keydown', onPreviewKeydown)
    return
  }

  document.removeEventListener('keydown', onPreviewKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onPreviewKeydown)
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
                <img
                  :src="imageObj.url"
                  :alt="`Example image for ${imageTitle(imageObj)}`"
                  loading="lazy"
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

  <div v-if="previewImage" class="preview-backdrop" role="dialog" aria-modal="true" @click.self="closePreview">
    <div class="preview-panel">
      <button
        ref="previewCloseRef"
        type="button"
        class="preview-close"
        aria-label="close preview"
        @click="closePreview"
      >
        close
      </button>
      <img :src="previewImage.url" :alt="previewImage.title" />
      <p>{{ previewImage.title }}</p>
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
  /* keep keyboard focus clearly visible around the whole card */
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
  /* keep close button focus ring solid and clearly visible */
  box-shadow: inset 0 0 0 1px color-mix(in oklab, var(--tone, #97a0b5) 56%, var(--line));
}

.preview-panel img {
  width: 100%;
  max-height: 70vh;
  object-fit: contain;
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
