import { apiRequest } from './client.js';
import type { Article, ArticleFormPayload } from '../types/article.js';

export const articlesApi = {
  tree: () => apiRequest<Article[]>('/articles?tree=true'),
  
  list: () => apiRequest<Article[]>('/articles'),

  get: (id: string) => apiRequest<Article>(`/articles/${id}`),

  create: (payload: ArticleFormPayload) =>
    apiRequest<Article>('/articles', { method: 'POST', body: JSON.stringify(payload) }),

  update: (id: string, payload: Partial<ArticleFormPayload>) =>
    apiRequest<Article>(`/articles/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  
  remove: (id: string) => apiRequest<void>(`/articles/${id}`, { method: 'DELETE' }),
};
