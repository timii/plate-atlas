import { type ICountryDetailCode, type ICountryDetailExampleImages } from '@/models/country.model'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export type DetailSortMode = 'name' | 'code'

export const useDetailsStore = defineStore('details', () => {
  const details = ref<ICountryDetailCode[]>([])
  const exampleImages = ref<ICountryDetailExampleImages[]>([])
  const searchTerm = ref<string>('')
  const sortMode = ref<DetailSortMode>('name')

  // keep track of amount of all and mapped details
  const allDetailsLength = computed(() => details.value.length ?? 0)
  const mappedDetailsLength = computed(() => mappedDetails.value.length ?? 0)

  // filter and sort details in a deterministic order for all consumers
  const mappedDetails = computed(() => {
    const normalizedSearch = searchTerm.value.toLowerCase().trim()

    // include both code and name in the search target
    const filtered = details.value.filter((detail) => {
      const target = `${detail.code} ${detail.name}`.toLowerCase()
      return target.includes(normalizedSearch)
    })

    // sort after filtering so rendered rows reflect current subset order
    return [...filtered].sort((a, b) => {
      if (sortMode.value === 'code') {
        return a.code.localeCompare(b.code)
      }

      return a.name.localeCompare(b.name)
    })
  })

  return {
    details,
    exampleImages,
    searchTerm,
    sortMode,
    allDetailsLength,
    mappedDetailsLength,
    mappedDetails,
  }
})
