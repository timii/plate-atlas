<script setup lang="ts">
import Close from '@/assets/icons/Close.vue'
import countriesData from '@/data/current-license-plates.json'
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'

interface IAboutAction {
  href: string
  label: string
}

interface IAboutSourceLink {
  href: string
  label: string
}

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const repositoryUrl = 'https://github.com/timii/plate-atlas'
const dialogPanelRef = ref<HTMLElement | null>(null)
const closeButtonRef = ref<HTMLButtonElement | null>(null)
const previouslyFocusedEl = ref<HTMLElement | null>(null)
const previousBodyOverflow = ref('')

const sourceLinks: IAboutSourceLink[] = [
  {
    href: 'https://commons.wikimedia.org/wiki/Home_Page',
    label: 'Wikimedia Commons',
  },
  {
    href: 'https://www.plateshack.com/',
    label: 'Plate Shack',
  },
  {
    href: 'https://www.olavsplates.com/',
    label: "Olav's Plates",
  },
  {
    href: 'https://www.licenseplatemania.com/',
    label: 'License Plate Mania',
  },
  {
    href: 'http://www.worldlicenseplates.com/',
    label: 'World License Plates',
  },
]

const aboutActions: IAboutAction[] = [
  {
    href: `${repositoryUrl}/issues/new`,
    label: 'Report a correction',
  },
  {
    href: `${repositoryUrl}/pulls`,
    label: 'Open a pull request',
  },
]

