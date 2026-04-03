<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    ariaLabel: string
    desktopColumns?: string
  }>(),
  {
    desktopColumns: '',
  },
)

const panelStyle = computed(() => {
  return props.desktopColumns ? { '--filter-panel-columns': props.desktopColumns } : {}
})
</script>

<template>
  <section class="filter-panel" :aria-label="props.ariaLabel" :style="panelStyle">
    <div class="control-row">
      <slot />
    </div>
    <div v-if="$slots.footer" class="footer">
      <slot name="footer" />
    </div>
  </section>
</template>

<style scoped>
.filter-panel {
  display: grid;
  gap: var(--atlas-panel-gap-compact);
  border: 1px solid color-mix(in oklab, var(--line) 60%, #0d0a11 40%);
  border-radius: var(--atlas-radius-panel);
  background: var(--atlas-panel-surface-subtle);
  padding: var(--atlas-panel-padding-compact);
}

.control-row {
  display: grid;
  gap: calc(var(--atlas-spacing-sm) - 0.06rem);
}

.footer {
  min-width: 0;
  border-top: 1px solid var(--atlas-panel-divider-subtle);
  padding-top: calc(var(--atlas-spacing-sm) - 0.04rem);
}

@media (min-width: 980px) {
  .control-row {
    grid-template-columns: var(--filter-panel-columns, 1fr);
    align-items: end;
  }
}

@media (max-width: 760px) {
  .filter-panel {
    gap: var(--atlas-panel-gap-compact-mobile);
    padding: var(--atlas-panel-padding-compact-mobile);
  }

  .control-row {
    grid-template-columns: 1fr;
    gap: var(--atlas-panel-gap-compact-mobile);
  }
}
</style>
