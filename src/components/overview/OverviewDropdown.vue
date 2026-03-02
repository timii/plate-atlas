<script setup lang="ts">
import ChevronDown from '@/assets/icons/ChevronDown.vue'
import ChevronUp from '@/assets/icons/ChevronUp.vue'
import type { IDropdownItem } from '@/models/dropdown.model'
import { computed, type PropType } from 'vue'

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

const selectedItem = computed(() => {
  const selected = props.list.find((e) => e.selected)
  return selected ?? props.list[0]
})

function onItemClick(item: IDropdownItem) {
  emits('select', item)
  emits('toggle', false)
}

function toggleMenu() {
  emits('toggle', !props.open)
}
</script>

<template>
  <div class="overview-dropdown">
    <div class="label">{{ props.label }}</div>
    <button
      type="button"
      class="trigger"
      aria-haspopup="true"
      :aria-expanded="props.open"
      @click="toggleMenu"
    >
      <span>{{ selectedItem.label }}</span>
      <ChevronUp v-if="props.open" />
      <ChevronDown v-else />
    </button>

    <div class="list" :class="{ open: props.open }" role="menu" aria-orientation="vertical">
      <button v-for="item of props.list" :key="item.id" type="button" class="item" @click="onItemClick(item)">
        {{ item.label }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.overview-dropdown {
  position: relative;
  min-width: 0;
}

.label {
  margin-bottom: 0.32rem;
  font-size: 0.74rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--muted);
}

.trigger {
  width: 100%;
  min-height: 2.75rem;
  border: 1px solid var(--line);
  border-radius: 0.44rem;
  background: color-mix(in oklab, var(--surface-2) 92%, #0a0b10 8%);
  color: var(--text);
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.44rem;
  padding: 0.28rem 0.56rem;
  font-size: 0.84rem;
}

.trigger:focus-visible {
  outline: none;
  border-color: color-mix(in oklab, var(--tone, #6f87d9) 64%, var(--line));
  box-shadow: 0 0 0 3px color-mix(in oklab, var(--tone, #6f87d9) 18%, transparent);
}

.list {
  position: absolute;
  top: calc(100% + 0.4rem);
  right: 0;
  z-index: 40;
  width: 100%;
  min-width: 12rem;
  border: 1px solid color-mix(in oklab, var(--line) 84%, #ffffff 16%);
  border-radius: 0.44rem;
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
  border-radius: 0.32rem;
  background: transparent;
  color: var(--muted);
  text-align: left;
  padding: 0.38rem 0.44rem;
  font-size: 0.82rem;
}

.item:hover {
  background: rgba(255, 255, 255, 0.08);
  color: var(--text);
}

@media (max-width: 760px) {
  .list {
    min-width: 0;
  }
}
</style>