const lastDataUpdateLabel = computed(() => {
  const date = new Date(countriesData.lastUpdate)
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

function closeDialog() {
  emit('close')
}

function onBackdropClick() {
  closeDialog()
}

function onDialogKeydown(event: KeyboardEvent) {
  if (!props.open) {
    return
  }

  if (event.key === 'Escape') {
    event.preventDefault()
    closeDialog()
    return
  }

  if (event.key !== 'Tab' || !dialogPanelRef.value) {
    return
  }

  // keep keyboard focus inside the about panel
  const focusableElements = dialogPanelRef.value.querySelectorAll<HTMLElement>(
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
  )

  if (focusableElements.length === 0) {
    event.preventDefault()
    dialogPanelRef.value.focus()
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

// lock scrolling and return focus while the dialog is open
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      previouslyFocusedEl.value =
        document.activeElement instanceof HTMLElement ? document.activeElement : null
      previousBodyOverflow.value = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      document.addEventListener('keydown', onDialogKeydown)

      nextTick(() => {
        closeButtonRef.value?.focus()
      })

      return
    }

    document.body.style.overflow = previousBodyOverflow.value
    document.removeEventListener('keydown', onDialogKeydown)

    nextTick(() => {
      previouslyFocusedEl.value?.focus()
    })
  },
  { immediate: true },
)

// clean up the dialog state if the component is removed mid-open
onBeforeUnmount(() => {
  document.body.style.overflow = previousBodyOverflow.value
  document.removeEventListener('keydown', onDialogKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="about-dialog">
      <div
        v-if="props.open"
        class="about-backdrop"
        role="dialog"
        aria-modal="true"
        aria-label="About Plate Atlas"
        @click.self="onBackdropClick"
      >
        <section id="about-dialog-panel" ref="dialogPanelRef" class="about-panel" tabindex="-1">
          <header class="panel-header">
            <p class="panel-label">About</p>
            <button
              ref="closeButtonRef"
              type="button"
              class="close-button"
              aria-label="close about dialog"
              @click="closeDialog"
            >
              <Close />
            </button>
          </header>

          <dl class="facts">
            <div class="fact-row">
              <dt>Last data update</dt>
              <dd>{{ lastDataUpdateLabel }}</dd>
            </div>

            <div class="fact-row">
              <dt>Sources</dt>
              <dd class="source-links">
                <template v-for="(source, index) in sourceLinks" :key="source.label">
                  <a :href="source.href" target="_blank" rel="noreferrer">{{ source.label }}</a>
                  <span v-if="index < sourceLinks.length - 1" class="separator">, </span>
                </template>
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
            <a
              v-for="action in aboutActions"
              :key="action.label"
              :href="action.href"
              class="text-link"
              target="_blank"
              rel="noreferrer"
            >
              {{ action.label }}
            </a>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.about-backdrop {
  position: fixed;
  inset: 0;
  z-index: 70;
  display: grid;
  place-items: center;
  padding: 1rem;
  background:
    radial-gradient(circle at top, rgba(146, 115, 184, 0.1), transparent 34%),
    rgba(5, 4, 10, 0.68);
  backdrop-filter: blur(8px);
}

.about-panel {
  width: min(40rem, 100%);
  border: 1px solid color-mix(in oklab, var(--atlas-line) 70%, #ffffff 18%);
  border-radius: var(--atlas-radius-panel);
  background: linear-gradient(
    180deg,
    color-mix(in oklab, var(--atlas-header-surface) 98%, rgba(255, 255, 255, 0.025)),
    color-mix(in oklab, var(--atlas-surface) 94%, #06050b 6%)
  );
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.03),
    0 20px 48px rgba(5, 4, 10, 0.28);
  backdrop-filter: blur(18px);
  padding: 0.46rem 0.92rem 0.9rem;
}

.about-panel:focus {
  outline: none;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: -0.04rem;
}

.panel-label,
.fact-row dt {
  margin: 0;
  font-size: 0.72rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: color-mix(in oklab, var(--atlas-muted) 84%, #ffffff 16%);
}

.close-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  flex: 0 0 auto;
  border: none;
  border-radius: var(--atlas-radius-control);
  background: transparent;
  color: color-mix(in oklab, var(--atlas-muted) 80%, #ffffff 20%);
  cursor: pointer;
}

.close-button:hover {
  color: var(--atlas-text);
  background: rgba(255, 255, 255, 0.05);
}

.close-button:focus-visible,
.text-link:focus-visible,
.source-links a:focus-visible {
  outline: 2px solid color-mix(in oklab, #8ea3f2 58%, #ffffff 42%);
  outline-offset: 3px;
}

.close-button :deep(svg) {
  width: 1.2rem;
  height: 1.2rem;
}

.facts {
  margin: 0;
  border-top: 1px solid color-mix(in oklab, var(--atlas-line) 54%, transparent);
}

.fact-row {
  display: grid;
  grid-template-columns: minmax(8rem, 9.4rem) minmax(0, 1fr);
  gap: 0.95rem;
  padding: 0.82rem 0;
  border-bottom: 1px solid color-mix(in oklab, var(--atlas-line) 54%, transparent);
}

.fact-row dd {
  margin: 0;
  color: color-mix(in oklab, var(--atlas-text) 90%, var(--atlas-muted));
  line-height: 1.46;
}

.source-links a,
.text-link {
  color: color-mix(in oklab, var(--atlas-text) 92%, var(--atlas-muted));
  text-decoration: none;
  border-bottom: 1px solid color-mix(in oklab, var(--atlas-line) 74%, #ffffff 18%);
}

.source-links a:hover,
.text-link:hover {
  color: var(--atlas-text);
  border-color: color-mix(in oklab, #8ea3f2 48%, #ffffff 32%);
}

.separator {
  color: color-mix(in oklab, var(--atlas-muted) 74%, #ffffff 26%);
}

.link-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.9rem 1.2rem;
  padding-top: 0.88rem;
}

.text-link {
  font-size: 0.82rem;
  letter-spacing: 0.02em;
  padding-bottom: 0.08rem;
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

/* switch the modal to a bottom sheet on smaller screens */
@media (max-width: 640px) {
  .about-backdrop {
    place-items: end stretch;
    padding: 0.6rem 0.6rem calc(0.6rem + env(safe-area-inset-bottom));
  }

  .about-panel {
    width: 100%;
    max-height: min(82vh, 36rem);
    overflow: auto;
    padding: 0.5rem 0.82rem 0.9rem;
    border-radius: 1rem;
  }

  .panel-header {
    margin-bottom: 0.02rem;
  }

  .fact-row {
    grid-template-columns: minmax(0, 1fr);
    gap: 0.32rem;
    padding: 0.72rem 0;
  }

  .link-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 0.7rem;
  }

  .text-link {
    width: fit-content;
    min-height: 1.8rem;
  }
}
</style>
