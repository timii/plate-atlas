<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    text: string
    title?: string
    accented?: boolean
    multiline?: boolean
  }>(),
  {
    title: '',
    accented: false,
    multiline: false,
  },
)

const tooltipText = computed(() => props.title.trim())
</script>

<template>
  <span class="atlas-code-chip-wrap" :aria-label="tooltipText || undefined">
    <span
      class="atlas-code-chip"
      :class="{
        'atlas-code-chip--accented': props.accented,
        'atlas-code-chip--multiline': props.multiline,
      }"
    >
      {{ props.text }}
    </span>
    <span v-if="tooltipText" class="atlas-code-chip-tooltip" role="tooltip">
      {{ tooltipText }}
    </span>
  </span>
</template>

<style scoped>
.atlas-code-chip-wrap {
  position: relative;
  display: inline-flex;
  align-self: center;
  width: var(--code-chip-width, 3.5rem);
}

.atlas-code-chip-tooltip {
  position: absolute;
  z-index: 20;
  left: 0;
  bottom: calc(100% + 0.42rem);
  width: max-content;
  max-width: min(18rem, calc(100vw - 4rem));
  padding: 0.42rem 0.54rem;
  border: 1px solid color-mix(in oklab, var(--tone, #97a0b5) 44%, var(--line));
  border-radius: calc(var(--atlas-radius-chip) + 0.16rem);
  background: color-mix(in oklab, var(--atlas-elevated-bg, var(--surface)) 92%, #09070d 8%);
  box-shadow: 0 0.75rem 1.6rem color-mix(in oklab, #050308 54%, transparent);
  color: color-mix(in oklab, var(--text) 92%, var(--muted));
  font-size: 0.72rem;
  font-weight: 460;
  line-height: 1.35;
  letter-spacing: 0;
  text-align: left;
  white-space: normal;
  pointer-events: none;
  opacity: 0;
  transform: translateY(0.18rem);
  transition:
    opacity 140ms ease,
    transform 140ms ease;
}

.atlas-code-chip-tooltip::after {
  content: '';
  position: absolute;
  left: calc(var(--code-chip-width, 3.5rem) / 2);
  top: 100%;
  width: 0.48rem;
  height: 0.48rem;
  border-right: 1px solid color-mix(in oklab, var(--tone, #97a0b5) 44%, var(--line));
  border-bottom: 1px solid color-mix(in oklab, var(--tone, #97a0b5) 44%, var(--line));
  background: color-mix(in oklab, var(--atlas-elevated-bg, var(--surface)) 92%, #09070d 8%);
  transform: translate(-50%, -50%) rotate(45deg);
}

.atlas-code-chip-wrap:hover .atlas-code-chip-tooltip,
.atlas-code-chip-wrap:focus-within .atlas-code-chip-tooltip {
  opacity: 1;
  transform: translateY(0);
}
</style>
