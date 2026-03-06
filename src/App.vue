<script setup lang="ts">
import Header from './components/header/Header.vue'
</script>

<template>
  <Header></Header>
  <main class="h-full px-6 pt-14">
    <RouterView></RouterView>
  </main>
</template>

<style scoped></style>
