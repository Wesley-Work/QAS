import { createRouter, createWebHashHistory, RouteRecordRaw, RouterOptions } from 'vue-router';
import RenderComponents from './renderComponent';
import { routerMaps } from '@we-socket/config';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: RenderComponents,
    children: [...routerMaps],
  },
  {
    path: '/',
    redirect: '/',
  },
  {
    path: '/:w+',
    redirect: '/',
  },
];

const routerConfig: RouterOptions = {
  history: createWebHashHistory(),
  routes,
  scrollBehavior(to, from) {
    if (to.path !== from.path) {
      return { top: 0 };
    }
  },
};

const router = createRouter(routerConfig);

export default router;
