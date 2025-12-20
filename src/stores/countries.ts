import { type ICountryData } from '@/models/country.model'
import { SortBy } from '@/models/dropdown.model'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

// dynamically get available country codes from folder of detail jsons
const countryDetailFiles = import.meta.glob('/src/data/countries/en/*.json', { eager: true })
const availableCountryCodes = new Set(
  Object.keys(countryDetailFiles).map((path) => {
    const filename = path.split('/').pop()?.replace('.json', '') || ''
    return filename.toLowerCase()
  }),
)

export const useCountriesStore = defineStore('countries', () => {
  const countries = ref<ICountryData>({ lastUpdate: '', countries: [] })
  const searchTerm = ref<string>('')
  const sortBy = ref<SortBy>(SortBy.ALPHABETIC_ASC)
  const favorites = ref<string[]>([])

  // keep track of amount of all and mapped countries
  const allCountriesLength = computed(() => countries.value.countries.length ?? 0)
  const mappedCountriesLength = computed(() => mappedCountries.value.length ?? 0)

  // return list of countries after being filtered and sorted
  const mappedCountries = computed(() => {
    console.log('mappedCountries -> searchTerm:', searchTerm.value, 'sortBy:', sortBy.value)

    // filter countries by available detail JSONs
    const countriesCopy = countries.value.countries.filter((countryObj) => {
      return availableCountryCodes.has(countryObj.code.toLowerCase())
    })

    // filter countries by `searchTerm`
    const filtered = countriesCopy.filter((countryObj) => {
      const countryName = countryObj.country.toLowerCase()
      return countryName.includes(searchTerm.value.toLowerCase())
    })

    // sort filtered countries by current `sortBy` value
    const sorted = filtered.sort((a, b) => {
      // sort alphabetically in descending order
      if (sortBy.value === SortBy.ALPHABETIC_DESC) {
        return b.country.localeCompare(a.country)
      }

      // sort alphabetically in asecnding order
      else {
        return a.country.localeCompare(b.country)
      }
    })

    console.log('mappedCountries return:', sorted)
    return sorted
  })

  return {
    countries,
    searchTerm,
    sortBy,
    favorites,
    allCountriesLength,
    mappedCountriesLength,
    mappedCountries,
  }
})
