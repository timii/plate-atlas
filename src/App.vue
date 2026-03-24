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
.app-main {
  min-height: 100vh;
  padding: 0 var(--atlas-page-gutter) 0;
}

@media (max-width: 760px) {
  /* keep the same static header flow on smaller screens */
  .app-main {
    padding: 0 var(--atlas-page-gutter-mobile) 0;
  }
}
</style>
