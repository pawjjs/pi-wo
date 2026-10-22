<script setup>
import { ref, computed } from 'vue'
import Home from './views/stats/HomePage.vue'
import Test from './views/stats/TestPage.vue'

const greetings = ('Hello World!')

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
  <a href="#/testing">Test</a> |
  <component :is="currentView" :message="greetings" />
</template>