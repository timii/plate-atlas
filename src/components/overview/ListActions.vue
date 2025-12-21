<script setup lang="ts">
import { computed, ref, type PropType } from 'vue'
import Dropdown from '../shared/Dropdown.vue'
import Searchbar from '../shared/Searchbar.vue'
import { SortBy, type IDropdownItem } from '@/models/dropdown.model'

const props = defineProps({
  shownElementsInfo: {
    type: Object as PropType<{ current: number; total: number }>,
    default: () => {},
  },
  elementTypes: {
    type: String,
    default: 'countries',
  },
})

// let the parent component define the search and sort behaviour
const searchTerm = defineModel('searchTerm', {
  type: String,
  default: '',
})
const sortBy = defineModel('sortBy', {
  type: String as PropType<SortBy>,
  default: SortBy.ALPHABETIC_ASC,
})

const sortByElements = ref([
  { id: 1, label: 'Alphabetic Asc', value: SortBy.ALPHABETIC_ASC, selected: true },
  { id: 2, label: 'Alphabetic Desc', value: SortBy.ALPHABETIC_DESC, selected: false },
])

function onSortBySelect(item: IDropdownItem) {
  // find index of selected item in list
  const index = sortByElements.value.findIndex((e) => e.id === item.id)
  if (index !== -1) {
    // reset `selected` of every element to false
    sortByElements.value = sortByElements.value.map((e) => ({ ...e, selected: false }))

    // update `selected` of element at correct index
    sortByElements.value[index] = { ...sortByElements.value[index], selected: true }

    // update model with selected value
    sortBy.value = sortByElements.value[index].value
  }
}

const elementsInfoAvailable = computed(
  () =>
    props.shownElementsInfo &&
    'current' in props.shownElementsInfo &&
    'total' in props.shownElementsInfo,
)
</script>

<template>
  <div class="actions flex w-full items-end justify-between gap-6">
    <div class="flex items-center gap-4">
      <Searchbar v-model:text="searchTerm"></Searchbar>
      <div
        v-if="elementsInfoAvailable"
        class="text-base text-text-light-secondary dark:text-text-dark-secondary"
      >
        Showing <span class="highlight">{{ props.shownElementsInfo.current }}</span> of
        <span class="highlight">{{ props.shownElementsInfo.total }}</span> {{ props.elementTypes }}
      </div>
    </div>
    <div>
      <!-- <div class="actions-search">group by</div> -->
      <Dropdown :label="'Sort by'" :list="sortByElements" @select="onSortBySelect"></Dropdown>
    </div>
  </div>
</template>

<style scoped>
.highlight {
  color: var(--color-text);
}
</style>
