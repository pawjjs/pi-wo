<script setup>
defineProps({
  message: {
    type: String
  }
})
</script>

<template>
  <RouterLink to = "/testing">Test</RouterLink>
  <h1>{{ message }}</h1>
</template>