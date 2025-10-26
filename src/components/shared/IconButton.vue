<script setup lang="ts">
import StarEmpty from '@/assets/icons/StarEmpty.vue'
import StarFilled from '@/assets/icons/StarFilled.vue'

const props = defineProps({
  icon: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <!-- ------------------------------- -->
  <!-- ------------------------------- -->
  <!-- ------------------------------- -->
  <!-- TODO: set correct color depending on color scheme -->
  <!-- TODO: use icon name from props for compoent -->
  <!-- ------------------------------- -->
  <!-- ------------------------------- -->
  <!-- ------------------------------- -->
  <div v-if="props.icon" class="text-white">
    <!-- <div>icon - {{ props.icon }}</div> -->
    <!-- <component :is="props.icon"></component> -->
    <StarEmpty />
    <StarFilled />
  </div>
</template>

<style scoped></style>
