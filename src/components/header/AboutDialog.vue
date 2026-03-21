<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import Close from '@/assets/icons/Close.vue'
import { useCountriesStore } from '@/stores/countries'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const countriesStore = useCountriesStore()
const { lastUpdatedLabel } = storeToRefs(countriesStore)

const panelRef = ref<HTMLElement | null>(null)
const closeButtonRef = ref<HTMLButtonElement | null>(null)
const previouslyFocusedElement = ref<HTMLElement | null>(null)
const creatorUrl = 'https://github.com/timii'
const repositoryUrl = 'https://github.com/timii/plate-atlas'
const licenseUrl = `${repositoryUrl}/blob/main/LICENSE`
const correctionUrl = `${repositoryUrl}/issues/new/choose`
const pullRequestUrl = `${repositoryUrl}/pulls`
const sources = [
  { label: 'Wikimedia Commons', href: 'https://commons.wikimedia.org/' },
  { label: 'Wikipedia', href: 'https://www.wikipedia.org/' },
  { label: 'Plate Shack', href: 'https://www.plateshack.com/' },
  { label: "Olav's Plates", href: 'https://www.olavsplates.com/' },
  { label: 'License Plate Mania', href: 'https://www.licenseplatemania.com/' },
  { label: 'World License Plates', href: 'https://www.worldlicenseplates.com/' },
]
let previousBodyOverflow = ''

function closeDialog() {
  emit('close')
}

