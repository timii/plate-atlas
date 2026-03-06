<script setup lang="ts">
import { computed, type Component, type PropType } from 'vue'

interface Color {
  lightMode: string
  darkMode: string
}

const props = defineProps({
  iconComponent: {
    type: Object as PropType<Component>,
    required: true,
  },
  color: {
    type: Object as PropType<Color>,
    default: () => ({
      lightMode: '#000',
      darkMode: '#fff',
    }),
  },
  size: {
    type: String,
    default: '24px',
  },
})

const colorVariables = computed(() => ({
  lightMode: props.color.lightMode,
  darkMode: props.color.darkMode,
}))
</script>

<template>
  <div
    v-if="props.iconComponent"
    class="icon cursor-pointer rounded-lg p-1 transition-all duration-200 ease-cubic hover:bg-background-light-hover hover:dark:bg-background-dark-hover"
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
  color: v-bind('colorVariables.lightMode');
}
@media (prefers-color-scheme: dark) {
  .icon {
    color: v-bind('colorVariables.darkMode');
  }
}
</style>
