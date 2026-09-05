<template>
  <div class="page">
    <p v-if="loading">Loading…</p>
    <p v-else-if="errorMessage" class="error">{{ errorMessage }}</p>
    <p v-else-if="tree.length === 0" class="empty">No articles yet.</p>

    <template v-else>
      <ul class="tree-root">
        <ResultTreeNode
          v-for="article in tree"
          :key="article.id"
          :article="article"
          :depth="0"
          :objects-by-article-id="objectsByArticleId"
        />
      </ul>

      <div class="grand-total">
        <span>Grand total</span>
        <span>{{ formatCents(grandTotalCents) }}</span>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { articlesApi } from "../api/articles";
import { objectsApi } from "../api/objects";
import { summaryApi } from "../api/summary";
import { ApiError } from "../api/client";
import { formatCents } from "../utils/money";
import { groupByArticleId } from "../utils/rollup";
import ResultTreeNode from "../components/ResultTreeNode.vue";
import type { Article } from "../types/article";
import type { QuantusObject } from "../types/object";

const tree = ref<Article[]>([]);
const objectsByArticleId = ref<Map<string, QuantusObject[]>>(new Map());
const grandTotalCents = ref(0);
const loading = ref(true);
const errorMessage = ref<string | null>(null);

async function load() {
  loading.value = true;
  errorMessage.value = null;
  try {
    const [articles, objects, summary] = await Promise.all([
      articlesApi.tree(),
      objectsApi.listAll(),
      summaryApi.get(),
    ]);
    tree.value = articles;
    objectsByArticleId.value = groupByArticleId(objects);
    grandTotalCents.value = summary.grandTotal;
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : "Failed to load result";
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<style scoped>
.page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 1.5rem;
  font-family:
    system-ui,
    -apple-system,
    "Segoe UI",
    sans-serif;
}
.empty,
.error {
  color: #777;
  padding: 1rem 0;
}
.error {
  color: #c62828;
}
.tree-root {
  list-style: none;
  margin: 0;
  padding: 0;
  border-top: 1px solid #ddd;
}
.grand-total {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
  padding: 0.75rem 0.5rem;
  border-top: 2px solid #333;
  font-weight: 700;
  font-size: 1.1rem;
}
</style>
