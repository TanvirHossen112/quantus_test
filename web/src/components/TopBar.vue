<template>
  <header class="top-bar">
    <span class="brand">Quantus</span>
    <nav>
      <RouterLink to="/" class="nav-link">Articles</RouterLink>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';
</script>

<style scoped>
.top-bar {
  display: flex;
  align-items: center;
  gap: 2rem;
  padding: 0.6rem 1rem;
  background: #f7f7fa;
  border-bottom: 1px solid #ddd;
}
.brand {
  font-weight: 700;
  color: #3f51b5;
  letter-spacing: 0.02em;
}
nav {
  display: flex;
  gap: 0.4rem;
}
.nav-link {
  padding: 0.4rem 0.9rem;
  border-radius: 4px;
  color: #444;
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 600;
}
.nav-link:hover {
  background: #eceef5;
}
/* vue-router's built-in exact-match class for the current route */
.nav-link.router-link-exact-active {
  background: #3f51b5;
  color: #fff;
}
</style>
