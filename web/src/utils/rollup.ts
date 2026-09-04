import type { Article } from '../types/article';
import type { QuantusObject } from '../types/object';

export function computeSubtotal(
  article: Article,
  objectsByArticleId: Map<string, QuantusObject[]>,
): number {
  const ownTotal = (objectsByArticleId.get(article.id) ?? []).reduce(
    (sum, object) => sum + object.lineTotalCents,
    0,
  );
  const childrenTotal = (article.children ?? []).reduce(
    (sum, child) => sum + computeSubtotal(child, objectsByArticleId),
    0,
  );
  return ownTotal + childrenTotal;
}

export function groupByArticleId(objects: QuantusObject[]): Map<string, QuantusObject[]> {
  const map = new Map<string, QuantusObject[]>();
  for (const object of objects) {
    const siblings = map.get(object.articleId) ?? [];
    siblings.push(object);
    map.set(object.articleId, siblings);
  }
  return map;
}
