<script setup lang="ts">
import ChevronDown from '@/assets/icons/ChevronDown.vue'
import ChevronUp from '@/assets/icons/ChevronUp.vue'
import FieldLabel from '@/components/shared/FieldLabel.vue'
import type { IDropdownItem } from '@/models/dropdown.model'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch, type PropType } from 'vue'

let dropdownIdCounter = 0

const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  list: {
    type: Array as PropType<IDropdownItem[]>,
    required: true,
  },
  open: {
    type: Boolean,
    default: false,
  },
})

const emits = defineEmits(['select', 'toggle'])
const rootEl = ref<HTMLElement | null>(null)
const triggerEl = ref<HTMLElement | null>(null)
const baseId = `filter-dropdown-${++dropdownIdCounter}`
const labelId = `${baseId}-label`
const valueId = `${baseId}-value`
const listboxId = `${baseId}-list`

const hasItems = computed(() => {
  return props.list.length > 0
})

const selectedIndex = computed(() => {
  const index = props.list.findIndex((item) => item.selected)
  return index >= 0 ? index : 0
})

// keep the popup listbox aligned with the current highlighted option
const activeIndex = ref(selectedIndex.value)

// keep virtual focus on the combobox trigger while the popup stays open
const activeOptionId = computed(() => {
  if (!props.open || !props.list[activeIndex.value]) {
    return undefined
  }

  return `${listboxId}-option-${activeIndex.value}`
})

const selectedItem = computed(() => {
  const selected = props.list.find((item) => item.selected)
  return selected ?? props.list[0]
})

function syncActiveIndexToSelection() {
  activeIndex.value = selectedIndex.value
}

function clampIndex(index: number): number {
  if (!props.list.length) {
    return 0
  }

  return Math.max(0, Math.min(index, props.list.length - 1))
}

function closeMenu(restoreFocus: boolean) {
  if (!props.open) {
    return
  }

  emits('toggle', false)

  if (!restoreFocus) {
    return
  }

  nextTick(() => {
    triggerEl.value?.focus()
  })
}

function onItemClick(item: IDropdownItem) {
  emits('select', item)
  activeIndex.value = props.list.findIndex((entry) => entry.id === item.id)
  closeMenu(true)
}

function toggleMenuFromTrigger() {
  if (!hasItems.value) {
    return
  }

  emits('toggle', !props.open)
}

function focusOption(index: number) {
  activeIndex.value = clampIndex(index)
}

function openFromTrigger(index: number) {
  if (!hasItems.value) {
    return
  }

  activeIndex.value = clampIndex(index)

  if (!props.open) {
    emits('toggle', true)
  }
}

function selectActiveItem() {
  const item = props.list[activeIndex.value]
  if (!item) {
    return
  }

  onItemClick(item)
}

function onTriggerKeydown(event: KeyboardEvent) {
  if (!hasItems.value) {
    return
  }

  if (event.key === 'Tab') {
    closeMenu(false)
    return
  }

  if ((event.key === 'Enter' || event.key === ' ') && !props.open) {
    event.preventDefault()
    openFromTrigger(selectedIndex.value)
    return
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    openFromTrigger(props.open ? activeIndex.value + 1 : selectedIndex.value)
    return
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault()
    openFromTrigger(props.open ? activeIndex.value - 1 : selectedIndex.value)
    return
  }

  if (event.key === 'Home') {
    event.preventDefault()
    openFromTrigger(0)
    return
  }

  if (event.key === 'End') {
    event.preventDefault()
    openFromTrigger(props.list.length - 1)
    return
  }

  if ((event.key === 'Enter' || event.key === ' ') && props.open) {
    event.preventDefault()
    selectActiveItem()
    return
  }

  if (event.key === 'Escape' && props.open) {
    event.preventDefault()
    closeMenu(true)
  }
}

function onDocumentPointerDown(event: PointerEvent) {
  if (!props.open || !rootEl.value) {
    return
  }

  const target = event.target
  if (!(target instanceof Node)) {
    return
  }

  if (!rootEl.value.contains(target)) {
    closeMenu(false)
  }
}

function onFocusOut(event: FocusEvent) {
  if (!props.open || !rootEl.value) {
    return
  }

  const nextFocusedEl = event.relatedTarget
  if (nextFocusedEl instanceof Node && rootEl.value.contains(nextFocusedEl)) {
    return
  }

  closeMenu(false)
}

onMounted(() => {
  document.addEventListener('pointerdown', onDocumentPointerDown)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocumentPointerDown)
})

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) {
      return
    }

    syncActiveIndexToSelection()
  },
)

