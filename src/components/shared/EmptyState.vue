<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    title: string
    message: string
    ariaLive?: 'off' | 'polite' | 'assertive'
  }>(),
  {
    ariaLive: 'polite',
  },
)
</script>

<template>
  <section class="empty-state" :aria-live="props.ariaLive">
    <h2>{{ props.title }}</h2>
    <p>{{ props.message }}</p>
  </section>
</template>

<style scoped>
.empty-state {
  border: 1px solid color-mix(in oklab, var(--line) 82%, #0c0910 18%);
  border-radius: var(--atlas-radius-panel);
  background: var(--atlas-elevated-bg);
  padding: var(--atlas-spacing-md) var(--atlas-spacing-md);
}

.empty-state h2 {
  margin: 0;
  font-size: 0.94rem;
  letter-spacing: 0.02em;
}

.empty-state p {
  margin: var(--atlas-spacing-xs) 0 0;
  color: var(--muted);
  font-size: 0.84rem;
  line-height: 1.45;
}
</style>
