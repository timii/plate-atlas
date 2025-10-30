<script setup lang="ts">
import type { Component, PropType } from 'vue'

const props = defineProps({
  iconComponent: {
    type: Object as PropType<Component>,
    required: true,
  },
  color: {
    type: String,
    default: '#fff',
  },
  size: {
    type: String,
    default: '24px',
  },
})
</script>

<template>
  <!-- ------------------------------- -->
  <!-- ------------------------------- -->
  <!-- ------------------------------- -->
  <!-- TODO: set correct color depending on color scheme -->
  <!-- ------------------------------- -->
  <!-- ------------------------------- -->
  <!-- ------------------------------- -->
  <div
    v-if="props.iconComponent"
    :style="{
      color: props.color,
    }"
  >
    <component
      :is="props.iconComponent"
      :style="{
        width: props.size,
      }"
    ></component>
  </div>
</template>

<style scoped></style>
