import { type ICountryData } from '@/models/country.model'
import { SortBy } from '@/models/dropdown.model'
import { randomIntFromInterval } from '@/utils/utils'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useCountriesStore = defineStore('countries', () => {
  const countries = ref<ICountryData>({ lastUpdate: '', countries: [] })
  const searchTerm = ref<string>('')
  const sortBy = ref<SortBy>(SortBy.ALPHABETIC_ASC)

  // return list of countries after being filtered and sorted
  const mappedCountries = computed(() => {
    console.log('mappedCountries -> searchTerm:', searchTerm.value, 'sortBy:', sortBy.value)
    const countriesCopy = countries.value.countries
    // const countriesLength = countriesCopy.length
    // const slice = countriesCopy.slice(0, randomIntFromInterval(1, countriesLength))

    // filter countries by search term
    const filtered = countriesCopy.filter((countryObj) => {
      const countryName = countryObj.country.toLowerCase()
      return countryName.includes(searchTerm.value.toLowerCase())
    })

    console.log('mappedCountries return:', filtered)
    return filtered
  })

  return { countries, searchTerm, sortBy, mappedCountries }
})
