<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { RouterLink } from 'vue-router'
import countriesJson from '@/data/current-license-plates.json'
import type { ICountry } from '@/models/country.model'
import type { IDropdownItem } from '@/models/dropdown.model'
import CodeChip from '@/components/shared/CodeChip.vue'
import Dropdown from '@/components/shared/Dropdown.vue'
import FilterPanel from '@/components/shared/FilterPanel.vue'
import FieldLabel from '@/components/shared/FieldLabel.vue'
import Searchbar from '@/components/shared/Searchbar.vue'
import PageHeader from '@/components/shared/PageHeader.vue'
import EmptyState from '@/components/shared/EmptyState.vue'
import { type CountryGroupBy, type CountrySortMode, useCountriesStore } from '@/stores/countries'
import { getToneStyle } from '@/constants/continentTone'
import { pickPreferredStaticAssetUrl } from '@/utils/assetUrl'

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
  // keep overview row accents driven by the shared continent tone map
  return getToneStyle(continent)
}

function detailPath(code: string): string {
  return `/overview/${code.toLowerCase()}`
}

// prefer mirrored assets while keeping remote fallback
function flagThumbSrc(country: ICountry): string {
  return pickPreferredStaticAssetUrl(country.flagThumbLocal, country.flagThumb)
}

function flagThumbFallback(country: ICountry): string {
  return country.flagThumbLocal ? country.flagThumb : ''
}

// retry the original remote asset if the local path is missing
function onFlagError(event: Event) {
  const target = event.target
  if (!(target instanceof HTMLImageElement)) {
    return
  }

  const fallbackSrc = target.dataset.fallbackSrc
  if (
    fallbackSrc &&
    target.getAttribute('src') !== fallbackSrc &&
    target.currentSrc !== fallbackSrc
  ) {
    target.src = fallbackSrc
    target.dataset.fallbackSrc = ''
    return
  }

  target.style.visibility = 'hidden'
}

onMounted(() => {
  countriesStore.setCountries(countriesJson)
})
</script>

<template>
  <section class="overview-page -mx-4 min-h-screen px-4 pb-12 sm:-mx-6 sm:px-6">
    <div class="content-shell">
      <PageHeader
        title="Countries"
        :meta="`${allCountriesLength} countries - updated ${lastUpdatedLabel}`"
      />

      <FilterPanel
        ariaLabel="overview controls"
        desktop-columns="minmax(14rem, 1.2fr) repeat(3, minmax(10rem, 1fr))"
      >
        <div class="search-wrap">
          <FieldLabel text="Search" />
          <Searchbar
            class="search"
            v-model:text="searchTerm"
            aria-label="search countries by country name, code, or continent"
          />
        </div>
        <Dropdown
          label="Sort by"
          :list="sortDropdownItems"
          :open="activeDropdown === 'sort'"
          @toggle="(nextOpen) => onDropdownToggle('sort', nextOpen)"
          @select="onSortSelect"
        />
        <Dropdown
          label="Group by"
          :list="groupDropdownItems"
          :open="activeDropdown === 'group'"
          @toggle="(nextOpen) => onDropdownToggle('group', nextOpen)"
          @select="onGroupBySelect"
        />
        <Dropdown
          label="Continent"
          :list="continentDropdownItems"
          :open="activeDropdown === 'continent'"
          @toggle="(nextOpen) => onDropdownToggle('continent', nextOpen)"
          @select="onContinentSelect"
        />
        <template #footer>
          <p class="count">
            Showing <span>{{ orderedCountries.length }}</span> out of
            <span>{{ allCountriesLength }}</span> rows
          </p>
        </template>
      </FilterPanel>

      <section v-if="hasResults" class="groups" aria-label="country rows">
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
              class="row atlas-row"
              :style="rowStyle(country.continent)"
            >
              <CodeChip :text="country.code" />
              <span class="meta">
                <span class="name">{{ country.country }}</span>
                <span class="continent">{{ country.continent }}</span>
              </span>
              <span class="end">
                <img
                  :src="flagThumbSrc(country)"
                  :data-fallback-src="flagThumbFallback(country)"
                  :alt="`${country.country} flag`"
                  loading="lazy"
                  @error="onFlagError"
                />
              </span>
            </RouterLink>
          </div>
        </article>
      </section>

      <EmptyState
        v-else
        class="empty-state--overview"
        title="No countries match these filters"
        message="Try clearing search text, changing continent, or setting group by to none"
      />
    </div>
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
  margin-top: -3.5rem;
  padding-top: 5rem;
  font-size: 1.1rem;
  font-weight: 400;
  padding-bottom: calc(env(safe-area-inset-bottom) + 2.8rem);
}

.content-shell {
  width: min(var(--atlas-content-width), 100%);
  margin-inline: auto;
  display: grid;
  gap: 0.9rem;
}

.search,
.search-wrap {
  min-width: 0;
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
  margin-top: 0.18rem;
}

.empty-state--overview {
  margin-top: 0.18rem;
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
  border-radius: var(--atlas-radius-row);
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
  --atlas-row-accent-width: 0.34rem;
  --atlas-row-line: var(--line);
  --atlas-row-bg: var(--surface);
  --atlas-row-hover-line: color-mix(in oklab, var(--tone) 66%, var(--line));
  --atlas-row-hover-bg: color-mix(in oklab, var(--surface) 82%, #ffffff 18%);
  display: grid;
  grid-template-columns: var(--code-chip-width) minmax(0, 1fr) auto;
  padding: 0.42rem 0.56rem;
}

.row:focus-visible {
  outline: 2px solid color-mix(in oklab, var(--tone) 70%, #ffffff);
  outline-offset: 2px;
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
  /* return the page to normal flow when the mobile header scrolls away */
  .overview-page {
    margin-top: 0;
    padding-top: 0.95rem;
  }

  .row {
    gap: 0.46rem;
    padding: 0.4rem 0.5rem;
  }

  .name {
    overflow-wrap: anywhere;
  }
}

@media (min-width: 1500px) {
  .content-shell {
    width: min(var(--atlas-content-width-wide), 100%);
  }
}
</style>

