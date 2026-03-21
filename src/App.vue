<script setup lang="ts">
import Header from './components/header/Header.vue'
</script>

<template>
  <Header></Header>
  <main class="app-main">
    <RouterView></RouterView>
  </main>
</template>

<style scoped>
/* reserve space for the fixed header so page content starts below it */
.app-main {
  min-height: 100vh;
  padding: calc(var(--atlas-header-height) + var(--atlas-header-offset) + 0.45rem) var(--atlas-page-gutter) 0;
}

@media (max-width: 760px) {
  /* let the mobile header take part in normal page flow */
  .app-main {
    padding: 0 var(--atlas-page-gutter-mobile) 0;
  }
}
</style>
