<script setup lang="ts">
const props = defineProps<{
  title: string
  fullWidth?: boolean
}>()
</script>

<template>
  <article class="info-card" :class="{ 'info-card--full-width': props.fullWidth }">
    <p class="info-card__label">{{ props.title }}</p>
    <div class="info-card__content">
      <slot />
    </div>
  </article>
</template>

<style scoped>
.info-card {
  border: 1px solid color-mix(in oklab, var(--tone, #97a0b5) 24%, var(--line));
  border-left: 0.32rem solid color-mix(in oklab, var(--tone, #97a0b5) 76%, #ffffff);
  border-radius: 0.52rem;
  padding: var(--atlas-spacing-sm) var(--atlas-spacing-sm);
  background: linear-gradient(
    180deg,
    color-mix(in oklab, var(--tone, #97a0b5) 18%, var(--surface) 82%),
    color-mix(in oklab, var(--tone, #97a0b5) 10%, var(--surface) 90%)
  );
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.025);
}

.info-card--full-width {
  /* let shared grid panels stretch the card across all columns */
  grid-column: 1 / -1;
}

.info-card__label {
  margin: 0;
  font-size: 0.74rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--muted);
}

.info-card__content {
  margin-top: var(--atlas-spacing-2xs);
  line-height: 1.42;
  color: color-mix(in oklab, var(--text) 90%, var(--muted));
}

.info-card__content :deep(:first-child) {
  margin-top: 0;
}

.info-card__content :deep(:last-child) {
  margin-bottom: 0;
}
</style>
