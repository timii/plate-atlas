<script setup lang="ts">
import { ref, watch } from 'vue'
import SearchBar from '../shared/SearchBar.vue'
import Dropdown from '../shared/Dropdown.vue'
import type { IDropdownItem } from '@/models/dropdown.model'

const searchTerm = ref('')

const sortByElements = ref([
  { id: 1, label: 'Alphabetic Asc', value: 'alphabetic_asc', selected: true },
  { id: 2, label: 'Alphabetic Desc', value: 'alphabetic_desc', selected: false },
])

function onSortBySelect(item: IDropdownItem) {
  // find index of selected item in list
  const index = sortByElements.value.findIndex((e) => e.id === item.id)
  if (index !== -1) {
    // reset `selected` of every element to false
    sortByElements.value = sortByElements.value.map((e) => ({ ...e, selected: false }))

    // update `selected` of element at correct index
    sortByElements.value[index] = { ...sortByElements.value[index], selected: true }
  }
}

watch(
  () => searchTerm.value,
  (value: string) => {
    console.log('searchTerm changed:', value)
    // TODO: filter country list
  },
)
</script>

<template>
  <div class="actions flex w-full items-center justify-between gap-6">
    <SearchBar v-model:text="searchTerm"></SearchBar>
    <div>
      <!-- <div class="actions-search">group by</div> -->
      <Dropdown :label="'Sort by'" :list="sortByElements" @select="onSortBySelect"></Dropdown>
    </div>
  </div>
</template>

<style scoped></style>
