<script setup lang="ts">
import { computed } from 'vue'
import Close from '@/assets/icons/Close.vue'

const text = defineModel('text', { type: String, default: '' })

const props = withDefaults(
  defineProps<{
    placeholder?: string
    ariaLabel?: string
    inputId?: string
    ariaLabelledby?: string
  }>(),
  {
    placeholder: 'Search by country, code or continent',
    ariaLabel: 'search',
    inputId: undefined,
    ariaLabelledby: undefined,
  },
)

const hasText = computed(() => text.value.length > 0)

function clearText() {
  text.value = ''
}

function onInputKeydown(event: KeyboardEvent) {
  if (event.key !== 'Escape' || !hasText.value) {
    return
  }

  // let keyboard users clear the current search query quickly
  event.preventDefault()
  clearText()
}
</script>

<template>
  <div class="search-field">
    <input
      v-model="text"
      type="text"
      :id="props.inputId"
      :placeholder="props.placeholder"
      :aria-label="props.ariaLabelledby ? undefined : props.ariaLabel"
      :aria-labelledby="props.ariaLabelledby"
      @keydown="onInputKeydown"
    />
    <button
      v-if="hasText"
      type="button"
      class="clear"
      aria-label="clear search"
      @click="clearText"
    >
      <Close />
    </button>
  </div>
</template>

<style scoped>
.search-field {
  display: flex;
  align-items: center;
  gap: var(--atlas-spacing-2xs);
  border: 1px solid var(--atlas-control-border-subtle);
  border-radius: var(--atlas-radius-control);
  background: var(--atlas-control-surface-subtle);
  min-height: var(--atlas-control-height-compact);
  padding: var(--atlas-control-padding-compact);
}

.search-field input {
  flex: 1;
  min-width: 0;
  background: transparent;
  border: none;
  color: var(--text);
  font-size: 0.9rem;
}

.search-field input::placeholder {
  color: color-mix(in oklab, var(--muted) 62%, transparent);
}

.search-field input:focus {
  outline: none;
}

.search-field:focus-within {
  border-color: color-mix(in oklab, var(--tone, #6f87d9) 64%, var(--line));
  box-shadow: 0 0 0 1px color-mix(in oklab, var(--tone, #6f87d9) 32%, transparent);
}

.clear {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: 1.72rem;
  height: 1.72rem;
  margin-right: calc(var(--atlas-spacing-xs) * -1);
  border: none;
  border-radius: var(--atlas-radius-control);
  background: transparent;
  color: var(--muted);
  cursor: pointer;
}

.clear svg {
  width: 0.92rem;
  height: 0.92rem;
  flex: 0 0 auto;
}

/* keep the hover fill tied to the visual control on pointer devices */
@media (hover: hover) and (pointer: fine) {
  .clear:hover {
    background: var(--atlas-control-hover);
    color: var(--text);
  }
}

.clear:focus-visible {
  outline: 2px solid color-mix(in oklab, var(--tone, #6f87d9) 64%, var(--line));
  outline-offset: 3px;
}

/* grow the hit area on touch without changing the desktop visual size */
@media (hover: none), (pointer: coarse) {
  .clear {
    min-width: var(--atlas-touch-target);
    min-height: var(--atlas-touch-target);
    margin: calc(var(--atlas-spacing-xs) * -1) calc(var(--atlas-spacing-sm) * -1)
      calc(var(--atlas-spacing-xs) * -1) 0;
  }
}
</style>
