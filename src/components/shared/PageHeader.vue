<script setup lang="ts">
import { computed, useSlots } from 'vue'

const props = defineProps<{
  title: string
  meta?: string
  description?: string
  eyebrow?: string
}>()

const slots = useSlots()
const hasActions = computed(() => Boolean(slots.actions))
</script>

<template>
  <header class="page-header" :class="{ 'page-header--with-actions': hasActions }">
    <div class="copy">
      <p v-if="props.eyebrow" class="eyebrow">{{ props.eyebrow }}</p>
      <h1>{{ props.title }}</h1>
      <p v-if="props.meta" class="meta">{{ props.meta }}</p>
      <p v-if="props.description" class="description">{{ props.description }}</p>
    </div>
    <div v-if="hasActions" class="actions">
      <slot name="actions" />
    </div>
  </header>
</template>

<style scoped>
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--atlas-spacing-md);
  margin-top: clamp(var(--atlas-spacing-sm), 2vw, var(--atlas-spacing-md));
}

.copy {
  min-width: 0;
  flex: 1 1 auto;
  max-width: 72rem;
}

.eyebrow {
  margin-bottom: var(--atlas-spacing-2xs);
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: var(--atlas-text-xs);
}

h1 {
  font-size: clamp(2rem, 5.6vw, 3.55rem);
  line-height: 0.96;
}

.meta {
  /* increase separation so title and meta do not feel cramped */
  margin-top: var(--atlas-spacing-xs);
  color: color-mix(in oklab, var(--tone, #97a0b5) 56%, var(--muted));
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: var(--atlas-text-sm);
  line-height: 1.25;
}

.description {
  margin-top: var(--atlas-spacing-xs);
  color: var(--muted);
  line-height: 1.42;
  max-width: 74ch;
}

.actions {
  display: inline-flex;
  align-self: flex-start;
  margin-top: var(--atlas-spacing-xs);
}

.page-header--with-actions .copy {
  max-width: calc(100% - 4rem);
}

@media (max-width: 760px) {
  .page-header {
    gap: var(--atlas-spacing-sm);
  }

  .meta {
    margin-top: var(--atlas-spacing-xs);
    font-size: var(--atlas-text-sm);
    line-height: 1.3;
  }

  .page-header--with-actions .copy {
    max-width: calc(100% - 3rem);
  }
}
</style>
