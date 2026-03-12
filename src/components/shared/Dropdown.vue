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
const triggerEl = ref<HTMLButtonElement | null>(null)
const optionEls = ref<HTMLButtonElement[]>([])
const baseId = `filter-dropdown-${++dropdownIdCounter}`
const labelId = `${baseId}-label`
const valueId = `${baseId}-value`
const listboxId = `${baseId}-list`

const selectedIndex = computed(() => {
  const index = props.list.findIndex((item) => item.selected)
  return index >= 0 ? index : 0
})

// keep focus on the selected option while the list is open
const activeIndex = ref(selectedIndex.value)

const selectedItem = computed(() => {
  const selected = props.list.find((e) => e.selected)
  return selected ?? props.list[0]
})

function setOptionRef(element: HTMLButtonElement | null, index: number) {
  if (!element) {
    return
  }

  optionEls.value[index] = element
}

function onItemClick(item: IDropdownItem) {
  emits('select', item)
  emits('toggle', false)
  activeIndex.value = props.list.findIndex((entry) => entry.id === item.id)

  // return focus to the trigger after choosing an option
  nextTick(() => {
    triggerEl.value?.focus()
  })
}

function toggleMenuFromTrigger() {
  emits('toggle', !props.open)
}

function focusOption(index: number) {
  const clampedIndex = Math.max(0, Math.min(index, props.list.length - 1))
  activeIndex.value = clampedIndex

  nextTick(() => {
    optionEls.value[clampedIndex]?.focus()
  })
}

function openFromTrigger(index: number) {
  if (!props.open) {
    emits('toggle', true)
  }

  focusOption(index)
}

function selectActiveItem() {
  const item = props.list[activeIndex.value]
  if (!item) {
    return
  }

  onItemClick(item)
}

function onTriggerKeydown(event: KeyboardEvent) {
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

  if (event.key === 'Escape' && props.open) {
    event.preventDefault()
    emits('toggle', false)
  }
}

function onListKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    focusOption(activeIndex.value + 1)
    return
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault()
    focusOption(activeIndex.value - 1)
    return
  }

  if (event.key === 'Home') {
    event.preventDefault()
    focusOption(0)
    return
  }

  if (event.key === 'End') {
    event.preventDefault()
    focusOption(props.list.length - 1)
    return
  }

  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    selectActiveItem()
    return
  }

  if (event.key === 'Tab') {
    // let tab leave the widget instead of walking every option
    emits('toggle', false)
    return
  }

  if (event.key === 'Escape' && props.open) {
    event.preventDefault()
    emits('toggle', false)
    triggerEl.value?.focus()
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
    emits('toggle', false)
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

  emits('toggle', false)
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
      optionEls.value = []
      return
    }

    activeIndex.value = selectedIndex.value

    // open on the selected option so arrow navigation starts in context
    nextTick(() => {
      optionEls.value[selectedIndex.value]?.focus()
    })
  },
)

watch(
  () => props.list,
  () => {
    activeIndex.value = selectedIndex.value
  },
  { deep: true },
)
</script>

<template>
  <div ref="rootEl" class="filter-dropdown" @focusout="onFocusOut">
    <FieldLabel :id="labelId" :text="props.label" />
    <button
      ref="triggerEl"
      type="button"
      class="trigger"
      aria-haspopup="listbox"
      :aria-expanded="props.open"
      :aria-controls="listboxId"
      :aria-labelledby="`${labelId} ${valueId}`"
      @click="toggleMenuFromTrigger"
      @keydown="onTriggerKeydown"
    >
      <span :id="valueId">{{ selectedItem.label }}</span>
      <ChevronUp v-if="props.open" />
      <ChevronDown v-else />
    </button>

    <div
      :id="listboxId"
      class="list"
      :class="{ open: props.open }"
      role="listbox"
      :aria-labelledby="labelId"
      :aria-hidden="!props.open"
      @keydown="onListKeydown"
    >
      <button
        v-for="(item, index) of props.list"
        :id="`${listboxId}-option-${index}`"
        :key="item.id"
        :ref="(element) => setOptionRef(element as HTMLButtonElement | null, index)"
        type="button"
        class="item"
        role="option"
        :aria-selected="item.selected"
        :tabindex="props.open && activeIndex === index ? 0 : -1"
        @focus="activeIndex = index"
        @click="onItemClick(item)"
      >
        {{ item.label }}
      </button>
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
  border: 1px solid var(--line);
  border-radius: var(--atlas-radius-control);
  background: color-mix(in oklab, var(--surface-2) 92%, #0a0b10 8%);
  color: var(--text);
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.44rem;
  padding: 0.28rem 0.56rem;
  font-size: 0.84rem;
  cursor: pointer;
}

.trigger:focus-visible {
  outline: none;
  border-color: color-mix(in oklab, var(--tone, #6f87d9) 64%, var(--line));
  box-shadow: inset 0 0 0 1px color-mix(in oklab, var(--tone, #6f87d9) 52%, var(--line));
}

.list {
  position: absolute;
  top: calc(100% + 0.4rem);
  right: 0;
  z-index: 40;
  width: 100%;
  min-width: 12rem;
  border: 1px solid color-mix(in oklab, var(--line) 84%, #ffffff 16%);
  border-radius: var(--atlas-radius-control);
  background: linear-gradient(180deg, rgba(14, 14, 20, 0.98), rgba(10, 10, 16, 0.96));
  padding: 0.28rem;
  display: grid;
  gap: 0.14rem;
  box-shadow: 0 10px 22px rgba(2, 3, 8, 0.45);
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
  color: var(--muted);
  text-align: left;
  padding: 0.38rem 0.44rem;
  font-size: 0.82rem;
  cursor: pointer;
}

.item:hover {
  background: var(--atlas-control-hover);
  color: var(--text);
}

.item:focus-visible {
  outline: 1px solid color-mix(in oklab, var(--tone, #6f87d9) 52%, var(--line));
  outline-offset: 0;
}

@media (max-width: 760px) {
  .list {
    min-width: 0;
  }
}
</style>

