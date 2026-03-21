<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { RouterLink } from 'vue-router'
import countriesJson from '@/data/current-license-plates.json'
import type { ICountry } from '@/models/country.model'
import type { IDropdownItem } from '@/models/dropdown.model'
import StarFilled from '@/assets/icons/StarFilled.vue'
import CodeChip from '@/components/shared/CodeChip.vue'
import Dropdown from '@/components/shared/Dropdown.vue'
import FilterPanel from '@/components/shared/FilterPanel.vue'
import FieldLabel from '@/components/shared/FieldLabel.vue'
import Searchbar from '@/components/shared/Searchbar.vue'
import PageHeader from '@/components/shared/PageHeader.vue'
import EmptyState from '@/components/shared/EmptyState.vue'
import { type CountryGroupBy, type CountrySortMode, useCountriesStore } from '@/stores/countries'
import { getToneStyle } from '@/constants/continentTone'
import { preloadCountryDetails } from '@/utils/countryDetailsLoader'
import { pickPreferredStaticAssetUrl } from '@/utils/assetUrl'

type DropdownKey = 'sort' | 'group' | 'continent' | null

const countriesStore = useCountriesStore()
const {
  searchTerm,
  sortMode,
  groupBy,
  selectedContinent,
  favoritesOnly,
  allCountriesLength,
  favoriteCount,
  lastUpdatedLabel,
  sortDropdownItems,
  groupDropdownItems,
  continentDropdownItems,
  orderedCountries,
  groupedCountries,
  hasResults,
} = storeToRefs(countriesStore)

const headerMeta = computed(() => {
  const parts = [`${allCountriesLength.value} countries`, `${favoriteCount.value} saved`]

  if (lastUpdatedLabel.value) {
    parts.push(`updated ${lastUpdatedLabel.value}`)
  }

  return parts.join(' - ')
})

const emptyStateTitle = computed(() => {
  if (favoritesOnly.value && favoriteCount.value === 0) {
    return 'No favorite countries yet'
  }

  if (favoritesOnly.value) {
    return 'No favorite countries match these filters'
  }

  return 'No countries match these filters'
})

const emptyStateMessage = computed(() => {
  if (favoritesOnly.value && favoriteCount.value === 0) {
    return 'Open a country detail page and use the star button to save it here'
  }

  if (favoritesOnly.value) {
    return 'Try clearing search text, changing continent, or switch back to all countries'
  }

  return 'Try clearing search text, changing continent, or setting group by to none'
})

const showFavoritesToggle = computed(() => favoriteCount.value > 0 || favoritesOnly.value)
const favoritesToggleLabel = computed(() => {
  return favoritesOnly.value ? 'Show all countries' : 'Show only favorites'
})
// pluralize favorites label for footer
const favoritesCountLabel = computed(() => {
  return favoriteCount.value === 1 ? 'favorite' : 'favorites'
})
// keep advanced filters collapsed on mobile by default
const mobileFiltersOpen = ref(false)
const mobileFiltersLabel = computed(() => {
  return mobileFiltersOpen.value ? 'Hide filters' : 'Filters'
})
const advancedFiltersId = 'overview-advanced-filters'

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

function onFavoritesOnlyToggle() {
  favoritesOnly.value = !favoritesOnly.value
}

function onMobileFiltersToggle() {
  mobileFiltersOpen.value = !mobileFiltersOpen.value

  if (!mobileFiltersOpen.value) {
    activeDropdown.value = null
  }
}

function rowStyle(continent: string): Record<string, string> {
  // keep overview row accents driven by the shared continent tone map
  return getToneStyle(continent)
}

function detailPath(code: string): string {
  return `/overview/${code.toLowerCase()}`
}

function onCountryIntent(code: string) {
  // hover, focus, and touch already preload the next detail file
  // if navigation happens next the detail page can await the already running request
  preloadCountryDetails(code)
}

