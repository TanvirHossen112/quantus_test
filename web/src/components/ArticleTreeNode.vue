<template>
  <li>
    <div
      class="row"
      :class="{ selected: props.article.id === props.selectedId }"
      :style="{ paddingLeft: `${depth * 1.25}rem` }"
    >
      <button
        v-if="hasChildren"
        type="button"
        class="toggle-expand"
        :title="expanded ? 'Collapse' : 'Expand'"
        @click="expanded = !expanded"
      >
        {{ expanded ? "−" : "+" }}
      </button>
      <span v-else class="toggle-expand-spacer" />

      <button
        type="button"
        class="row-main"
        @click="emit('select', props.article)"
      >
        <span class="code">{{ props.article.code }}</span>
        <span class="title">{{ props.article.title }}</span>
      </button>
    </div>

    <ul v-if="hasChildren && expanded" class="children">
      <ArticleTreeNode
        v-for="child in props.article.children"
        :key="child.id"
        :article="child"
        :depth="depth + 1"
        :selected-id="selectedId"
        @select="(a) => emit('select', a)"
      />
    </ul>
  </li>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { Article } from "../types/article";

const props = defineProps<{
  article: Article;
  depth: number;
  selectedId: string | null;
}>();

const emit = defineEmits<{
  select: [article: Article];
}>();
const expanded = ref(false);
const hasChildren =
  props.article.children != null && props.article.children.length > 0;
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
  border-bottom: 1px solid #eee;
}
.row.selected {
  background: #e8eaf6;
}
.row-main {
  flex: 1;
  display: flex;
  gap: 0.6rem;
  align-items: baseline;
  text-align: left;
  background: none;
  border: none;
  padding: 0.4rem 0.5rem;
  cursor: pointer;
  font: inherit;
}
.row-main:hover {
  background: #f5f5f5;
}
.code {
  color: #666;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.title {
  color: #222;
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
  padding: 0.2rem 0;
  cursor: pointer;
  text-align: center;
}
.toggle-expand:hover {
  color: #333;
}
</style>
