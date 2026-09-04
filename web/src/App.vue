<template>
  <div class="app-shell">
    <TopBar />
    <main class="app-main">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router';
import TopBar from './components/TopBar.vue';
</script>

<style>
* {
    box-sizing: border-box;
}

body {
    margin: 0;
    font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
}

.app-shell {
    display: flex;
    flex-direction: column;
    height: 100vh;
}

.app-main {
    flex: 1;
    min-height: 0;
    overflow: auto;
}
</style>
