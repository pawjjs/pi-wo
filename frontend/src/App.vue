<script setup>
import { ref, computed } from 'vue'
import Home from './views/HomePage.vue'
import Test from './views/TestPage.vue'

const routes = {
  '/': Home,
  '/testing': Test
}

const currentPath = ref(window.location.hash)

window.addEventListener('hashchange', () => {
  currentPath.value = window.location.hash
})

const currentView = computed(() => {
  return routes[currentPath.value.slice(1) || '/'] || NotFound
})
</script>

<template>
  <a href="#/">Home</a> |
  <a href="#/about">Test</a> |
  <component :is="currentView" />
</template>