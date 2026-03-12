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
  gap: 0.82rem;
  border: 1px solid var(--line);
  border-radius: var(--atlas-radius-panel);
  background: var(--surface);
  padding: 0.88rem;
}

.control-row {
  display: grid;
  gap: 0.72rem;
}

.footer {
  min-width: 0;
}

@media (min-width: 980px) {
  .control-row {
    grid-template-columns: var(--filter-panel-columns, 1fr);
    align-items: end;
  }
}

@media (max-width: 760px) {
  .filter-panel {
    padding: 0.8rem;
  }

  .control-row {
    grid-template-columns: 1fr;
    gap: 0.62rem;
  }
}
</style>

