<script setup lang="ts">
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
</script>

<template>
  <span
    class="atlas-code-chip"
    :class="{
      'atlas-code-chip--accented': props.accented,
      'atlas-code-chip--multiline': props.multiline,
    }"
    :title="props.title || props.text"
  >
    {{ props.text }}
  </span>
</template>
