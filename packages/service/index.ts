import Koa from 'koa';
import { attachWebSocketServer } from './socket';
import router from './route';

// 创建Koa应用实例
const app = new Koa();

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

app.on('error', (err, ctx) => {
  console.error('Server Error:', err);
});

// 注册路由中间件
app.use(router.routes());
app.use(router.allowedMethods());

// 启动服务器
const PORT = process.env.PORT ?? 3000;
const NODE_ENV = process.env.NODE_ENV ?? 'development';

const server = app.listen(PORT, () => {
  console.log(`[${NODE_ENV.toUpperCase()}] Server started with configuration:`);
  console.log(`- Environment: ${NODE_ENV}`);
  console.log(`- HTTP server: http://localhost:${PORT}`);
  console.log(`- WebSocket server: ws://localhost:${PORT}`);
});

// 附加WebSocket服务器到Koa服务器
const wss = attachWebSocketServer(server);

// 处理进程退出
process.on('SIGINT', () => {
  console.log('\nGracefully shutting down...');

  // 关闭WebSocket服务器
  wss.close(() => {
    console.log('WebSocket server closed');

    // 关闭Koa服务器
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  });
});
