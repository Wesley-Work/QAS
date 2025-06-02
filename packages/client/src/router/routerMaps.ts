import { RouteRecordRaw } from 'vue-router';

export const routerMaps: RouteRecordRaw[] = [
  {
    path: '',
    component: () => import('@qas/client/src/pages/default.tsx'),
  },
  {
    path: '/client',
    component: () => import('@qas/client/src/pages/client.tsx'),
  },
  {
    path: '/manage',
    component: () => import('@qas/client/src/pages/manage.tsx'),
  },
];