// keep keyboard focus inside the dialog while it is open
function trapFocus(event: KeyboardEvent) {
  if (!props.open || !panelRef.value || event.key !== 'Tab') {
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

function onDocumentKeydown(event: KeyboardEvent) {
  if (!props.open) {
    return
  }

  if (event.key === 'Escape') {
    event.preventDefault()
    closeDialog()
    return
  }

  trapFocus(event)
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
      // restore focus to the triggering action after the dialog closes
      previouslyFocusedElement.value =
        document.activeElement instanceof HTMLElement ? document.activeElement : null
      previousBodyOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      addDialogListeners()

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
    <Transition name="about-dialog">
      <div v-if="props.open" class="about-overlay" @click.self="closeDialog">
        <section
          id="about-dialog-panel"
          ref="panelRef"
          class="about-panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="about-dialog-title"
          tabindex="-1"
        >
          <header class="about-head">
            <p id="about-dialog-title" class="about-eyebrow">About</p>
            <button
              ref="closeButtonRef"
              type="button"
              class="close-button"
              aria-label="Close the about dialog"
              @click="closeDialog"
            >
              <Close class="close-icon" />
            </button>
          </header>

          <dl class="fact-list">
            <div class="fact-row">
              <dt>Last data update</dt>
              <dd>{{ lastUpdatedLabel || 'Unavailable' }}</dd>
            </div>

            <div class="fact-row">
              <dt>Sources</dt>
              <dd class="source-links">
                <a
                  v-for="source in sources"
                  :key="source.label"
                  :href="source.href"
                  class="inline-link"
                  target="_blank"
                  rel="noreferrer"
                >
                  {{ source.label }}
                </a>
              </dd>
            </div>

            <div class="fact-row">
              <dt>Created by</dt>
              <dd>
                <a :href="creatorUrl" class="inline-link" target="_blank" rel="noreferrer"
                  >timii</a
                >
              </dd>
            </div>

            <div class="fact-row">
              <dt>License</dt>
              <dd>
                <a :href="licenseUrl" class="inline-link" target="_blank" rel="noreferrer"
                  >MIT</a
                >
              </dd>
            </div>

            <div class="fact-row">
              <dt>Contributing</dt>
              <dd>
                Use GitHub issues for corrections or open a pull request when you want to improve
                the data.
              </dd>
            </div>
          </dl>

          <div class="link-row">
            <a :href="correctionUrl" class="text-link" target="_blank" rel="noreferrer">
              Report a correction
            </a>
            <a :href="pullRequestUrl" class="text-link" target="_blank" rel="noreferrer">
              Open a pull request
            </a>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.about-overlay {
  position: fixed;
  inset: 0;
  z-index: 90;
  display: grid;
  place-items: center;
  padding: var(--atlas-spacing-md);
  background: rgba(6, 4, 10, 0.56);
  backdrop-filter: blur(18px);
}

.about-panel {
  width: min(42rem, calc(100vw - 2rem));
  padding: var(--atlas-spacing-md) var(--atlas-spacing-md) var(--atlas-spacing-md);
  border: 1px solid color-mix(in oklab, var(--atlas-line) 62%, #ffffff 10%);
  border-radius: 1rem;
  background:
    linear-gradient(
      180deg,
      color-mix(in oklab, var(--atlas-surface-2) 88%, rgba(255, 255, 255, 0.028)),
      color-mix(in oklab, var(--atlas-surface) 92%, rgba(12, 9, 18, 0.72))
    ),
    radial-gradient(circle at top, rgba(255, 255, 255, 0.03), transparent 58%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.04),
    0 22px 56px rgba(3, 2, 7, 0.42);
}

.about-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--atlas-spacing-sm);
  padding-bottom: var(--atlas-spacing-xs);
}

.about-eyebrow {
  color: color-mix(in oklab, var(--atlas-muted) 78%, #ffffff 22%);
  font-size: 0.78rem;
  font-weight: 560;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.close-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.4rem;
  height: 2.4rem;
  margin: -var(--atlas-spacing-xs) -var(--atlas-spacing-2xs) -var(--atlas-spacing-2xs) 0;
  border: none;
  border-radius: 999px;
  background: transparent;
  color: color-mix(in oklab, var(--atlas-muted) 84%, #ffffff 16%);
  cursor: pointer;
  transition:
    background-color 160ms ease,
    color 160ms ease;
}

.close-icon {
  width: 1rem;
  height: 1rem;
  flex: 0 0 auto;
}

.close-button:hover {
  background: var(--atlas-control-hover);
  color: var(--atlas-text);
}

/* reuse the shared page tone inside the dialog */
.close-button:focus-visible {
  outline: 2px solid color-mix(in oklab, var(--atlas-page-tone, #6f87d9) 64%, var(--atlas-line));
  outline-offset: 2px;
}

.fact-list {
  display: grid;
}

.fact-row {
  display: grid;
  grid-template-columns: minmax(9.5rem, 10.5rem) minmax(0, 1fr);
  gap: var(--atlas-spacing-md) var(--atlas-spacing-md);
  align-items: start;
  padding: var(--atlas-spacing-md) 0;
  border-top: 1px solid color-mix(in oklab, var(--atlas-line) 54%, transparent);
}

.fact-row dt {
  color: color-mix(in oklab, var(--atlas-muted) 78%, #ffffff 22%);
  font-size: var(--atlas-text-sm);
  letter-spacing: 0.11em;
  text-transform: uppercase;
}

.fact-row dd {
  color: var(--atlas-text);
  font-size: var(--atlas-text-md);
  line-height: 1.6;
}

.source-links {
  display: flex;
  flex-wrap: wrap;
  gap: var(--atlas-spacing-xs) var(--atlas-spacing-sm);
}

.inline-link {
  color: color-mix(in oklab, var(--atlas-text) 90%, #ffffff 10%);
  text-decoration: none;
  border-bottom: 1px solid color-mix(in oklab, var(--atlas-line) 76%, #ffffff 12%);
  transition:
    color 160ms ease,
    border-color 160ms ease;
}

.inline-link:hover {
  color: var(--atlas-text);
  border-color: color-mix(in oklab, var(--atlas-text) 40%, var(--atlas-line));
}

.link-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--atlas-spacing-sm) var(--atlas-spacing-sm);
  padding-top: var(--atlas-spacing-md);
  border-top: 1px solid color-mix(in oklab, var(--atlas-line) 54%, transparent);
}

.text-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.35rem;
  padding: 0 var(--atlas-spacing-md);
  border: 1px solid color-mix(in oklab, var(--atlas-line) 72%, #ffffff 8%);
  border-radius: 999px;
  background: color-mix(in oklab, var(--atlas-surface) 86%, transparent);
  color: color-mix(in oklab, var(--atlas-muted) 86%, #ffffff 14%);
  font-size: 0.82rem;
  font-weight: 520;
  letter-spacing: 0.01em;
  text-decoration: none;
  transition:
    border-color 160ms ease,
    background-color 160ms ease,
    color 160ms ease;
}

.text-link:hover {
  border-color: color-mix(in oklab, var(--atlas-text) 16%, var(--atlas-line));
  background: color-mix(in oklab, var(--atlas-surface) 72%, rgba(255, 255, 255, 0.05));
  color: var(--atlas-text);
}

.text-link:focus-visible,
.inline-link:focus-visible {
  outline: 2px solid color-mix(in oklab, var(--atlas-page-tone, #6f87d9) 64%, var(--atlas-line));
  outline-offset: 3px;
  border-radius: 0.35rem;
}

.about-dialog-enter-active,
.about-dialog-leave-active {
  transition: opacity 180ms ease;
}

.about-dialog-enter-active .about-panel,
.about-dialog-leave-active .about-panel {
  transition:
    transform 180ms ease,
    opacity 180ms ease;
}

.about-dialog-enter-from,
.about-dialog-leave-to {
  opacity: 0;
}

.about-dialog-enter-from .about-panel,
.about-dialog-leave-to .about-panel {
  opacity: 0;
  transform: translateY(10px);
}

@media (max-width: 640px) {
  .about-overlay {
    align-items: end;
    padding: var(--atlas-spacing-sm) var(--atlas-spacing-sm) calc(var(--atlas-spacing-sm) + env(safe-area-inset-bottom, 0px));
  }

  /* use a bottom sheet on smaller screens so the dialog fits without feeling cramped */
  .about-panel {
    width: min(100%, 32rem);
    max-height: min(85vh, 38rem);
    overflow-y: auto;
        padding: var(--atlas-spacing-md) var(--atlas-spacing-md) var(--atlas-spacing-md);
    border-radius: 1rem 1rem 0.8rem 0.8rem;
  }

  .about-head {
        padding-bottom: var(--atlas-spacing-2xs);
  }

  .fact-row {
    grid-template-columns: 1fr;
    gap: var(--atlas-spacing-sm);
    padding: var(--atlas-spacing-sm) 0;
  }

  .link-row {
    flex-direction: column;
    gap: var(--atlas-spacing-sm);
  }

  .text-link {
    width: 100%;
    min-height: var(--atlas-touch-target);
    justify-content: flex-start;
    padding: 0 var(--atlas-spacing-md);
  }
}
</style>
