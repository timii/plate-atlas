<script setup lang="ts">
import Info from '@/assets/icons/Info.vue'
import { useDetailsStore } from '@/stores/details'
import { storeToRefs } from 'pinia'

defineProps<{
  countryName: string
}>()

const detailsStore = useDetailsStore()
const { exampleImages } = storeToRefs(detailsStore)
</script>

<template>
  <div class="content flex w-4/5 flex-col items-center justify-center gap-8">
    <template v-if="exampleImages && exampleImages.length > 0">
      <div
        class="flex items-center gap-4 rounded-lg border border-border-light3 px-6 py-4 text-lg text-text-light-default dark:border-border-dark3 dark:bg-background-dark-highlight dark:text-text-dark-default dark:placeholder-gray-400"
      >
        <Info></Info>
        <span>
          License plates in {{ countryName ?? 'this country' }} are not tied to specific regions or
          area codes
        </span>
      </div>
      <div
        class="flex w-full flex-col items-center justify-center gap-4"
        v-for="imageCategory in exampleImages"
        :key="imageCategory.category"
      >
        <h2 class="text-center text-lg">{{ imageCategory.category }}</h2>
        <div class="flex max-w-full flex-wrap items-center justify-center gap-4">
          <template v-for="imageObj in imageCategory.images" :key="imageObj.url">
            <div class="flex flex-col">
              <img
                :src="imageObj.url"
                :alt="`Example image for ${imageObj.title ?? 'license plate'}`"
                class="max-h-72 max-w-64 object-contain"
              />
              <span
                class="max-w-64 text-center text-base text-wrap text-text-light-info dark:text-text-dark-info"
                >{{ imageObj.title }}</span
              >
            </div>
          </template>
        </div>
      </div>
    </template>
    <div v-else>No example</div>
  </div>
</template>
