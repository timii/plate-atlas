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
import Searchbar from '@/components/shared/SearchBar.vue'
import PageHeader from '@/components/shared/PageHeader.vue'
import EmptyState from '@/components/shared/EmptyState.vue'
import { type CountryGroupBy, type CountrySortMode, useCountriesStore } from '@/stores/countries'
import { getToneStyle } from '@/constants/continentTone'
import { preloadCountryDetails } from '@/utils/countryDetailsLoader'
import { pickMirroredAssetUrl } from '@/utils/assetUrl'

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
  return lastUpdatedLabel.value ? `Updated ${lastUpdatedLabel.value}` : ''
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
    return 'Open a country detail page and use the star button to add it to favorites'
  }

  if (favoritesOnly.value) {
    return 'Try clearing search text, changing continent, or switch back to all countries'
  }

  return 'Try clearing search text, changing continent, or setting group by to none'
})

const favoritesToggleLabel = computed(() => {
  return favoritesOnly.value ? 'Show all countries' : 'Show only favorites'
})
const favoritesToggleDisabled = computed(() => favoriteCount.value === 0 && !favoritesOnly.value)

const favoritesCountLabel = computed(() => {
  return favoriteCount.value === 1 ? 'favorite' : 'favorites'
})

// keep advanced filters collapsed on mobile by default
const mobileFiltersOpen = ref(false)
const mobileFiltersLabel = computed(() => {
  return mobileFiltersOpen.value ? 'Hide filters' : 'Filters'
})

const advancedFiltersId = 'overview-advanced-filters'

const failedFlagThumbCodes = ref<Record<string, true>>({})

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

function flagThumbSrc(country: ICountry): string {
  return pickMirroredAssetUrl(country.flagThumbLocal)
}

function hasFlagThumb(country: ICountry): boolean {
  return Boolean(country.flagThumbLocal) && !failedFlagThumbCodes.value[country.code]
}

// handle the nepal flag separately to show it a bit larger than the other flags
function isNepalFlag(code: string): boolean {
  return code.toLowerCase() === 'nep'
}

function onFlagError(code: string) {
  if (failedFlagThumbCodes.value[code]) {
    return
  }

  failedFlagThumbCodes.value = {
    ...failedFlagThumbCodes.value,
    [code]: true,
  }
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
        desktop-columns="minmax(18rem, 1.55fr) repeat(3, minmax(10rem, 0.92fr))"
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
              <span>{{ allCountriesLength }}</span> countries
              <span class="count-separator">-</span>
              <span>{{ favoriteCount }}</span> {{ favoritesCountLabel }}
            </p>
            <div class="footer-actions">
              <button
                type="button"
                class="favorites-inline-toggle"
                :class="{
                  'favorites-inline-toggle--active': favoritesOnly,
                  'favorites-inline-toggle--disabled': favoritesToggleDisabled,
                }"
                :aria-pressed="favoritesOnly"
                :disabled="favoritesToggleDisabled"
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
                <span v-if="isFavoriteCountry(country.code)" class="sr-only">Favorite country</span>
              </span>
              <span class="end">
                <StarFilled
                  v-if="isFavoriteCountry(country.code)"
                  class="favorite-marker"
                  aria-hidden="true"
                />
                <img
                  v-if="hasFlagThumb(country)"
                  class="flag-thumb"
                  :class="{ 'flag-thumb--nepal': isNepalFlag(country.code) }"
                  :src="flagThumbSrc(country)"
                  :alt="`${country.country} flag`"
                  loading="lazy"
                  @error="onFlagError(country.code)"
                />
                <span v-else class="flag-fallback" aria-hidden="true"></span>
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
  padding-top: var(--atlas-spacing-md);
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
  gap: calc(var(--atlas-spacing-xs) + 0.08rem);
  flex-wrap: wrap;
}

.footer-actions {
  display: inline-flex;
  align-items: center;
  gap: calc(var(--atlas-spacing-xs) - 0.04rem);
  flex-wrap: wrap;
}

.count {
  align-self: center;
  flex: 1 1 auto;
  font-size: 0.79rem;
  line-height: 1.28;
  min-width: 0;
  color: color-mix(in oklab, var(--text) 38%, var(--muted));
}

.count span {
  color: var(--text);
}

.count-separator {
  margin-inline: 0.34rem;
  color: var(--muted);
}

.favorites-inline-toggle {
  min-height: var(--atlas-action-height-compact);
  border: 1px solid var(--atlas-action-border-subtle);
  border-radius: var(--atlas-radius-control);
  background: var(--atlas-action-surface-subtle);
  color: var(--muted);
  display: inline-flex;
  align-items: center;
  gap: var(--atlas-spacing-xs);
  padding: var(--atlas-action-padding-compact);
  font-size: 0.77rem;
  cursor: pointer;
  transition:
    border-color 160ms ease,
    background-color 160ms ease,
    color 160ms ease,
    opacity 160ms ease;
}

.favorites-inline-toggle--disabled {
  opacity: 0.56;
  cursor: default;
}

