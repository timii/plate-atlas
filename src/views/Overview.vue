<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { RouterLink } from 'vue-router'
import countriesJson from '@/data/current-license-plates.json'
import type { IDropdownItem } from '@/models/dropdown.model'
import FilterDropdown from '@/components/shared/FilterDropdown.vue'
import SearchField from '@/components/shared/SearchField.vue'
import { type CountryGroupBy, type CountrySortMode, useCountriesStore } from '@/stores/countries'
import { getToneStyle } from '@/constants/continentTone'

type DropdownKey = 'sort' | 'group' | 'continent' | null

const countriesStore = useCountriesStore()
const {
  searchTerm,
  sortMode,
  groupBy,
  selectedContinent,
  allCountriesLength,
  lastUpdatedLabel,
  sortDropdownItems,
  groupDropdownItems,
  continentDropdownItems,
  orderedCountries,
  groupedCountries,
  hasResults,
} = storeToRefs(countriesStore)

// keep track of if and which dropdown is currently open
const activeDropdown = ref<DropdownKey>(null)

function onSortSelect(item: IDropdownItem) {
  sortMode.value = item.value as CountrySortMode
  activeDropdown.value = null
}

function onGroupBySelect(item: IDropdownItem) {
  groupBy.value = item.value as CountryGroupBy
  activeDropdown.value = null
}

function onContinentSelect(item: IDropdownItem) {
  selectedContinent.value = item.value
  activeDropdown.value = null
}

function onDropdownToggle(key: Exclude<DropdownKey, null>, nextOpen: boolean) {
  activeDropdown.value = nextOpen ? key : null
}

function rowStyle(continent: string): Record<string, string> {
  return getToneStyle(continent)
}

function detailPath(code: string): string {
  return `/overview/${code.toLowerCase()}`
}

onMounted(() => {
  countriesStore.setCountries(countriesJson)
})
</script>

<template>
  <section class="overview-page -mx-4 -mt-14 min-h-screen px-4 pt-20 pb-12 sm:-mx-6 sm:px-6">
    <header class="hero">
      <h1 class="title">Countries</h1>
      <p class="subtitle">
        List of international vehicle registration codes for countries worldwide (last updated:
        {{ lastUpdatedLabel }})
      </p>
    </header>

    <section class="controls" aria-label="overview controls">
      <div class="control-row">
        <div class="search-wrap">
          <p class="field-label">Search</p>
          <SearchField class="search" v-model:text="searchTerm" />
        </div>
        <FilterDropdown
          label="Sort by"
          :list="sortDropdownItems"
          :open="activeDropdown === 'sort'"
          @toggle="(nextOpen) => onDropdownToggle('sort', nextOpen)"
          @select="onSortSelect"
        />
        <FilterDropdown
          label="Group by"
          :list="groupDropdownItems"
          :open="activeDropdown === 'group'"
          @toggle="(nextOpen) => onDropdownToggle('group', nextOpen)"
          @select="onGroupBySelect"
        />
        <FilterDropdown
          label="Continent"
          :list="continentDropdownItems"
          :open="activeDropdown === 'continent'"
          @toggle="(nextOpen) => onDropdownToggle('continent', nextOpen)"
          @select="onContinentSelect"
        />
      </div>

      <p class="count">
        Showing <span>{{ orderedCountries.length }}</span> out of
        <span>{{ allCountriesLength }}</span> rows
      </p>
    </section>

    <section v-if="hasResults" class="groups mt-8" aria-label="country rows">
      <article v-for="group in groupedCountries" :key="group.key" class="group-block">
        <header v-if="groupBy !== 'none'" class="group-header">
          <h2 class="group-title">{{ group.label }}</h2>
          <p class="group-count">{{ group.rows.length }}</p>
        </header>

        <div class="rows">
          <RouterLink
            v-for="country in group.rows"
            :key="country.code"
            :to="detailPath(country.code)"
            class="row"
            :style="rowStyle(country.continent)"
          >
            <span class="code">{{ country.code }}</span>
            <span class="meta">
              <span class="name">{{ country.country }}</span>
              <span class="continent">{{ country.continent }}</span>
            </span>
            <span class="end">
              <img :src="country.flagThumb" :alt="`${country.country} flag`" loading="lazy" />
            </span>
          </RouterLink>
        </div>
      </article>
    </section>

    <section v-else class="empty-state mt-8" aria-live="polite">
      <h2>No countries match these filters</h2>
      <p>Try clearing search text, changing continent, or setting group by to none</p>
    </section>
  </section>
</template>

<style scoped>
.overview-page {
  --bg-1: var(--atlas-bg-1);
  --bg-2: var(--atlas-bg-2);
  --surface: var(--atlas-surface);
  --surface-2: var(--atlas-surface-2);
  --text: var(--atlas-text);
  --muted: var(--atlas-muted);
  --line: var(--atlas-line);
  --code-chip-width: 3.5rem;
  background: linear-gradient(165deg, var(--bg-1), var(--bg-2));
  color: var(--text);
  font-size: 1.1rem;
  font-weight: 400;
  padding-bottom: calc(env(safe-area-inset-bottom) + 2.8rem);
}

