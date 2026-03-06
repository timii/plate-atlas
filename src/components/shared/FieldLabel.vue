<script setup lang="ts">
const props = defineProps<{
  text: string
}>()
</script>

<template>
  <p class="atlas-field-label">{{ props.text }}</p>
</template>
