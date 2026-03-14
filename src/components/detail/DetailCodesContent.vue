<script setup lang="ts">
import CodeChip from '@/components/shared/CodeChip.vue'
import Dropdown from '@/components/shared/Dropdown.vue'
import EmptyState from '@/components/shared/EmptyState.vue'
import FieldLabel from '@/components/shared/FieldLabel.vue'
import FilterPanel from '@/components/shared/FilterPanel.vue'
import InfoCard from '@/components/detail/InfoCard.vue'
import Searchbar from '@/components/shared/Searchbar.vue'
import type { IDropdownItem } from '@/models/dropdown.model'
import { type DetailSortMode, useDetailsStore } from '@/stores/details'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'

const props = defineProps<{
  formatDescription: string
}>()

const detailsStore = useDetailsStore()
const { mappedDetailsLength, allDetailsLength, mappedDetails, searchTerm, sortMode } =
  storeToRefs(detailsStore)

const sortDropdownOpen = ref(false)

const sortDropdownItems = computed<IDropdownItem[]>(() => [
  { id: 1, label: 'Name', value: 'name', selected: sortMode.value === 'name' },
  { id: 2, label: 'Code', value: 'code', selected: sortMode.value === 'code' },
])

const hasLongCodes = computed(() => {
  return mappedDetails.value.some((detail) => detail.code.length > 6 || detail.code.includes(' '))
})

function onSortSelect(item: IDropdownItem) {
  sortMode.value = item.value as DetailSortMode
  sortDropdownOpen.value = false
}

function onSortToggle(nextOpen: boolean) {
  sortDropdownOpen.value = nextOpen
}
</script>

<template>
  <section class="detail-codes">
    <FilterPanel
      ariaLabel="detail controls"
      desktop-columns="minmax(20rem, 1.8fr) minmax(12rem, 1fr)"
    >
      <div class="search-wrap">
        <FieldLabel text="Search" />
        <Searchbar
          v-model:text="searchTerm"
          placeholder="Search by name or code"
          aria-label="search regional codes by region, name or code"
        />
      </div>

      <Dropdown
        label="Sort by"
        :list="sortDropdownItems"
        :open="sortDropdownOpen"
        @select="onSortSelect"
        @toggle="onSortToggle"
      />

      <InfoCard v-if="props.formatDescription" title="Plate format" full-width>
        <p>{{ props.formatDescription }}</p>
      </InfoCard>

      <template #footer>
        <p class="count">Showing {{ mappedDetailsLength }} out of {{ allDetailsLength }} rows</p>
      </template>
    </FilterPanel>

    <section
      v-if="mappedDetailsLength > 0"
      class="rows"
      :class="{ 'rows--long-codes': hasLongCodes }"
      aria-label="regional code rows"
    >
      <article v-for="detail in mappedDetails" :key="detail.code + detail.name" class="row">
        <CodeChip :text="detail.code" :title="detail.code" accented :multiline="hasLongCodes" />
        <span class="name">{{ detail.name }}</span>
      </article>
    </section>

    <EmptyState
      v-else
      title="No regions match these filters"
      message="Try clearing search text or switching sort mode"
    />
  </section>
</template>

<style scoped>
.detail-codes {
  --surface: var(--atlas-surface);
  --text: var(--atlas-text);
  --muted: var(--atlas-muted);
  --line: var(--atlas-line);
  --code-chip-width: 3.5rem;
  width: 100%;
  display: grid;
  gap: 0.82rem;
}

.search-wrap {
  min-width: 0;
}

.count {
  font-size: 0.76rem;
  color: var(--muted);
  line-height: 1.2;
  letter-spacing: 0.01em;
}

.rows {
  display: grid;
  gap: 0.34rem;
}

.row {
  --atlas-row-accent-width: 0.32rem;
  --atlas-row-line: color-mix(in oklab, var(--line) 80%, #ffffff 20%);
  --atlas-row-bg: color-mix(in oklab, var(--surface) 88%, #09070d 12%);
  display: grid;
  gap: 0.56rem;
  align-items: center;
  grid-template-columns: var(--code-chip-width) minmax(0, 1fr);
  border: 1px solid var(--atlas-row-line);
  border-left: var(--atlas-row-accent-width) solid color-mix(in oklab, var(--tone) 76%, #ffffff);
  border-radius: var(--atlas-radius-row);
  background: var(--atlas-row-bg);
  padding: 0.46rem 0.54rem;
}

.name {
  font-size: 1.02rem;
  line-height: 1.26;
  overflow-wrap: anywhere;
}

.rows--long-codes {
  --code-chip-width: 7rem;
}

@media (min-width: 980px) {
  .rows--long-codes {
    --code-chip-width: 8rem;
  }
}
</style>