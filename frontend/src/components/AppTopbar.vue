<template>
  <header class="topbar">
    <nav class="nav" aria-label="Nawigacja główna">
      <RouterLink to="/">Start</RouterLink>
      <RouterLink to="/lobby">Lobby</RouterLink>
    </nav>
  </header>
</template>

<style scoped>
.topbar { width: 100%; border-bottom: 1px solid #aaa; }
.nav { width: min(1100px, calc(100% - 32px)); min-height: 48px; margin: 0 auto; display: flex; align-items: center; gap: 20px; }
</style>