.filters-toggle {
  min-height: var(--atlas-action-height-compact);
  border: 1px solid var(--atlas-action-border-subtle);
  border-radius: var(--atlas-radius-control);
  background: var(--atlas-action-surface-subtle);
  color: var(--muted);
  display: none;
  align-items: center;
  padding: var(--atlas-action-padding-compact);
  font-size: 0.77rem;
  cursor: pointer;
  transition:
    border-color 160ms ease,
    background-color 160ms ease,
    color 160ms ease;
}

/* keep hover fills aligned to the visible pill size on pointer devices */
@media (hover: hover) and (pointer: fine) {
  .filters-toggle:hover {
    color: var(--text);
    background: color-mix(in oklab, var(--surface) 74%, transparent);
  }

  .favorites-inline-toggle:not(:disabled):hover {
    color: var(--text);
    background: color-mix(in oklab, var(--surface) 74%, transparent);
  }
}

.filters-toggle:focus-visible {
  outline: none;
  border-color: color-mix(in oklab, var(--tone, #6f87d9) 64%, var(--line));
  box-shadow: 0 0 0 1px color-mix(in oklab, var(--tone, #6f87d9) 32%, transparent);
}

/* expand the tap target on touch without changing the desktop pill proportions */
@media (hover: none), (pointer: coarse) {
  .favorites-inline-toggle,
  .filters-toggle {
    min-height: var(--atlas-touch-target);
  }
}
.favorites-inline-toggle:focus-visible {
  outline: none;
  border-color: color-mix(in oklab, var(--tone, #6f87d9) 64%, var(--line));
  box-shadow: 0 0 0 1px color-mix(in oklab, var(--tone, #6f87d9) 32%, transparent);
}

.favorites-inline-toggle--active {
  color: var(--text);
  border-color: var(--atlas-favorite-border);
  background: color-mix(in oklab, var(--atlas-favorite) 10%, transparent);
}

.favorites-inline-toggle-icon {
  width: 0.72rem;
  height: 0.72rem;
  color: var(--atlas-favorite);
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
  border: 1px solid color-mix(in oklab, var(--line) 84%, #0c0910 16%);
  border-radius: var(--atlas-radius-row);
  background: var(--atlas-elevated-bg);
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
  font-size: 0.76rem;
  color: var(--muted);
  line-height: 1.2;
  font-variant-numeric: tabular-nums;
}

.rows {
  display: grid;
  gap: var(--atlas-spacing-xs);
}

.row {
  --atlas-row-accent-width: 0.34rem;
  --atlas-row-line: color-mix(in oklab, var(--line) 90%, #0f0b13 10%);
  --atlas-row-bg: color-mix(in oklab, var(--surface) 84%, #1b1522 16%);
  --atlas-row-hover-line: color-mix(in oklab, var(--tone) 64%, var(--line));
  --atlas-row-hover-bg: color-mix(in oklab, var(--surface) 78%, #21182a 22%);
  --row-end-min-width: 3.9rem;
  --row-end-gap: 0.46rem;
  --row-favorite-size: 0.94rem;
  --row-flag-width: 1.68rem;
  --row-flag-height: 1.12rem;
  --row-flag-outline: color-mix(in oklab, var(--line) 92%, #08070d 8%);
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
  gap: var(--row-end-gap);
  flex: 0 0 auto;
  min-width: var(--row-end-min-width);
  margin-left: var(--atlas-spacing-xs);
}

.favorite-marker {
  width: var(--row-favorite-size);
  height: var(--row-favorite-size);
  color: var(--atlas-favorite);
}

.row img {
  width: var(--row-flag-width);
  height: var(--row-flag-height);
  max-width: none;
  border-radius: 0.16rem;
  display: block;
  object-fit: contain;
  filter: drop-shadow(0.45px 0 0 var(--row-flag-outline))
    drop-shadow(-0.45px 0 0 var(--row-flag-outline)) drop-shadow(0 0.45px 0 var(--row-flag-outline))
    drop-shadow(0 -0.45px 0 var(--row-flag-outline));
}

.row img.flag-thumb--nepal {
  width: 1.92rem;
  height: 1.36rem;
}

.flag-fallback {
  width: var(--row-flag-width);
  height: var(--row-flag-height);
  border: 1px dashed color-mix(in oklab, var(--line) 76%, #ffffff 24%);
  border-radius: 0.16rem;
  background: color-mix(in oklab, var(--surface-2) 92%, #0d0a11 8%);
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
  .footer-bar {
    align-items: center;
    flex-direction: row;
    gap: calc(var(--atlas-spacing-xs) + 0.08rem);
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
    flex: 0 1 auto;
    min-width: 0;
    max-width: 100%;
  }

  .footer-actions {
    width: auto;
    justify-content: flex-end;
    margin-left: auto;
  }

  /* surface the compact filter trigger once the advanced controls collapse */
  .filters-toggle {
    display: inline-flex;
  }
}

@media (min-width: 1500px) {
  .content-shell {
    width: min(var(--atlas-content-width-wide), 100%);
  }
}
</style>
