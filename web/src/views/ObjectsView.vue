<template>
  <div class="layout">
    <section class="panel list-panel">
      <header>
        <h2>Objects</h2>
        <button type="button" class="primary" @click="startCreate">+ New object</button>
      </header>

      <p v-if="loading">Loading…</p>
      <p v-else-if="objects.length === 0" class="empty">No objects yet.</p>

      <template v-else>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Article</th>
              <th class="num">Quantity</th>
              <th class="num">Unit price</th>
              <th class="num">Line total</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="object in pagedObjects"
              :key="object.id"
              :class="{ selected: object.id === selectedId }"
              class="row"
              @click="selectObject(object)"
            >
              <td>{{ object.name }}</td>
              <td class="muted">{{ articleLabel(object.articleId) }}</td>
              <td class="num">{{ formatQuantity(object.unit, object.quantity) }}</td>
              <td class="num">{{ formatCents(object.unitPriceCents) }}</td>
              <td class="num">{{ formatCents(object.lineTotalCents) }}</td>
              <td class="actions-cell">
                <button type="button" class="danger-link" @click.stop="deleteObject(object.id)">
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="pagination">
          <button type="button" :disabled="currentPage === 1" @click="currentPage--">
            ← Prev
          </button>
          <span>Page {{ currentPage }} of {{ totalPages }} ({{ objects.length }} objects)</span>
          <button type="button" :disabled="currentPage === totalPages" @click="currentPage++">
            Next →
          </button>
        </div>
      </template>
    </section>

    <section class="panel detail-panel">
      <header><h2>Object Details</h2></header>

      <div v-if="panelMode === 'idle'" class="empty">
        Select an object on the left, or create a new one.
      </div>

      <form v-else class="detail-form" @submit.prevent="saveForm">
        <label>
          Drawing UUID
          <input v-model="form.drawingUuid" required />
        </label>

        <label>
          Name
          <input v-model="form.name" required maxlength="255" />
        </label>

        <label>
          Type
          <input v-model="form.type" required placeholder="wall, door, window…" />
        </label>

        <label>
          Unit
          <select v-model="form.unit">
            <option v-for="unit in UNIT_OPTIONS" :key="unit" :value="unit">{{ unit }}</option>
          </select>
        </label>
        <label v-for="key in visibleProperties" :key="key">
          {{ key }}
          <input v-model.number="form.properties[key]" type="number" step="any" required />
        </label>

        <label>
          Unit price (€)
          <input v-model.number="form.unitPriceEuros" type="number" step="0.01" min="0" required />
        </label>

        <label>
          Article
          <select v-model="form.articleId" required>
            <option v-for="article in sortedArticles" :key="article.id" :value="article.id">
              {{ article.code }} {{ article.title }}
            </option>
          </select>
        </label>

        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

        <div class="form-actions">
          <button type="submit" class="primary" :disabled="saving">
            {{ saving ? 'Saving…' : 'Save' }}
          </button>
          <button type="button" @click="cancelForm">Cancel</button>
          <button
            v-if="panelMode === 'edit' && selectedId"
            type="button"
            class="danger"
            :disabled="saving"
            @click="deleteObject(selectedId)"
          >
            Delete
          </button>
        </div>
      </form>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { articlesApi } from '../api/articles';
import { objectsApi } from '../api/objects';
import { ApiError } from '../api/client';
import { formatCents, parseEurosToCents } from '../utils/money';
import { formatQuantity, REQUIRED_PROPERTIES, UNIT_OPTIONS } from '../utils/units';
import type { Article } from '../types/article';
import type { QuantusObject } from '../types/object';

const objects = ref<QuantusObject[]>([]);
const articles = ref<Article[]>([]);
const loading = ref(true);
const errorMessage = ref<string | null>(null);
const saving = ref(false);
const PAGE_SIZE = 20;
const currentPage = ref(1);

const totalPages = computed(() => Math.max(1, Math.ceil(objects.value.length / PAGE_SIZE)));
const pagedObjects = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE;
  return objects.value.slice(start, start + PAGE_SIZE);
});

