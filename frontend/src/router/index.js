import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth.js';

const routes = [
  { path: '/login', component: () => import('../pages/Login.vue'), meta: { guestOnly: true } },
  { path: '/register', component: () => import('../pages/Register.vue'), meta: { guestOnly: true } },
  {
    path: '/',
    component: () => import('../layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/optimizer' },
      { path: 'optimizer', component: () => import('../pages/CtrOptimizer.vue') },
      { path: 'history', component: () => import('../pages/History.vue') },
      { path: 'simple-diagnose', component: () => import('../pages/SimpleDiagnose.vue') },
      { path: 'demand-diagnose', component: () => import('../pages/DemandDiagnose.vue') },
      { path: 'competitor', component: () => import('../pages/CompetitorCompare.vue') },
    ],
  },
  { path: '/:pathMatch(.*)*', redirect: '/optimizer' },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to) => {
  const auth = useAuthStore();
  if (to.meta.requiresAuth && !auth.isAuthed) {
    return { path: '/login' };
  }
  if (to.meta.guestOnly && auth.isAuthed) {
    return { path: '/optimizer' };
  }
});

export default router;
