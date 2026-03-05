<script setup lang="ts">
import FilterDropdown from '@/components/shared/FilterDropdown.vue'
import SearchField from '@/components/shared/SearchField.vue'
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

// widen code column only when current dataset contains long region codes
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
    <section class="controls" aria-label="detail controls">
      <div class="control-row">
        <div class="search-wrap">
          <p class="field-label">Search</p>
          <SearchField
            v-model:text="searchTerm"
            placeholder="Search by name or code"
            aria-label="search regional codes by region, name or code"
          />
        </div>

        <FilterDropdown
          label="Sort by"
          :list="sortDropdownItems"
          :open="sortDropdownOpen"
          @select="onSortSelect"
          @toggle="onSortToggle"
        />
      </div>

      <article v-if="props.formatDescription" class="format-card">
        <p class="label">Plate format</p>
        <p>{{ props.formatDescription }}</p>
      </article>

      <p class="count">Showing {{ mappedDetailsLength }} out of {{ allDetailsLength }} rows</p>
    </section>

    <section
      v-if="mappedDetailsLength > 0"
      class="rows"
      :class="{ 'rows--long-codes': hasLongCodes }"
      aria-label="regional code rows"
    >
      <!-- keep rows keyboard reachable like overview links -->
      <article
        v-for="detail in mappedDetails"
        :key="detail.code + detail.name"
        class="row"
        tabindex="0"
        :aria-label="`${detail.code}: ${detail.name}`"
      >
        <span class="code" :title="detail.code">{{ detail.code }}</span>
        <span class="name">{{ detail.name }}</span>
      </article>
    </section>

    <section v-else class="empty-state" aria-live="polite">
      <h2>No regions match these filters</h2>
      <p>Try clearing search text or switching sort mode</p>
    </section>
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

.controls {
  display: grid;
  gap: 0.9rem;
  border: 1px solid var(--line);
  border-radius: 0.62rem;
  background: var(--surface);
  padding: 0.88rem;
}

.control-row {
  display: grid;
  gap: 0.72rem;
}

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

.format-card {
  border: 1px solid color-mix(in oklab, var(--line) 80%, #ffffff 20%);
  border-left: 0.32rem solid color-mix(in oklab, var(--tone) 76%, #ffffff);
  border-radius: 0.52rem;
  padding: 0.62rem 0.78rem;
  background: linear-gradient(
    135deg,
    color-mix(in oklab, var(--tone) 11%, var(--surface-2, var(--surface))) 0%,
    var(--surface) 72%
  );
}

.label {
  font-size: 0.74rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--muted);
}

.format-card p:last-child {
  margin-top: 0.2rem;
  line-height: 1.42;
  color: color-mix(in oklab, var(--text) 90%, var(--muted));
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
  --row-line: color-mix(in oklab, var(--line) 80%, #ffffff 20%);
  display: grid;
  grid-template-columns: var(--code-chip-width) minmax(0, 1fr);
  gap: 0.56rem;
  align-items: center;
  border: 1px solid var(--row-line);
  border-left: 0.32rem solid color-mix(in oklab, var(--tone) 76%, #ffffff);
  border-radius: 0.44rem;
  background: color-mix(in oklab, var(--surface) 88%, #09070d 12%);
  padding: 0.46rem 0.54rem;
  transition:
    border-color 160ms ease,
    background 160ms ease;
}

.row:hover {
  border-color: color-mix(in oklab, var(--tone) 60%, var(--line));
  background: color-mix(in oklab, var(--surface) 80%, #ffffff 20%);
}

.row:focus-visible {
  outline: none;
  border-color: color-mix(in oklab, var(--tone) 64%, var(--line));
  /* align keyboard focus treatment with shared controls */
  box-shadow: inset 0 0 0 1px color-mix(in oklab, var(--tone) 52%, var(--line));
}

.code {
  border: 1px solid color-mix(in oklab, var(--tone) 44%, var(--line));
  border-radius: 0.22rem;
  min-inline-size: var(--code-chip-width);
  inline-size: var(--code-chip-width);
  padding: 0.06rem 0.24rem;
  text-align: center;
  font-size: 0.75rem;
  letter-spacing: 0.06em;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.name {
  font-size: 1.02rem;
  line-height: 1.26;
  overflow-wrap: anywhere;
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

.rows--long-codes {
  --code-chip-width: 7rem;
}

.rows--long-codes .code {
  white-space: normal;
  overflow: visible;
  text-overflow: clip;
  overflow-wrap: anywhere;
  line-height: 1.08;
  font-size: 0.68rem;
  text-align: left;
}

@media (min-width: 980px) {
  .control-row {
    grid-template-columns: minmax(20rem, 1.8fr) minmax(12rem, 1fr);
    align-items: end;
  }

  .rows--long-codes {
    --code-chip-width: 8rem;
  }
}

@media (max-width: 760px) {
  .controls {
    padding: 0.8rem;
    gap: 0.82rem;
  }
}
</style>
