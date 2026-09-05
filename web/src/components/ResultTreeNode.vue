<template>
  <li>
    <div class="row article-row" :style="{ paddingLeft: `${depth * 1.25}rem` }">
      <button
        v-if="hasNested"
        type="button"
        class="toggle-expand"
        :title="expanded ? 'Collapse' : 'Expand'"
        @click="expanded = !expanded"
      >
        {{ expanded ? "−" : "+" }}
      </button>
      <span v-else class="toggle-expand-spacer" />

      <span class="code">{{ article.code }}</span>
      <span class="title">{{ article.title }}</span>
      <span class="amount">{{ formatCents(subtotalCents) }}</span>
    </div>

    <ul v-if="hasNested && expanded" class="children">
      <ResultTreeNode
        v-for="child in children"
        :key="child.id"
        :article="child"
        :depth="depth + 1"
        :objects-by-article-id="objectsByArticleId"
      />
      <li
        v-for="object in ownObjects"
        :key="object.id"
        class="row object-row"
        :style="{ paddingLeft: `${(depth + 1) * 1.25}rem` }"
      >
        <span class="toggle-expand-spacer" />
        <span class="object-name">{{ object.name }}</span>
        <span class="object-qty">{{
          formatQuantity(object.unit, object.quantity)
        }}</span>
        <span class="amount">{{ formatCents(object.lineTotalCents) }}</span>
      </li>
    </ul>
  </li>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { formatCents } from "../utils/money";
import { formatQuantity } from "../utils/units";
import { computeSubtotal } from "../utils/rollup";
import type { Article } from "../types/article";
import type { QuantusObject } from "../types/object";

const props = defineProps<{
  article: Article;
  depth: number;
  objectsByArticleId: Map<string, QuantusObject[]>;
}>();

const ownObjects = props.objectsByArticleId.get(props.article.id) ?? [];
const children = props.article.children ?? [];
const hasNested = children.length > 0 || ownObjects.length > 0;
const subtotalCents = computeSubtotal(props.article, props.objectsByArticleId);

const expanded = ref(false);
</script>

<style scoped>
ul {
  list-style: none;
  margin: 0;
  padding: 0;
}
.row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  border-bottom: 1px solid #eee;
  padding: 0.35rem 0.5rem;
}
.article-row {
  font-weight: 600;
}
.object-row {
  color: #444;
  font-weight: 400;
}
.toggle-expand,
.toggle-expand-spacer {
  width: 1.6rem;
  flex: none;
}
.toggle-expand {
  border: none;
  background: none;
  color: #888;
  font-size: 1rem;
  line-height: 1;
  cursor: pointer;
  text-align: center;
}
.toggle-expand:hover {
  color: #333;
}
.code {
  color: #666;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.title,
.object-name {
  flex: 1;
}
.object-qty {
  color: #777;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.amount {
  min-width: 6rem;
  text-align: right;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
</style>
