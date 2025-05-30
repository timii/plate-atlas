<script setup lang="ts">
import ChevronDown from '@/assets/icons/ChevronDown.vue'
import ChevronUp from '@/assets/icons/ChevronUp.vue'
import type { IDropdownItem } from '@/models/dropdown.model'
import { computed, ref, type PropType } from 'vue'

const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  list: {
    type: Array as PropType<IDropdownItem[]>,
    required: true,
  },
})

const menuOpen = ref(false)

const emits = defineEmits(['select'])

// return first element that has `selected` as true, else return first element in list
const selectedItem = computed(() => {
  const selected = props.list.find((e) => e.selected)
  return selected ?? props.list[0]
})

function onItemClick(item: IDropdownItem) {
  // close menu after item has been selected
  menuOpen.value = false

  // emit value of selected item
  emits('select', item)
}

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}
</script>

<template>
  <div class="relative inline-block text-left">
    <div>
      <div class="mb-1 text-sm font-medium">{{ props.label }}</div>
      <button
        type="button"
        class="flex h-action-element-height w-42 cursor-pointer justify-between gap-x-1.5 rounded-lg border border-border-light3 p-2.5 text-sm font-semibold text-text-light-default focus:outline-none dark:border-border-dark3 dark:bg-background-dark-highlight dark:text-text-dark-default"
        aria-haspopup="true"
        @click="toggleMenu"
      >
        {{ selectedItem.label }}

        <ChevronUp v-if="menuOpen"></ChevronUp>
        <ChevronDown v-else></ChevronDown>
      </button>
    </div>

    <div
      class="list absolute right-0 z-10 mt-2 flex w-42 origin-top-right flex-col rounded-lg border border-border-light3 bg-background-light-default py-2 text-sm focus:outline-none dark:border-border-dark3 dark:bg-background-dark-highlight dark:text-text-dark-default"
      role="menu"
      aria-orientation="vertical"
      aria-labelledby="menu-button"
      tabindex="-1"
      :style="{
        opacity: menuOpen ? 1 : 0,
        transform: menuOpen ? 'scale(1)' : 'scale(0.95)',
        pointerEvents: menuOpen ? 'unset' : 'none',
      }"
    >
      <span
        v-for="item of list"
        :key="item.id"
        class="item cursor-pointer px-4 py-2 transition-all duration-200 ease-cubic hover:bg-background-light-hover hover:dark:bg-background-dark-hover"
        role="menuitem"
        tabindex="-1"
        @click="onItemClick(item)"
        >{{ item.label }}</span
      >
    </div>
  </div>
</template>

<style scoped></style>
