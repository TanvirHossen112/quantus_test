<template>
  <div class="page">
    <header>
      <RouterLink to="/" class="back-link">← Back to articles</RouterLink>
      <h1 v-if="article">{{ article.code }} {{ article.title }}</h1>
    </header>

    <p v-if="loading">Loading…</p>
    <p v-else-if="errorMessage" class="error">{{ errorMessage }}</p>
    <p v-else-if="objects.length === 0" class="empty">
      No objects assigned to this article yet.
    </p>

    <table v-else>
      <thead>
        <tr>
          <th>Name</th>
          <th>Type</th>
          <th>Unit</th>
          <th class="num">Unit price</th>
          <th class="num">Quantity</th>
          <th class="num">Line total</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="object in objects" :key="object.id">
          <td>{{ object.name }}</td>
          <td>{{ object.type }}</td>
          <td>{{ formatUnit(object.unit) }}</td>
          <td class="num">{{ formatCents(object.unitPriceCents) }}</td>
          <td class="num">
            {{
              object.quantity.toLocaleString(undefined, {
                maximumFractionDigits: 3,
              })
            }}
          </td>
          <td class="num">{{ formatCents(object.lineTotalCents) }}</td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <td colspan="5">Objects subtotal (this article only)</td>
          <td class="num">{{ formatCents(subtotalCents) }}</td>
        </tr>
      </tfoot>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import { articlesApi } from "../api/articles";
import { objectsApi } from "../api/objects";
import { ApiError } from "../api/client";
import { formatCents } from "../utils/money";
import { formatUnit } from "../utils/units";
import type { Article } from "../types/article";
import type { QuantusObject } from "../types/object";

const props = defineProps<{ id: string }>();

const article = ref<Article | null>(null);
const objects = ref<QuantusObject[]>([]);
const loading = ref(true);
const errorMessage = ref<string | null>(null);

async function load() {
  loading.value = true;
  errorMessage.value = null;
  try {
    [article.value, objects.value] = await Promise.all([
      articlesApi.get(props.id),
      objectsApi.list(props.id),
    ]);
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : "Failed to load objects";
  } finally {
    loading.value = false;
  }
}
onMounted(load);

const subtotalCents = computed(() =>
  objects.value.reduce((sum, object) => sum + object.lineTotalCents, 0),
);
</script>

<style scoped>
.page {
  max-width: 900px;
  margin: 0 auto;
  padding: 1.5rem;
  font-family:
    system-ui,
    -apple-system,
    "Segoe UI",
    sans-serif;
}
header {
  margin-bottom: 1.5rem;
}
.back-link {
  display: inline-block;
  margin-bottom: 0.75rem;
  color: #3f51b5;
  text-decoration: none;
  font-size: 0.85rem;
}
.back-link:hover {
  text-decoration: underline;
}
h1 {
  margin: 0;
  font-size: 1.3rem;
}
.empty,
.error {
  color: #777;
  padding: 1rem 0;
}
.error {
  color: #c62828;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th,
td {
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid #eee;
  text-align: left;
}
th {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #666;
}
.num {
  text-align: right;
  font-variant-numeric: tabular-nums;
}
tfoot td {
  border-top: 2px solid #ccc;
  border-bottom: none;
  font-weight: 600;
}
</style>
