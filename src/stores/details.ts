import { type ICountryDetailCode } from '@/models/country.model'
import { SortBy } from '@/models/dropdown.model'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useDetailsStore = defineStore('details', () => {
  const details = ref<ICountryDetailCode[]>([])
  const searchTerm = ref<string>('')
  const sortBy = ref<SortBy>(SortBy.ALPHABETIC_ASC)

  // keep track of amount of all and mapped countries
  const allDetailsLength = computed(() => details.value.length ?? 0)
  const mappedDetailsLength = computed(() => mappedDetails.value.length ?? 0)

  // return list of countries after being filtered and sorted
  const mappedDetails = computed(() => {
    console.log('mappedDetails -> searchTerm:', searchTerm.value, 'sortBy:', sortBy.value)

    const detailsCopy = details.value

    // filter details by `searchTerm`
    const filtered = detailsCopy.filter((detail) => {
      const detailName = detail.name.toLowerCase()
      return detailName.includes(searchTerm.value.toLowerCase())
    })

    // sort filtered details by current `sortBy` value
    const sorted = filtered.sort((a, b) => {
      // sort alphabetically in descending order
      if (sortBy.value === SortBy.ALPHABETIC_DESC) {
        return b.name.localeCompare(a.name)
      }

      // sort alphabetically in asecnding order
      else {
        return a.name.localeCompare(b.name)
      }
    })

    console.log('mappedDetails return:', sorted)
    return sorted
  })

  return {
    details,
    searchTerm,
    sortBy,
    allDetailsLength,
    mappedDetailsLength,
    mappedDetails,
  }
})
