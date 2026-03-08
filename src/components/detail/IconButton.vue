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
    class="icon cursor-pointer rounded-lg p-1 transition-all duration-200 ease-cubic"
    :aria-label="props.label"
    :aria-pressed="props.pressed"
  >
    <component
      :is="props.iconComponent"
      :style="{
        width: props.size,
      }"
    ></component>
  </button>
</template>

<style scoped>
.icon {
  border: none;
  background: transparent;
  color: v-bind('props.color');
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