function isFavoriteCountry(code: string): boolean {
  return countriesStore.isFavorite(code)
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
      <PageHeader title="Countries" :meta="headerMeta" />

      <FilterPanel
        ariaLabel="overview controls"
        desktop-columns="minmax(14rem, 1.2fr) repeat(3, minmax(10rem, 1fr))"
      >
        <div class="search-wrap">
          <FieldLabel text="Search" id="overview-search-label" />
          <Searchbar
            class="search"
            v-model:text="searchTerm"
            input-id="overview-search-input"
            aria-labelledby="overview-search-label"
            aria-label="search countries by country name, code, or continent"
          />
        </div>
        <div
          :id="advancedFiltersId"
          class="filter-advanced"
          :class="{ 'filter-advanced--open': mobileFiltersOpen }"
        >
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
        </div>
        <template #footer>
          <div class="footer-bar">
            <p class="count">
              Showing <span>{{ orderedCountries.length }}</span> out of
              <span>{{ allCountriesLength }}</span> rows
              <span class="count-separator">-</span>
              <span>{{ favoriteCount }}</span> {{ favoritesCountLabel }}
            </p>
            <div class="footer-actions">
              <button
                v-if="showFavoritesToggle"
                type="button"
                class="favorites-inline-toggle"
                :class="{ 'favorites-inline-toggle--active': favoritesOnly }"
                :aria-pressed="favoritesOnly"
                @click="onFavoritesOnlyToggle"
              >
                <StarFilled class="favorites-inline-toggle-icon" aria-hidden="true" />
                <span>{{ favoritesToggleLabel }}</span>
              </button>
              <button
                type="button"
                class="filters-toggle"
                :aria-expanded="mobileFiltersOpen"
                :aria-controls="advancedFiltersId"
                @click="onMobileFiltersToggle"
              >
                <span>{{ mobileFiltersLabel }}</span>
              </button>
            </div>
          </div>
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
              @mouseenter="onCountryIntent(country.code)"
              @focus="onCountryIntent(country.code)"
              @touchstart.passive="onCountryIntent(country.code)"
            >
              <CodeChip :text="country.code" />
              <span class="meta">
                <span class="name">{{ country.country }}</span>
                <span class="continent">{{ country.continent }}</span>
                <span v-if="isFavoriteCountry(country.code)" class="sr-only">Saved favorite</span>
              </span>
              <span class="end">
                <StarFilled
                  v-if="isFavoriteCountry(country.code)"
                  class="favorite-marker"
                  aria-hidden="true"
                />
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
        :title="emptyStateTitle"
        :message="emptyStateMessage"
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
  padding-top: var(--atlas-spacing-layout-lg);
  font-size: 1.1rem;
  font-weight: 400;
  padding-bottom: calc(env(safe-area-inset-bottom) + var(--atlas-spacing-layout-sm));
}

.content-shell {
  width: min(var(--atlas-content-width), 100%);
  margin-inline: auto;
  display: grid;
  gap: var(--atlas-spacing-md);
}

.search,
.search-wrap {
  min-width: 0;
}

.filter-advanced {
  display: contents;
}

.footer-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--atlas-spacing-sm);
  flex-wrap: wrap;
}

.footer-actions {
  display: inline-flex;
  align-items: center;
  gap: var(--atlas-spacing-xs);
  flex-wrap: wrap;
}

.count {
  font-size: var(--atlas-text-sm);
  color: var(--muted);
}

.count span {
  color: var(--text);
}

.count-separator {
  margin-inline: 0.34rem;
  color: var(--muted);
}

