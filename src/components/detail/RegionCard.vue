<script setup lang="ts">
import type { ICountryDetail } from '@/models/country.model'
import type { PropType } from 'vue'

const props = defineProps({
  region: {
    type: Object as PropType<ICountryDetail>,
    required: true,
  },
})
</script>
<template>
  <div
    class="region-card relative flex h-12 cursor-pointer flex-row items-center gap-2 rounded-lg border border-border-light3 bg-background-light-default pr-2 dark:border-border-dark3 dark:bg-background-dark-highlight"
  >
    <div
      class="flex h-full min-w-16 items-center gap-2 rounded-[inherit] border-r border-border-light2 p-2 text-xl font-bold dark:border-border-dark2 dark:bg-background-dark-highlight-layer2"
    >
      <div>{{ props.region.code }}</div>
    </div>
    <div>{{ props.region.name }}</div>
  </div>
</template>

<style scoped>
.region-card::after {
  --starting-position: 0px;
  --ending-position: 4px;
  --animation-time: 0.2s;
  content: '';
  border-radius: 8px;
  position: absolute;
  z-index: -1;
  left: var(--starting-position);
  top: var(--starting-position);
  width: 100%;
  height: 100%;
  /* TODO: use accent color if defined */
  /* background-color: rgba(0, 88, 0, 0.589); */
  background-color: var(--color-background-hover);
  -webkit-transition: all var(--animation-time) var(--ease-cubic);
  transition: all var(--animation-time) var(--ease-cubic);
}

.region-card:hover::after {
  top: var(--ending-position);
  left: var(--ending-position);
}
</style>
