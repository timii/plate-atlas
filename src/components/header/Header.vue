<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <header
    class="fixed flex w-full items-center justify-between px-4 sm:px-6 h-14 dark:bg-background-dark-default border-b border-border-light dark:border-border-dark"
  >
    <div class="header-left flex gap-6">
      <div>Logo (TBD)</div>
      <nav>
        <RouterLink class="pr-6" to="/">Overview</RouterLink>
        <RouterLink class="" to="/map">Map</RouterLink>
      </nav>
      <div>Search</div>
    </div>
    <div class="header-right flex gap-6">
      <div>About</div>
      <div>Toggle</div>
    </div>
  </header>
</template>

<style scoped></style>
