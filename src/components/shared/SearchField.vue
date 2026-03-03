<script setup lang="ts">
import Close from '@/assets/icons/Close.vue'

const text = defineModel('text', { type: String, default: '' })

const props = withDefaults(
  defineProps<{
    placeholder?: string
  }>(),
  {
    placeholder: 'country, code, continent',
  },
)
</script>

<template>
  <div class="search-field">
    <input v-model="text" type="text" :placeholder="props.placeholder" />
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
  gap: 0.36rem;
  border: 1px solid var(--line);
  border-radius: 0.44rem;
  background: var(--surface-2);
  min-height: 2.75rem;
  padding: 0.28rem 0.56rem;
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
  box-shadow: 0 0 0 3px color-mix(in oklab, var(--tone, #6f87d9) 18%, transparent);
}

.clear {
  display: inline-flex;
  border: none;
  background: transparent;
  color: var(--muted);
  border-radius: 0.28rem;
  padding: 0.1rem;
}

.clear:hover {
  background: rgba(255, 255, 255, 0.08);
  color: var(--text);
}
</style>
