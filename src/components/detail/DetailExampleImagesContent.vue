<script setup lang="ts">
import DetailInfoBox from '@/components/detail/DetailInfoBox.vue'
import { useDetailsStore } from '@/stores/details'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

const props = defineProps<{
  countryName: string
}>()

const detailsStore = useDetailsStore()
const { exampleImages } = storeToRefs(detailsStore)
const countryNameInSentence = computed(() =>
  props.countryName === 'No country found' ? 'no country found' : props.countryName,
)
</script>

<template>
  <div class="content flex w-4/5 flex-col items-center justify-center gap-8">
    <template v-if="exampleImages && exampleImages.length > 0">
      <DetailInfoBox :title="'Plate format'">
        License plates in {{ countryNameInSentence || 'this country' }} do not include region-specific
        codes; the examples below show common plate formats.
      </DetailInfoBox>
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
