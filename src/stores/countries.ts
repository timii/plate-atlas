import type { ICountry, ICountryData } from '@/models/country.model'
import type { IDropdownItem } from '@/models/dropdown.model'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export type CountrySortMode = 'country' | 'code'
export type CountryGroupBy = 'none' | 'letter' | 'continent'

export interface ICountryGroup {
  key: string
  label: string
  rows: ICountry[]
}

const continentOrder = ['Africa', 'Americas', 'Asia', 'Europe', 'Oceania'] as const

// resolve which overview rows have detail pages
const countryDetailFiles = import.meta.glob('/src/data/countries/en/*.json', { eager: true })
const availableCountryCodes = new Set(
  Object.keys(countryDetailFiles).map((path) => {
    const filename = path.split('/').pop()?.replace('.json', '') || ''
    return filename.toLowerCase()
  }),
)

export const useCountriesStore = defineStore('countries', () => {
  const countries = ref<ICountryData>({ lastUpdate: '', countries: [] })
  const favorites = ref<string[]>([])

  // shared list controls for overview and future filter/sort components
  const searchTerm = ref('')
  const sortMode = ref<CountrySortMode>('country')
  const groupBy = ref<CountryGroupBy>('none')
  const selectedContinent = ref('all')

  const countriesWithDetails = computed(() => {
    return countries.value.countries.filter((country) => {
      return availableCountryCodes.has(country.code.toLowerCase())
    })
  })

  const allCountriesLength = computed(() => countriesWithDetails.value.length)

  const lastUpdatedLabel = computed(() => {
    if (!countries.value.lastUpdate) return ''

    const date = new Date(countries.value.lastUpdate)
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }
    return date.toLocaleDateString(undefined, options)
  })

  const continentCounts = computed(() => {
    const counts = new Map<string, number>()
    countriesWithDetails.value.forEach((country) => {
      counts.set(country.continent, (counts.get(country.continent) ?? 0) + 1)
    })
    return counts
  })

  const sortDropdownItems = computed<IDropdownItem[]>(() => [
    { id: 1, label: 'Country', value: 'country', selected: sortMode.value === 'country' },
    { id: 2, label: 'Code', value: 'code', selected: sortMode.value === 'code' },
  ])

  const groupDropdownItems = computed<IDropdownItem[]>(() => [
    { id: 1, label: 'None', value: 'none', selected: groupBy.value === 'none' },
    { id: 2, label: 'Letter', value: 'letter', selected: groupBy.value === 'letter' },
    { id: 3, label: 'Continent', value: 'continent', selected: groupBy.value === 'continent' },
  ])

  const continentDropdownItems = computed<IDropdownItem[]>(() => {
    const items: IDropdownItem[] = [
      {
        id: 1,
        label: `All (${allCountriesLength.value})`,
        value: 'all',
        selected: selectedContinent.value === 'all',
      },
    ]

    continentOrder
      .filter((continent) => continentCounts.value.has(continent))
      .forEach((continent, index) => {
        items.push({
          id: index + 2,
          label: `${continent} (${continentCounts.value.get(continent) ?? 0})`,
          value: continent,
          selected: selectedContinent.value === continent,
        })
      })

    return items
  })

  // list pipeline order:
  // 1) countriesWithDetails -> base source
  // 2) filteredCountries -> search + continent filter
  // 3) orderedCountries -> sort mode
  // 4) groupedCountries -> group projection of sorted rows
  const filteredCountries = computed(() => {
    const normalizedSearch = searchTerm.value.toLowerCase().trim()

    // apply search and continent filters first so sort/group operate on the same subset
    return countriesWithDetails.value.filter((country) => {
      const continentMatch =
        selectedContinent.value === 'all' || selectedContinent.value === country.continent
      const target = `${country.country} ${country.code} ${country.continent}`.toLowerCase()
      return continentMatch && target.includes(normalizedSearch)
    })
  })

  const orderedCountries = computed(() => {
    // sort only after filtering so sort cost and results are tied to visible rows
    return [...filteredCountries.value].sort((a, b) => {
      if (sortMode.value === 'code') {
        return a.code.localeCompare(b.code)
      }

      return a.country.localeCompare(b.country)
    })
  })

  const groupedCountries = computed<ICountryGroup[]>(() => {
    // group is the final projection and always uses already sorted rows
    if (groupBy.value === 'none') {
      return [{ key: 'all', label: 'all', rows: orderedCountries.value }]
    }

    // collect rows once and project by active grouping mode
    const groups = new Map<string, ICountry[]>()
    orderedCountries.value.forEach((country) => {
      const key =
        groupBy.value === 'letter' ? country.country[0]?.toUpperCase() || '#' : country.continent
      const items = groups.get(key) ?? []
      items.push(country)
      groups.set(key, items)
    })

    if (groupBy.value === 'continent') {
      return continentOrder
        .filter((continent) => groups.has(continent))
        .map((continent) => ({
          key: continent,
          label: continent,
          rows: groups.get(continent) ?? [],
        }))
    }

    return [...groups.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, rows]) => ({ key, label: key, rows }))
  })

  const hasResults = computed(() => orderedCountries.value.length > 0)

  // keep these aliases for backwards compatibility with earlier overview wiring
  const mappedCountries = computed(() => orderedCountries.value)
  const mappedCountriesLength = computed(() => orderedCountries.value.length)

  function setCountries(data: ICountryData) {
    countries.value = data
  }

  return {
    countries,
    favorites,
    searchTerm,
    sortMode,
    groupBy,
    selectedContinent,
    allCountriesLength,
    mappedCountries,
    mappedCountriesLength,
    lastUpdatedLabel,
    sortDropdownItems,
    groupDropdownItems,
    continentDropdownItems,
    orderedCountries,
    groupedCountries,
    hasResults,
    setCountries,
  }
})
