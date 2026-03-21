<script setup lang="ts">
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

function onInputKeydown(event: KeyboardEvent) {
  if (event.key !== 'Escape' || text.value.length === 0) {
    return
  }

  // let keyboard users clear the current search query quickly
  event.preventDefault()
  text.value = ''
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
      v-if="text.length > 0"
      type="button"
      class="clear"
      aria-label="clear search"
      @click="text = ''"
    >
      <Close />
    </button>
  </div>
</template>

<style scoped>
.search-field {
  display: flex;
  align-items: center;
  gap: var(--atlas-spacing-xs);
  border: 1px solid var(--line);
  border-radius: var(--atlas-radius-control);
  background: var(--surface-2);
  min-height: 2.75rem;
  padding: var(--atlas-spacing-xs) var(--atlas-spacing-sm);
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
  color: color-mix(in oklab, var(--muted) 74%, transparent);
}

.search-field input:focus {
  outline: none;
}

.search-field:focus-within {
  border-color: color-mix(in oklab, var(--tone, #6f87d9) 64%, var(--line));
  /* render focus as an inset ring to keep corner rounding clean */
  box-shadow: inset 0 0 0 1px color-mix(in oklab, var(--tone, #6f87d9) 52%, var(--line));
}

.clear {
  display: inline-flex;
  border: none;
  background: transparent;
  color: var(--muted);
  border-radius: var(--atlas-radius-chip);
  padding: var(--atlas-spacing-2xs);
  cursor: pointer;
}

.clear:hover {
  background: var(--atlas-control-hover);
  color: var(--text);
}

.clear:focus-visible {
  outline: 2px solid color-mix(in oklab, var(--tone, #6f87d9) 56%, var(--line));
  outline-offset: 1px;
}
</style>
