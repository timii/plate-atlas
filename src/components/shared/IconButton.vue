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
    class="cursor-pointer rounded-lg p-1 transition-all duration-200 ease-cubic hover:bg-background-light-hover hover:dark:bg-background-dark-hover"
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
