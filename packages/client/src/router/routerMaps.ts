import { RouteRecordRaw } from 'vue-router';

export const routerMaps: RouteRecordRaw[] = [
  {
    path: '',
    component: () => import('@we-socket/client/src/pages/default.tsx'),
  },
  {
    path: '/client',
    component: () => import('@we-socket/client/src/pages/client.tsx'),
  },
  {
    path: '/manage',
    component: () => import('@we-socket/client/src/pages/manage.tsx'),
  },
];
