import { createRouter, createWebHistory } from 'vue-router';
import ArticlesView from '../views/ArticlesView.vue';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: ArticlesView },
    {
      path: '/articles/:id/objects',
      component: () => import('../views/ArticleObjectsView.vue'),
      props: true,
    },
  ],
});
