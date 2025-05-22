<script setup lang="ts">
import { ref, watch } from 'vue'
import SearchBar from '../shared/SearchBar.vue'
import Dropdown from '../shared/Dropdown.vue'
import type { IDropdownItem } from '@/models/dropdown.model'

const searchTerm = ref('')

const sortByElements: IDropdownItem[] = [
  { id: 1, label: 'Alphabetic Asc', value: 'alphabetic_asc' },
  { id: 2, label: 'Alphabetic Desc', value: 'alphabetic_desc' },
]

function onSortBySelect(item: string) {
  console.log('onSortBySelect -> item:', item)
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
