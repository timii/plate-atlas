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
            <div class="about-title-block">
              <h2 id="about-dialog-title" class="about-title">About Plate Atlas</h2>
              <p class="about-subtitle">Project information, data sources, and contribution links</p>
            </div>
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

          <dl class="meta-list">
            <div class="meta-item">
              <dt>Last updated</dt>
              <dd>{{ lastUpdatedLabel || 'Unavailable' }}</dd>
            </div>

            <div class="meta-item">
              <dt>Created by</dt>
              <dd>
                <a :href="creatorUrl" class="inline-link" target="_blank" rel="noreferrer">timii</a>
              </dd>
            </div>

            <div class="meta-item">
              <dt>License</dt>
              <dd>
                <a :href="licenseUrl" class="inline-link" target="_blank" rel="noreferrer">MIT</a>
              </dd>
            </div>
          </dl>

          <section class="about-section">
            <h3>Sources</h3>
            <div class="source-links">
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
            </div>
          </section>

          <section class="about-section">
            <h3>Contributing</h3>
            <p class="section-copy">
              Use GitHub issues for corrections or open a pull request when you want to improve the
              data.
            </p>
            <div class="action-links">
              <a :href="correctionUrl" class="action-link" target="_blank" rel="noreferrer">
                Report a correction
              </a>
              <a :href="pullRequestUrl" class="action-link" target="_blank" rel="noreferrer">
                Open a pull request
              </a>
            </div>
          </section>
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
  background: var(--atlas-backdrop);
}

