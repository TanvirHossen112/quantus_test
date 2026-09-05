<template>
  <div class="layout">
    <section class="panel tree-panel">
      <header>
        <h2>Articles</h2>
        <button type="button" class="primary" @click="startCreate(null)">
          + New root article
        </button>
      </header>

      <p v-if="loading">Loading…</p>
      <p v-else-if="tree.length === 0" class="empty">No articles yet.</p>
      <ul v-else class="tree-root">
        <ArticleTreeNode
          v-for="article in tree"
          :key="article.id"
          :article="article"
          :depth="0"
          :selected-id="selectedId"
          @select="selectArticle"
        />
      </ul>
    </section>

    <section class="panel detail-panel">
      <header><h2>Article Details</h2></header>

      <div v-if="panelMode === 'idle'" class="empty">
        Select an article on the left, or create a new one.
      </div>

      <form v-else class="detail-form" @submit.prevent="saveForm">
        <p v-if="panelMode === 'create'" class="hint">
          New article under: {{ parentLabel }}
        </p>
        <RouterLink
          v-if="panelMode === 'edit' && selectedId"
          :to="`/articles/${selectedId}/objects`"
          class="view-objects-link"
        >
          View objects →
        </RouterLink>

        <label>
          Code
          <input
            v-model="form.code"
            required
            maxlength="50"
            placeholder="20.11.10."
          />
        </label>

        <label>
          Title
          <input v-model="form.title" required maxlength="255" />
        </label>

        <label>
          Description
          <textarea
            v-model="form.description"
            rows="8"
            maxlength="10000"
          ></textarea>
        </label>

        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

        <div class="actions">
          <button type="submit" class="primary" :disabled="saving">
            {{ saving ? "Saving…" : "Save" }}
          </button>
          <button type="button" @click="cancelForm">Cancel</button>
          <button
            v-if="panelMode === 'edit' && selectedId"
            type="button"
            @click="startCreate(selectedId)"
          >
            + Add child article
          </button>
          <button
            v-if="panelMode === 'edit'"
            type="button"
            class="danger"
            :disabled="saving"
            @click="deleteSelected"
          >
            Delete
          </button>
        </div>
      </form>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { RouterLink } from "vue-router";
import { articlesApi } from "../api/articles";
import { ApiError } from "../api/client";
import ArticleTreeNode from "../components/ArticleTreeNode.vue";
import type { Article } from "../types/article";

const tree = ref<Article[]>([]);
const loading = ref(true);
const errorMessage = ref<string | null>(null);

type PanelMode = "idle" | "edit" | "create";
const panelMode = ref<PanelMode>("idle");
const selectedId = ref<string | null>(null);
const form = reactive({
  code: "",
  title: "",
  description: "",
  parentId: null as string | null,
});
const saving = ref(false);

async function loadTree() {
  loading.value = true;
  errorMessage.value = null;
  try {
    tree.value = await articlesApi.tree();
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : "Failed to load articles";
  } finally {
    loading.value = false;
  }
}

onMounted(loadTree);

function findById(nodes: Article[], id: string): Article | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    const found = node.children ? findById(node.children, id) : null;
    if (found) return found;
  }
  return null;
}

function selectArticle(article: Article) {
  panelMode.value = "edit";
  selectedId.value = article.id;
  form.code = article.code;
  form.title = article.title;
  form.description = article.description ?? "";
  form.parentId = article.parentId;
  errorMessage.value = null;
}

function startCreate(parentId: string | null) {
  panelMode.value = "create";
  selectedId.value = null;
  form.code = "";
  form.title = "";
  form.description = "";
  form.parentId = parentId;
  errorMessage.value = null;
}

function cancelForm() {
  panelMode.value = "idle";
  selectedId.value = null;
  errorMessage.value = null;
}

async function saveForm() {
  saving.value = true;
  errorMessage.value = null;
  try {
    if (panelMode.value === "create") {
      const created = await articlesApi.create({
        code: form.code,
        title: form.title,
        description: form.description || undefined,
        parentId: form.parentId ?? undefined,
      });
      await loadTree();
      selectArticle(created);
    } else if (panelMode.value === "edit" && selectedId.value) {
      await articlesApi.update(selectedId.value, {
        code: form.code,
        title: form.title,
        description: form.description,
      });
      await loadTree();
    }
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : "Save failed";
  } finally {
    saving.value = false;
  }
}

async function deleteSelected() {
  if (!selectedId.value) return;
  saving.value = true;
  errorMessage.value = null;
  try {
    await articlesApi.remove(selectedId.value);
    cancelForm();
    await loadTree();
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : "Delete failed";
  } finally {
    saving.value = false;
  }
}

const parentLabel = computed(() => {
  if (form.parentId === null) return "root (top-level)";
  const parent = findById(tree.value, form.parentId);
  return parent ? `${parent.code} ${parent.title}` : form.parentId;
});
</script>

<style scoped>
.layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  background: #ccc;
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