.favorites-inline-toggle {
  border: 1px solid color-mix(in oklab, var(--line) 82%, #ffffff 18%);
  border-radius: 999px;
  background: transparent;
  color: var(--muted);
  display: inline-flex;
  align-items: center;
  gap: var(--atlas-spacing-xs);
  padding: var(--atlas-spacing-xs) var(--atlas-spacing-sm);
  font-size: var(--atlas-text-sm);
  cursor: pointer;
  transition:
    border-color 160ms ease,
    background-color 160ms ease,
    color 160ms ease;
}

.filters-toggle {
  border: 1px solid color-mix(in oklab, var(--line) 82%, #ffffff 18%);
  border-radius: 999px;
  background: transparent;
  color: var(--muted);
  display: none;
  align-items: center;
  padding: var(--atlas-spacing-xs) var(--atlas-spacing-sm);
  font-size: var(--atlas-text-sm);
  cursor: pointer;
  transition:
    border-color 160ms ease,
    background-color 160ms ease,
    color 160ms ease;
}

.filters-toggle:hover {
  color: var(--text);
  background: color-mix(in oklab, var(--surface-2) 72%, transparent);
}

.filters-toggle:focus-visible {
  outline: none;
  border-color: color-mix(in oklab, var(--tone, #6f87d9) 64%, var(--line));
  box-shadow: inset 0 0 0 1px color-mix(in oklab, var(--tone, #6f87d9) 52%, var(--line));
}

.favorites-inline-toggle:hover {
  color: var(--text);
  background: color-mix(in oklab, var(--surface-2) 72%, transparent);
}

.favorites-inline-toggle:focus-visible {
  outline: none;
  border-color: color-mix(in oklab, var(--tone, #6f87d9) 64%, var(--line));
  box-shadow: inset 0 0 0 1px color-mix(in oklab, var(--tone, #6f87d9) 52%, var(--line));
}

.favorites-inline-toggle--active {
  color: var(--text);
  border-color: color-mix(in oklab, #daaa3f 20%, var(--line));
  background: color-mix(in oklab, #daaa3f 8%, transparent);
}

.favorites-inline-toggle-icon {
  width: 0.82rem;
  height: 0.82rem;
  color: #daaa3f;
  flex: 0 0 auto;
}

.groups {
  display: grid;
  gap: var(--atlas-spacing-sm);
  margin-top: 0.18rem;
}

.empty-state--overview {
  margin-top: var(--atlas-spacing-2xs);
}

.group-block {
  display: grid;
  gap: var(--atlas-spacing-xs);
}

.group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid color-mix(in oklab, var(--line) 78%, #ffffff 22%);
  border-radius: var(--atlas-radius-row);
  background: linear-gradient(180deg, rgba(12, 10, 18, 0.94), rgba(8, 6, 13, 0.9));
  padding: var(--atlas-spacing-xs) var(--atlas-spacing-sm);
}

.group-title {
  margin: 0;
  font-size: var(--atlas-text-xs);
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
  padding: var(--atlas-spacing-2xs) var(--atlas-spacing-sm);
  line-height: 1.2;
}

.rows {
  display: grid;
  gap: var(--atlas-spacing-xs);
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
  gap: var(--atlas-spacing-2xs);
}

.name {
  display: block;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: var(--atlas-text-base);
  line-height: 1.2;
}

.continent {
  display: block;
  font-size: var(--atlas-text-xxs);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--muted);
}

.end {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  align-self: center;
  gap: 0.4rem;
  flex: 0 0 auto;
}

.favorite-marker {
  width: 0.82rem;
  height: 0.82rem;
  color: #daaa3f;
}

.row img {
  width: 1.24rem;
  border-radius: 0.16rem;
  border: 1px solid var(--line);
  display: block;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (max-width: 760px) {
  /* return the page to normal flow when the mobile header scrolls away */
  .overview-page {
    margin-top: 0;
    padding-top: var(--atlas-spacing-md);
  }

  .footer-bar {
    align-items: flex-start;
    flex-direction: column;
    gap: var(--atlas-spacing-sm);
  }

  .filter-advanced {
    display: none;
  }

  .filter-advanced--open {
    display: grid;
    gap: var(--atlas-spacing-sm);
  }

  /* keep footer items stacked on narrow screens */
  .count {
    width: 100%;
    font-size: var(--atlas-text-sm);
  }

  .footer-actions {
    width: 100%;
  }

  .favorites-inline-toggle {
    align-self: flex-start;
  }

  .filters-toggle {
    display: inline-flex;
    align-self: flex-start;
  }

  .row {
    gap: 0.46rem;
    padding: 0.4rem 0.5rem;
  }

  .name {
    overflow-wrap: anywhere;
  }

  .continent {
    font-size: var(--atlas-text-xxs);
  }
}

@media (min-width: 1500px) {
  .content-shell {
    width: min(var(--atlas-content-width-wide), 100%);
  }
}
</style>
