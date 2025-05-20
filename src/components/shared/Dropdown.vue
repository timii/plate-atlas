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
        class="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50 focus:outline-none cursor-pointer"
        id="menu-button"
        aria-expanded="true"
        aria-haspopup="true"
        @click="toggleMenu"
      >
        Options
        <svg
          class="-mr-1 size-5 text-gray-400"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
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
      class="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none transition-all duration-200 ease-cubic"
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
      <div class="py-1" role="none">
        <!-- Active: "bg-gray-100 text-gray-900 outline-hidden", Not Active: "text-gray-700" -->
        <a
          href="#"
          class="block px-4 py-2 text-sm text-gray-700"
          role="menuitem"
          tabindex="-1"
          id="menu-item-0"
          >Account settings</a
        >
        <a
          href="#"
          class="block px-4 py-2 text-sm text-gray-700"
          role="menuitem"
          tabindex="-1"
          id="menu-item-1"
          >Support</a
        >
        <a
          href="#"
          class="block px-4 py-2 text-sm text-gray-700"
          role="menuitem"
          tabindex="-1"
          id="menu-item-2"
          >License</a
        >
      </div>
    </div>
  </div>
</template>

<style scoped></style>