.hero {
  display: grid;
  gap: 0.5rem;
  justify-items: center;
  text-align: center;
  margin-top: clamp(1rem, 2.2vw, 1.85rem);
}

.title {
  font-size: clamp(2.1rem, 8vw, 4.3rem);
  line-height: 0.9;
}

.subtitle {
  color: var(--muted);
}

.controls {
  margin-top: clamp(0.95rem, 2vw, 1.45rem);
  display: grid;
  gap: 0.82rem;
  border: 1px solid var(--line);
  border-radius: 0.62rem;
  background: var(--surface);
  padding: 0.88rem;
}

.control-row {
  display: grid;
  gap: 0.72rem;
}

.search,
.search-wrap {
  min-width: 0;
}

.field-label {
  margin-bottom: 0.32rem;
  font-size: 0.74rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--muted);
}

@media (min-width: 980px) {
  .control-row {
    grid-template-columns: minmax(14rem, 1.2fr) repeat(3, minmax(10rem, 1fr));
    align-items: end;
  }
}

.count {
  font-size: 0.74rem;
  color: var(--muted);
}

.count span {
  color: var(--text);
}

.groups {
  display: grid;
  gap: 0.7rem;
}

.empty-state {
  border: 1px solid color-mix(in oklab, var(--line) 78%, #ffffff 22%);
  border-radius: 0.46rem;
  background: linear-gradient(180deg, rgba(12, 10, 18, 0.94), rgba(8, 6, 13, 0.9));
  padding: 0.95rem 0.9rem;
}

.empty-state h2 {
  margin: 0;
  font-size: 0.94rem;
  letter-spacing: 0.02em;
}

.empty-state p {
  margin: 0.32rem 0 0;
  color: var(--muted);
  font-size: 0.78rem;
}

.group-block {
  display: grid;
  gap: 0.34rem;
}

.group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid color-mix(in oklab, var(--line) 78%, #ffffff 22%);
  border-radius: 0.46rem;
  background: linear-gradient(180deg, rgba(12, 10, 18, 0.94), rgba(8, 6, 13, 0.9));
  padding: 0.36rem 0.56rem;
}

.group-title {
  margin: 0;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--text);
}

.group-count {
  margin: 0;
  font-size: 0.68rem;
  color: var(--text);
  border: 1px solid var(--line);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  padding: 0.08rem 0.46rem;
  line-height: 1.2;
}

.rows {
  display: grid;
  gap: 0.34rem;
}

.row {
  --tone: #97a0b5;
  display: grid;
  grid-template-columns: var(--code-chip-width) minmax(0, 1fr) auto;
  gap: 0.56rem;
  align-items: center;
  border: 1px solid var(--line);
  border-left: 0.34rem solid color-mix(in oklab, var(--tone) 76%, #ffffff);
  border-radius: 0.44rem;
  background: var(--surface);
  padding: 0.42rem 0.56rem;
  transition:
    border-color 140ms ease,
    background 140ms ease;
}

.row:hover {
  border-color: color-mix(in oklab, var(--tone) 66%, var(--line));
  background: color-mix(in oklab, var(--surface) 82%, #ffffff 18%);
}

.row:focus-visible {
  outline: 2px solid color-mix(in oklab, var(--tone) 70%, #ffffff);
  outline-offset: 2px;
}

.code {
  border: 1px solid var(--line);
  border-radius: 0.22rem;
  min-inline-size: var(--code-chip-width);
  inline-size: var(--code-chip-width);
  padding: 0.02rem 0.2rem;
  display: inline-flex;
  justify-content: center;
  align-self: center;
  font-size: 0.75rem;
  letter-spacing: 0.06em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-variant-numeric: tabular-nums;
}

.meta {
  min-width: 0;
  display: grid;
  gap: 0.08rem;
}

.name {
  display: block;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 1rem;
  line-height: 1.2;
}

.continent {
  display: block;
  font-size: 0.62rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--muted);
}

.end {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  align-self: center;
  inline-size: 1.54rem;
  flex: 0 0 1.54rem;
}

.row img {
  width: 1.24rem;
  border-radius: 0.16rem;
  border: 1px solid var(--line);
  display: block;
}

@media (max-width: 760px) {
  .hero {
    margin-top: 0.72rem;
  }

  .controls {
    margin-top: 0.82rem;
  }

  .control-row {
    grid-template-columns: 1fr;
    gap: 0.62rem;
  }

  .row {
    gap: 0.46rem;
    padding: 0.4rem 0.5rem;
  }

  .name {
    overflow-wrap: anywhere;
  }
}
</style>
