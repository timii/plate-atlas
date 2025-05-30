<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

onMounted(() => {
  console.log('onMounted in Detail called -> code:', route.params.code)
  // TODO: dynamically import country details using code
})
</script>

<template>
  <div>Detail page for {{ $route.params.code }}</div>
</template>

<style scoped></style>