type PanelMode = 'idle' | 'edit' | 'create';
const panelMode = ref<PanelMode>('idle');
const selectedId = ref<string | null>(null);
const form = reactive({
  drawingUuid: '',
  name: '',
  type: '',
  unit: 'm' as string,
  unitPriceEuros: 0,
  properties: {} as Record<string, number | undefined>,
  articleId: '',
});

async function load() {
  loading.value = true;
  errorMessage.value = null;
  try {
    [objects.value, articles.value] = await Promise.all([
      objectsApi.listAll(),
      articlesApi.list(),
    ]);
    if (currentPage.value > totalPages.value) currentPage.value = 1;
  } catch (error) {
    errorMessage.value = error instanceof ApiError ? error.message : 'Failed to load objects';
  } finally {
    loading.value = false;
  }
}

onMounted(load);

const sortedArticles = computed(() =>
  [...articles.value].sort((a, b) => a.code.localeCompare(b.code)),
);

function articleLabel(articleId: string): string {
  const article = articles.value.find((a) => a.id === articleId);
  return article ? `${article.code} ${article.title}` : articleId;
}

const visibleProperties = computed(() => REQUIRED_PROPERTIES[form.unit] ?? []);

function selectObject(object: QuantusObject) {
  panelMode.value = 'edit';
  selectedId.value = object.id;
  form.drawingUuid = object.drawingUuid;
  form.name = object.name;
  form.type = object.type;
  form.unit = object.unit;
  form.unitPriceEuros = object.unitPriceCents / 100;
  form.properties = { ...object.properties };
  form.articleId = object.articleId;
  errorMessage.value = null;
}

function startCreate() {
  panelMode.value = 'create';
  selectedId.value = null;
  form.drawingUuid = crypto.randomUUID();
  form.name = '';
  form.type = '';
  form.unit = 'm';
  form.unitPriceEuros = 0;
  form.properties = {};
  form.articleId = sortedArticles.value[0]?.id ?? '';
  errorMessage.value = null;
}

function cancelForm() {
  panelMode.value = 'idle';
  selectedId.value = null;
  errorMessage.value = null;
}

function buildPayload() {
  const properties: Record<string, number | undefined> = {};
  for (const key of visibleProperties.value) {
    properties[key] = form.properties[key];
  }
  return {
    drawingUuid: form.drawingUuid,
    name: form.name,
    type: form.type,
    unit: form.unit,
    unitPriceCents: parseEurosToCents(form.unitPriceEuros),
    properties,
    articleId: form.articleId,
  };
}

async function saveForm() {
  saving.value = true;
  errorMessage.value = null;
  try {
    if (panelMode.value === 'create') {
      const created = await objectsApi.create(buildPayload());
      await load();
      selectObject(created);
    } else if (panelMode.value === 'edit' && selectedId.value) {
      await objectsApi.update(selectedId.value, buildPayload());
      await load();
    }
  } catch (error) {
    errorMessage.value = error instanceof ApiError ? error.message : 'Save failed';
  } finally {
    saving.value = false;
  }
}

async function deleteObject(id: string) {
  if (!confirm('Delete this object? This cannot be undone.')) return;
  saving.value = true;
  errorMessage.value = null;
  try {
    await objectsApi.remove(id);
    if (selectedId.value === id) cancelForm();
    await load();
  } catch (error) {
    errorMessage.value = error instanceof ApiError ? error.message : 'Delete failed';
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
.layout {
  display: grid;
  grid-template-columns: 3fr 2fr;
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
.empty {
  padding: 1rem;
  color: #777;
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
.muted {
  color: #777;
  font-size: 0.85rem;
}
.row {
  cursor: pointer;
}
.row:hover {
  background: #f5f5f5;
}
.row.selected {
  background: #e8eaf6;
}
.actions-cell {
  text-align: right;
}
.danger-link {
  border: none;
  background: none;
  color: #c62828;
  font-size: 0.8rem;
  cursor: pointer;
  padding: 0;
}
.danger-link:hover {
  text-decoration: underline;
}
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 0.75rem;
  font-size: 0.85rem;
  color: #555;
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
  text-transform: capitalize;
}
input,
select {
  font: inherit;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.form-actions {
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
</style>
