<script setup lang="ts">
import { ref } from 'vue'

const menuOpen = ref(false)

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}
</script>

<template>
  <div class="relative inline-block text-left">
    <div>
      <button
        type="button"
        class="flex h-action-element-height cursor-pointer gap-x-1.5 rounded-lg border border-border-light3 p-2.5 text-sm font-semibold text-text-light-default focus:outline-none dark:border-border-dark3 dark:bg-background-dark-highlight dark:text-text-dark-default"
        aria-haspopup="true"
        @click="toggleMenu"
      >
        Sort by
        <svg
          v-if="menuOpen"
          class="-mr-1 size-5 rotate-180 text-gray-400"
          viewBox="0 0 20 20"
          fill="currentColor"
          data-slot="icon"
        >
          <path
            fill-rule="evenodd"
            d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
            clip-rule="evenodd"
          />
        </svg>
        <svg
          v-else
          class="-mr-1 size-5 text-gray-400"
          viewBox="0 0 20 20"
          fill="currentColor"
          data-slot="icon"
        >
          <path
            fill-rule="evenodd"
            d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
    </div>

    <!-- TODO: add correct dark/light styling -->
    <!-- TODO: make component more generic -> accept list of elements, event on select and so on -->

    <div
      class="list absolute right-0 z-10 mt-2 flex w-42 origin-top-right flex-col rounded-lg border border-border-light3 bg-background-light-default py-2 text-right text-sm transition-all duration-200 ease-cubic focus:outline-none dark:border-border-dark3 dark:bg-background-dark-highlight dark:text-text-dark-default"
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
      <!-- Active: "bg-gray-100 text-gray-900 outline-hidden", Not Active: "text-gray-700" -->
      <span
        class="item cursor-pointer px-4 py-2 hover:bg-background-light-hover hover:dark:bg-background-dark-hover"
        role="menuitem"
        tabindex="-1"
        >Account settings</span
      >
      <span
        class="item cursor-pointer px-4 py-2 hover:bg-background-light-hover hover:dark:bg-background-dark-hover"
        role="menuitem"
        tabindex="-1"
        >Support</span
      >
      <span
        class="item cursor-pointer px-4 py-2 hover:bg-background-light-hover hover:dark:bg-background-dark-hover"
        role="menuitem"
        tabindex="-1"
        >License</span
      >
    </div>
  </div>
</template>

<style scoped></style>
