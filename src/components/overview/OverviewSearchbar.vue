<script setup lang="ts">
import Close from '@/assets/icons/Close.vue'

const text = defineModel('text', { type: String, default: '' })
</script>

<template>
  <div class="overview-search">
    <input v-model="text" type="text" placeholder="country, code, continent" />
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
.overview-search {
  display: flex;
  align-items: center;
  gap: 0.36rem;
  border: 1px solid var(--line);
  border-radius: 0.44rem;
  background: var(--surface-2);
  min-height: 2.75rem;
  padding: 0.28rem 0.56rem;
}

.overview-search input {
  flex: 1;
  min-width: 0;
  background: transparent;
  border: none;
  color: var(--text);
  font-size: 0.9rem;
}

.overview-search input::placeholder {
  color: color-mix(in oklab, var(--muted) 74%, transparent);
}

.overview-search input:focus {
  outline: none;
}

.overview-search:focus-within {
  border-color: #6f87d9;
  box-shadow: 0 0 0 3px rgba(111, 135, 217, 0.2);
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
