<script setup lang="ts">
import type { ICountry } from '@/models/country.interface'
import type { PropType } from 'vue'

const props = defineProps({
  country: {
    type: Object as PropType<ICountry>,
    required: true,
  },
})
</script>

<!-- Version 1 -->
<!-- <template>
  <div
    class="country-card flex flex-row rounded pr-2 gap-2 items-center bg-background-dark-highlight shadow-sm shadow-background-dark-highlight-layer2 cursor-pointer"
  >
    <div class="flex flex-row gap-2 items-center bg-background-dark-highlight-layer2 p-2">
      <img :src="props.country.flagThumb" :alt="'flag'" />
      <div>{{ props.country.code }}</div>
    </div>
    <div>{{ props.country.country }}</div>
  </div>
</template> -->

<!-- Version 2 -->
<!-- <template>
  <div
    class="country-card flex flex-row rounded pr-2 gap-2 items-center bg-background-dark-highlight shadow-sm shadow-background-dark-highlight-layer2 cursor-pointer"
  >
    <div
      class="flex flex-row gap-2 items-center bg-background-dark-highlight-layer2 p-2 text-xl font-bold"
    >
      <div>{{ props.country.code }}</div>
    </div>
    <div>{{ props.country.country }}</div>
    <div class="image-container">
      <img :src="props.country.flagThumb" :alt="'flag'" />
    </div>
  </div>
</template> -->

<!-- Version 3 -->
<!-- <template>
  <div
    class="country-card flex flex-row rounded pr-2 gap-2 items-center bg-background-dark-highlight shadow-sm shadow-background-dark-highlight-layer2 cursor-pointer"
  >
    <div
      class="flex flex-row gap-2 items-center bg-background-dark-highlight-layer2 p-2 text-xl font-bold h-full border-r rounded-[inherit] border-gray-600"
    >
      <div>{{ props.country.code }}</div>
    </div>
    <div class="flex flex-col leading-5">
      <div>{{ props.country.country }}</div>
      <div class="text-sm italic text-gray-400">{{ props.country.continent }}</div>
    </div>
    <div class="image-container ml-2 max-h-6 max-w-7">
      <img :src="props.country.flagThumb" :alt="'flag'" />
    </div>
  </div>
</template> -->

<!-- Version 4 -->
<template>
  <div
    class="country-card flex flex-row rounded pr-2 gap-2 items-center bg-background-dark-highlight shadow-sm shadow-background-dark-highlight-layer2 cursor-pointer h-12"
  >
    <div
      class="flex flex-row gap-2 items-center bg-background-dark-highlight-layer2 p-2 text-xl font-bold h-full border-r rounded-[inherit] border-gray-600"
    >
      <div>{{ props.country.code }}</div>
    </div>
    <div class="flex flex-col leading-5">
      <div>{{ props.country.country }}</div>
      <div class="text-sm italic text-gray-400">{{ props.country.continent }}</div>
    </div>
    <div class="flex flex-col leading-5 items-center">
      <div class="image-container ml-2 max-h-6 max-w-7">
        <img :src="props.country.flagThumb" :alt="'flag'" />
      </div>
      <div class="text-sm italic text-gray-400">{{ props.country.fromYear }}</div>
    </div>
  </div>
</template>

<style scoped></style>
