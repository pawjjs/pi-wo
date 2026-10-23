<template>
  <div class="app-shell">
    <AppTopbar />
    <main class="app-content">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import AppTopbar from "./components/AppTopbar.vue";
</script>

<style>
* { box-sizing: border-box; }
body { margin: 0; min-width: 320px; }
.app-shell { min-height: 100vh; }
.app-content { width: min(1100px, calc(100% - 32px)); margin: 0 auto; padding: 24px 0 40px; }
.page-heading { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 20px; }
.page-heading h1 { margin: 0; }
.page-actions { display: flex; flex-wrap: wrap; gap: 8px; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th, .data-table td { padding: 8px; border: 1px solid #aaa; text-align: left; }
.data-table th { font-weight: 700; }
.status-message { margin: 16px 0; }
</style>
