import Router from 'koa-router';
import { Context } from 'koa';

// 创建路由实例
const router = new Router();

// 基础路由
router.get('/', async (ctx) => {
  ctx.body = {
    status: 'ok',
    message: 'Server is running',
  };
});

// 健康检查路由
router.get('/health', async (ctx) => {
  ctx.body = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
  };
});

// API路由组
const apiRouter = new Router({
  prefix: '/api',
});

// API路由处理器
apiRouter.get('/', async (ctx) => {
  ctx.body = {
    version: '1.0.0',
    endpoints: ['/api', '/api/status'],
  };
});

apiRouter.get('/status', async (ctx) => {
  ctx.body = {
    status: 'operational',
    time: new Date().toISOString(),
  };
});

// 合并所有路由
router.use(apiRouter.routes());
router.use(apiRouter.allowedMethods());

export default router;
