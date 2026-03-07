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
})
</script>

<template>
  <div
    v-if="props.iconComponent"
    class="icon cursor-pointer rounded-lg p-1 transition-all duration-200 ease-cubic"
  >
    <component
      :is="props.iconComponent"
      :style="{
        width: props.size,
      }"
    ></component>
  </div>
</template>

<style scoped>
.icon {
  /* keep icon actions aligned with the dark atlas surface language */
  color: v-bind('props.color');
}

.icon:hover {
  background: color-mix(in oklab, var(--atlas-surface) 72%, #ffffff 28%);
}
</style>
