<script setup lang="ts">
import { computed, useSlots } from 'vue'

const props = defineProps<{
  title: string
  meta?: string
  metaAccent?: string
  description?: string
}>()

const slots = useSlots()
const hasActions = computed(() => Boolean(slots.actions))
</script>

<template>
  <header class="page-header" :class="{ 'page-header--with-actions': hasActions }">
    <div class="copy">
      <h1>{{ props.title }}</h1>
      <p v-if="props.meta || props.metaAccent" class="meta">
        <span v-if="props.meta">{{ props.meta }}</span>
        <span v-if="props.metaAccent" class="meta-accent">{{ props.metaAccent }}</span>
      </p>
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

h1 {
  font-size: clamp(1.95rem, 4.8vw, 3.02rem);
  font-weight: 480;
  line-height: 1;
  letter-spacing: -0.032em;
}

.meta {
  margin-top: var(--atlas-spacing-xs);
  color: color-mix(in oklab, var(--text) 54%, var(--muted));
  font-size: 0.9rem;
  line-height: 1.35;
}

.meta-accent {
  color: color-mix(in oklab, var(--tone, #97a0b5) 64%, var(--text));
}

.description {
  margin-top: calc(var(--atlas-spacing-xs) + 0.05rem);
  color: var(--muted);
  line-height: 1.42;
  font-size: 0.95rem;
  max-width: 74ch;
}

.actions {
  display: inline-flex;
  align-self: flex-start;
  margin-top: calc(var(--atlas-spacing-xs) + 0.1rem);
}

.page-header--with-actions .copy {
  max-width: calc(100% - 4rem);
}

@media (max-width: 760px) {
  .page-header {
    gap: var(--atlas-spacing-sm);
  }

  .meta {
    font-size: 0.86rem;
  }

  .page-header--with-actions .copy {
    max-width: calc(100% - 3rem);
  }
}
</style>
