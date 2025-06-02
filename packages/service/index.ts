import Koa from 'koa';
import websocket from 'koa-websocket';
import router from './route';
import { setupWebSocketRoutes } from './socket';

// 创建Koa应用实例
const app = new Koa();

// 添加WebSocket支持
const wsApp = websocket(app);

// 全局错误处理
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = {
      error: err.message || 'Internal Server Error',
    };
    ctx.app.emit('error', err, ctx);
  }
});

// 错误事件监听
app.on('error', (err) => {
  console.error('Server Error:', err);
});

// 配置HTTP路由
app.use(router.routes());
app.use(router.allowedMethods());

// 启动服务器
const PORT = process.env.PORT ?? 3000;
const NODE_ENV = process.env.NODE_ENV ?? 'development';

const server = app.listen(PORT, () => {
  console.info(`[${NODE_ENV.toUpperCase()}] Server started with configuration:`);
  console.info(`- Environment: ${NODE_ENV}`);
  console.info(`- HTTP server: http://localhost:${PORT}`);
  console.info(`- WebSocket server: ws://localhost:${PORT}`);
});

// 将server实例添加到wsApp
// wsApp.server = server;

// 配置WebSocket路由
setupWebSocketRoutes(wsApp);

// 处理进程退出
process.on('SIGINT', () => {
  console.info('\nGracefully shutting down...');

  // 关闭服务器
  server.close(() => {
    console.info('Server closed');
    process.exit(0);
  });
});

// 导出app实例（方便测试）
export default app;
