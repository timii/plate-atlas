<script setup lang="ts">
const props = defineProps<{
  text: string
  id?: string
}>()
</script>

<template>
  <p :id="props.id" class="atlas-field-label">{{ props.text }}</p>
</template>
