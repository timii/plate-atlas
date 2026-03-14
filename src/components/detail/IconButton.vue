<script setup lang="ts">
import type { Component, PropType } from 'vue'

const props = defineProps({
  iconComponent: {
    type: Object as PropType<Component>,
    required: true,
  },
  color: {
    type: String,
    default: '#9198a1',
  },
  size: {
    type: String,
    default: '24px',
  },
  label: {
    type: String,
    required: true,
  },
  pressed: {
    type: Boolean,
    default: undefined,
  },
})
</script>

<template>
  <button
    v-if="props.iconComponent"
    type="button"
    class="icon"
    :aria-label="props.label"
    :aria-pressed="props.pressed"
  >
    <component
      :is="props.iconComponent"
      :style="{
        width: props.size,
        height: props.size,
      }"
    ></component>
  </button>
</template>

<style scoped>
.icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--atlas-touch-target);
  height: var(--atlas-touch-target);
  border: none;
  border-radius: var(--atlas-radius-control);
  background: transparent;
  color: v-bind('props.color');
  cursor: pointer;
  transition:
    background-color 200ms ease,
    color 200ms ease;
}

.icon:hover {
  background: var(--atlas-control-hover);
}

.icon:focus-visible {
  outline: 2px solid color-mix(
    in oklab,
    var(--tone, #97a0b5) 62%,
    var(--line, rgba(255, 255, 255, 0.24))
  );
  outline-offset: 2px;
}
</style>
