<script setup lang="ts">
import type { ICountry } from '@/models/country.model'
import type { PropType } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  country: {
    type: Object as PropType<ICountry>,
    required: true,
  },
})

const router = useRouter()

function onCountryClick() {
  router.push(`/overview/${props.country.code.toLowerCase()}`)
}
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
<template>
  <div
    class="country-card flex flex-row rounded-lg pr-2 gap-2 items-center bg-background-light-default dark:bg-background-dark-highlight border border-border-light3 dark:border-border-dark3 cursor-pointer h-12 relative"
    @click="onCountryClick"
  >
    <div
      class="flex flex-row gap-2 items-center dark:bg-background-dark-highlight-layer2 p-2 text-xl font-bold h-full border-r rounded-[inherit] border-border-light2 dark:border-border-dark2"
    >
      <div>{{ props.country.code }}</div>
    </div>
    <div class="flex flex-col leading-5">
      <div>{{ props.country.country }}</div>
      <div class="text-sm italic dark:text-text-dark-info text-text-light-info">
        {{ props.country.continent }}
      </div>
    </div>
    <div class="image-container ml-2 max-h-6 max-w-7">
      <img :src="props.country.flagThumb" :alt="'flag'" />
    </div>
  </div>
</template>

<!-- Version 4 -->
<!-- <template>
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
</template> -->

<style scoped>
.country-card::after {
  --starting-position: 0px;
  --ending-position: 4px;
  --animation-time: 0.3s;
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
  -webkit-transition: all var(--animation-time) cubic-bezier(0.165, 0.84, 0.44, 1);
  transition: all var(--animation-time) cubic-bezier(0.165, 0.84, 0.44, 1);
}

.country-card:hover::after {
  top: var(--ending-position);
  left: var(--ending-position);
}
</style>
