<template>
  <div class="layout">
    <section class="panel tree-panel">
      <header>
        <h2>Articles</h2>
        <button type="button" class="primary">+ New root article</button>
      </header>

      <ul class="tree-root">
        <!-- TODO: Tree view here -->
      </ul>
    </section>

    <section class="panel detail-panel">
      <header><h2>Article Details</h2></header>

      <div class="empty">
        Select an article on the left, or create a new one.
      </div>

      <form class="detail-form">
        <label>
          Code
          <input v-model="form.code" required maxlength="50" placeholder="20.11.10." />
        </label>

        <label>
          Title
          <input v-model="form.title" required maxlength="255" />
        </label>

        <label>
          Description
          <textarea v-model="form.description" rows="8" maxlength="10000"></textarea>
        </label>

      </form>
    </section>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
const form = reactive({ code: '', title: '', description: '' });
</script>
<style scoped>
.layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  background: #ccc;
  /* Fills .app-main (App.vue's flex container), not the raw viewport —
     TopBar now takes vertical space above this. */
  height: 100%;
  box-sizing: border-box;
}
.panel {
  background: #fff;
  overflow-y: auto;
  padding: 0 0 1rem;
}
header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #ddd;
  background: #f7f7fa;
  position: sticky;
  top: 0;
}
h2 {
  margin: 0;
  font-size: 0.85rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #555;
}
.tree-root {
  list-style: none;
  margin: 0;
  padding: 0;
}
.empty,
.hint {
  padding: 1rem;
  color: #777;
}
.detail-form {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  padding: 1rem;
}
label {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  font-size: 0.85rem;
  color: #444;
}
input,
textarea {
  font: inherit;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.actions {
  display: flex;
  gap: 0.5rem;
}
button {
  font: inherit;
  padding: 0.5rem 0.9rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
}
button.primary {
  background: #3f51b5;
  color: #fff;
  border-color: #3f51b5;
}
button.danger {
  margin-left: auto;
  color: #c62828;
  border-color: #c62828;
}
button:disabled {
  opacity: 0.6;
  cursor: default;
}
.error {
  color: #c62828;
  font-size: 0.85rem;
}
.view-objects-link {
  align-self: flex-start;
  color: #3f51b5;
  font-size: 0.85rem;
  text-decoration: none;
}
.view-objects-link:hover {
  text-decoration: underline;
}
</style>