watch(
  () => props.list,
  () => {
    syncActiveIndexToSelection()
  },
  { deep: true },
)
</script>

<template>
  <div ref="rootEl" class="filter-dropdown" @focusout="onFocusOut">
    <FieldLabel :id="labelId" :text="props.label" />
    <div
      ref="triggerEl"
      class="trigger"
      :class="{ 'trigger--disabled': !hasItems }"
      role="combobox"
      :tabindex="hasItems ? 0 : -1"
      :aria-disabled="!hasItems"
      :aria-expanded="props.open"
      :aria-controls="listboxId"
      :aria-labelledby="`${labelId} ${valueId}`"
      :aria-activedescendant="props.open ? activeOptionId : undefined"
      @click="toggleMenuFromTrigger"
      @keydown="onTriggerKeydown"
    >
      <span :id="valueId">{{ selectedItem?.label ?? 'No options available' }}</span>
      <ChevronUp v-if="props.open" />
      <ChevronDown v-else />
    </div>

    <div
      :id="listboxId"
      class="list"
      :class="{ open: props.open }"
      role="listbox"
      :aria-labelledby="labelId"
      :aria-hidden="!props.open"
    >
      <!-- keep focus on the combobox trigger while pointer selection happens -->
      <div
        v-for="(item, index) of props.list"
        :id="`${listboxId}-option-${index}`"
        :key="item.id"
        class="item"
        :class="{
          'item--active': activeIndex === index,
          'item--selected': item.selected,
        }"
        role="option"
        :aria-selected="item.selected"
        @mouseenter="focusOption(index)"
        @mousedown.prevent
        @click="onItemClick(item)"
      >
        {{ item.label }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.filter-dropdown {
  position: relative;
  min-width: 0;
}

.trigger {
  width: 100%;
  min-height: 2.75rem;
  border: 1px solid color-mix(in oklab, var(--line) 90%, #100c14 10%);
  border-radius: var(--atlas-radius-control);
  /* keep the trigger one step darker than the filter panel so the control stays legible */
  background: color-mix(in oklab, var(--surface) 82%, #21192a 18%);
  color: var(--text);
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--atlas-spacing-sm);
  padding: var(--atlas-spacing-xs) var(--atlas-spacing-sm);
  font-size: var(--atlas-text-md);
  cursor: pointer;
}

.trigger--disabled {
  color: var(--muted);
  cursor: default;
}

.trigger:focus-visible {
  outline: none;
  border-color: color-mix(in oklab, var(--tone, #6f87d9) 64%, var(--line));
  box-shadow: inset 0 0 0 1px color-mix(in oklab, var(--tone, #6f87d9) 52%, var(--line));
}

.list {
  position: absolute;
  top: calc(100% + 0.46rem);
  left: 0;
  right: 0;
  z-index: 40;
  width: 100%;
  min-width: 12rem;
  border: 1px solid color-mix(in oklab, var(--line) 94%, #06050a 6%);
  border-radius: var(--atlas-radius-control);
  /* lift the popup one tonal step above the filter panel so the open state is easier to read */
  background: color-mix(in oklab, var(--atlas-panel-bg) 84%, #16101d 16%);
  padding: 0.38rem;
  display: grid;
  gap: var(--atlas-spacing-2xs);
  box-shadow:
    0 18px 34px rgba(2, 3, 8, 0.44),
    0 0 0 1px rgba(255, 255, 255, 0.015);
  opacity: 0;
  transform: scale(0.98);
  pointer-events: none;
  transition:
    opacity 140ms ease,
    transform 140ms ease;
}

.list.open {
  opacity: 1;
  transform: scale(1);
  pointer-events: auto;
}

.item {
  border: none;
  border-radius: var(--atlas-radius-option);
  background: transparent;
  color: color-mix(in oklab, var(--text) 82%, var(--muted));
  text-align: left;
  padding: 0.46rem 0.56rem;
  font-size: 0.82rem;
  cursor: pointer;
  transition:
    background-color 140ms ease,
    color 140ms ease;
}

/* keep the chosen value readable without making it look actively highlighted */
.item--selected {
  color: var(--text);
}

/* reserve the filled state for the option currently being hovered or arrowed to */
.item--active {
  background: color-mix(in oklab, var(--atlas-control-hover) 88%, var(--surface) 12%);
  color: var(--text);
}

@media (max-width: 760px) {
  .list {
    right: 0;
    width: 100%;
    min-width: 0;
  }
}
</style>
