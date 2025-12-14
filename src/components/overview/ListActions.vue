<script setup lang="ts">
import { ref, watch } from 'vue'
import Dropdown from '../shared/Dropdown.vue'
import Searchbar from '../shared/Searchbar.vue'
import { SortBy, type IDropdownItem } from '@/models/dropdown.model'
import { useCountriesStore } from '@/stores/countries'

const searchTerm = ref('')

const store = useCountriesStore()

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

    // update store with selected value
    store.sortBy = sortByElements.value[index].value
  }
}

watch(
  () => searchTerm.value,
  (value: string) => {
    console.log('searchTerm changed:', value)
    // update search term in store
    store.searchTerm = value
  },
)
</script>

<template>
  <div class="actions flex w-full items-end justify-between gap-6">
    <div class="flex items-center gap-4">
      <Searchbar v-model:text="searchTerm"></Searchbar>
      <div class="text-base text-text-light-secondary dark:text-text-dark-secondary">
        Showing <span class="highlight">{{ store.mappedCountries.length }}</span> of
        <span class="highlight">{{ store.countries.countries.length }}</span> countries
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