.about-panel {
  width: min(42rem, calc(100vw - 2rem));
  padding: var(--atlas-spacing-md);
  border: 1px solid color-mix(in oklab, var(--atlas-line) 74%, #0b0810 26%);
  border-radius: var(--atlas-radius-panel);
  background: var(--atlas-dialog-bg);
  box-shadow: 0 14px 32px rgba(4, 3, 8, 0.24);
  display: grid;
  gap: var(--atlas-spacing-md);
}

.about-head {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: var(--atlas-spacing-sm);
  padding-bottom: calc(var(--atlas-spacing-xs) + 0.08rem);
  border-bottom: 1px solid color-mix(in oklab, var(--atlas-line) 60%, transparent);
}

.about-title-block {
  min-width: 0;
  display: grid;
  gap: 0.22rem;
}

.about-title {
  margin: 0;
  font-size: clamp(1rem, 0.96rem + 0.24vw, 1.12rem);
  font-weight: 540;
  line-height: 1.2;
  color: var(--atlas-text);
}

.about-subtitle {
  margin: 0;
  font-size: 0.82rem;
  line-height: 1.45;
  color: color-mix(in oklab, var(--atlas-text) 68%, var(--atlas-muted));
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

@media (hover: hover) and (pointer: fine) {
  .close-button:hover {
    background: color-mix(in oklab, var(--atlas-surface) 90%, rgba(255, 255, 255, 0.08));
    color: var(--atlas-text);
    box-shadow: inset 0 0 0 1px color-mix(in oklab, var(--atlas-line) 68%, transparent);
  }
}

.close-button:focus-visible {
  outline: none;
  background: color-mix(in oklab, var(--atlas-surface) 74%, transparent);
  box-shadow: inset 0 0 0 1px
    color-mix(in oklab, var(--atlas-page-tone, #6f87d9) 54%, var(--atlas-line));
  color: var(--atlas-text);
}

@media (hover: none), (pointer: coarse) {
  .close-button {
    width: 2.35rem;
    height: 2.35rem;
    margin: -0.16rem -0.16rem 0 0;
  }
}

.meta-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--atlas-spacing-sm);
}

.meta-item {
  display: grid;
  gap: 0.3rem;
  padding: calc(var(--atlas-spacing-sm) - 0.04rem);
  border: 1px solid color-mix(in oklab, var(--atlas-line) 56%, transparent);
  border-radius: var(--atlas-radius-control);
  background: color-mix(in oklab, var(--atlas-surface) 80%, transparent);
}

.meta-item dt {
  color: color-mix(in oklab, var(--atlas-text) 58%, var(--atlas-muted));
  font-size: 0.76rem;
  font-weight: 500;
  line-height: 1.3;
}

.meta-item dd {
  margin: 0;
  color: var(--atlas-text);
  font-size: 0.94rem;
  line-height: 1.4;
  font-weight: 500;
}

.about-section {
  display: grid;
  gap: var(--atlas-spacing-sm);
  padding-top: var(--atlas-spacing-md);
  border-top: 1px solid color-mix(in oklab, var(--atlas-line) 60%, transparent);
}

.about-section h3 {
  margin: 0;
  font-size: 0.84rem;
  font-weight: 540;
  line-height: 1.3;
  color: color-mix(in oklab, var(--atlas-text) 92%, var(--atlas-muted));
}

.section-copy {
  margin: 0;
  font-size: 0.94rem;
  line-height: 1.55;
  color: color-mix(in oklab, var(--atlas-text) 88%, var(--atlas-muted));
}

.source-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem var(--atlas-spacing-sm);
}

.inline-link {
  color: color-mix(in oklab, var(--atlas-text) 90%, #ffffff 10%);
  text-decoration: none;
  border-bottom: 1px solid color-mix(in oklab, var(--atlas-line) 72%, #ffffff 8%);
  transition:
    color 160ms ease,
    border-color 160ms ease;
}

.inline-link:hover {
  color: var(--atlas-text);
  border-color: color-mix(in oklab, var(--atlas-text) 40%, var(--atlas-line));
}

.action-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem var(--atlas-spacing-sm);
}

.action-link {
  display: inline-flex;
  align-items: center;
  min-height: 1.9rem;
  padding: 0.14rem 0;
  color: color-mix(in oklab, var(--atlas-text) 90%, #ffffff 10%);
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.35;
  text-decoration: none;
  border-bottom: 1px solid color-mix(in oklab, var(--atlas-line) 72%, #ffffff 8%);
  transition:
    color 160ms ease,
    border-color 160ms ease;
}

.action-link:hover {
  color: var(--atlas-text);
  border-color: color-mix(in oklab, var(--atlas-text) 40%, var(--atlas-line));
}

.action-link:focus-visible,
.inline-link:focus-visible {
  outline: 2px solid color-mix(in oklab, var(--atlas-page-tone, #6f87d9) 64%, var(--atlas-line));
  outline-offset: 3px;
  border-radius: var(--atlas-radius-option);
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
    padding: var(--atlas-spacing-sm) var(--atlas-spacing-sm)
      calc(var(--atlas-spacing-sm) + env(safe-area-inset-bottom, 0px));
  }

  .about-panel {
    width: min(100%, 34rem);
    max-height: calc(
      100dvh - var(--atlas-spacing-sm) - var(--atlas-spacing-sm) - env(safe-area-inset-bottom, 0px)
    );
    overflow-y: auto;
    padding: calc(var(--atlas-spacing-sm) + 0.1rem);
    gap: calc(var(--atlas-spacing-sm) + 0.08rem);
    border-radius: 0.68rem 0.68rem 0.56rem 0.56rem;
  }

  .about-head {
    padding-bottom: var(--atlas-spacing-xs);
  }

  .about-subtitle {
    font-size: 0.8rem;
  }

  .meta-list {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .about-section {
    padding-top: calc(var(--atlas-spacing-sm) + 0.08rem);
  }

  .meta-list + .about-section {
    padding-top: calc(var(--atlas-spacing-sm) - 0.04rem);
  }

  .meta-item {
    padding: var(--atlas-spacing-sm) 0;
    border-width: 0 0 1px;
    border-color: color-mix(in oklab, var(--atlas-line) 56%, transparent);
    border-radius: 0;
    background: transparent;
  }

  .meta-item:last-child {
    border-bottom: none;
  }

  .action-links {
    gap: 0.45rem var(--atlas-spacing-sm);
  }

  .action-link {
    min-height: 1.9rem;
    padding: 0.14rem 0;
  }
}
</style>
