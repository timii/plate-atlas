<script setup lang="ts">
import DetailInfoBox from '@/components/detail/DetailInfoBox.vue'
import RegionCard from '@/components/detail/RegionCard.vue'
import ListActions from '@/components/overview/ListActions.vue'
import NoResults from '@/components/shared/NoResults.vue'
import { useDetailsStore } from '@/stores/details'
import { storeToRefs } from 'pinia'

const props = defineProps<{
  formatDescription: string
}>()

const detailsStore = useDetailsStore()
const { mappedDetailsLength, allDetailsLength, mappedDetails, searchTerm, sortBy } =
  storeToRefs(detailsStore)
</script>

<template>
  <div class="content flex w-4/5 flex-col items-center justify-center gap-8">
    <DetailInfoBox v-if="props.formatDescription" :title="'Plate format'">
      {{ props.formatDescription }}
    </DetailInfoBox>

    <ListActions
      :shown-elements-info="{ current: mappedDetailsLength, total: allDetailsLength }"
      :element-types="'regions'"
      v-model:search-term="searchTerm"
      v-model:sort-by="sortBy"
    ></ListActions>
    <div v-if="mappedDetails && mappedDetails.length > 0" class="list flex w-full flex-wrap gap-4">
      <div class="list-element w-full" v-for="detail in mappedDetails" :key="detail.code">
        <RegionCard :region="detail" />
      </div>
    </div>
    <NoResults v-else />
  </div>
</template>
