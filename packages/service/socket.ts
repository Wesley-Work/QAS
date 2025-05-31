import type { Server } from 'ws';
import websocket from 'koa-websocket';
import type { Middleware, MiddlewareContext } from 'koa-websocket';
import type { DefaultState, DefaultContext } from 'koa';

// 广播消息给所有连接的客户端
export function broadcast(wss: Server, message: unknown): void {
  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

// 设置WebSocket路由和处理程序
export function setupWebSocketRoutes(app: ReturnType<typeof websocket> & { server?: any }): void {
  // WebSocket错误处理中间件
  app.ws.use(async (ctx: MiddlewareContext, next) => {
    try {
      await next();
    } catch (err) {
      console.error('WebSocket Error:', err);
      ctx.websocket.send(
        JSON.stringify({
          type: 'error',
          message: 'Internal WebSocket Error',
        }),
      );
    }
  });

  // 通用WebSocket处理中间件
  const wsHandler: Middleware = async (ctx: MiddlewareContext) => {
    const clientId = Math.random().toString(36).substring(7);
    console.log(`Client connected (ID: ${clientId})`);

    // 获取服务器端口
    const serverPort = app.server && app.server.address() ? (app.server.address() as { port: number }).port : 3000;

    // 发送欢迎消息
    ctx.websocket.send(
      JSON.stringify({
        type: 'system',
        data: `Connected successfully. Your client ID: ${clientId}`,
        timestamp: new Date().toISOString(),
        serverInfo: {
          port: serverPort,
          path: ctx.path,
          protocol: 'ws',
        },
      }),
    );

    // 处理消息接收
    ctx.websocket.on('message', (message: Buffer) => {
      try {
        const data = JSON.parse(message.toString());
        console.log(`Received message from ${clientId}:`, data);

        // 发送响应
        ctx.websocket.send(
          JSON.stringify({
            type: 'response',
            clientId,
            timestamp: new Date().toISOString(),
            data: `Server received: ${JSON.stringify(data)}`,
          }),
        );
      } catch (error) {
        console.error(`Error processing message from ${clientId}:`, error);
        ctx.websocket.send(
          JSON.stringify({
            type: 'error',
            clientId,
            timestamp: new Date().toISOString(),
            message: 'Invalid message format. Please send valid JSON.',
          }),
        );
      }
    });

    // 处理连接关闭
    ctx.websocket.on('close', () => {
      console.log(`Client disconnected (ID: ${clientId})`);
    });

    // 处理错误
    ctx.websocket.on('error', (error) => {
      console.error(`WebSocket error for client ${clientId}:`, error);
    });
  };

  // 注册WebSocket处理
  app.ws.use(async (ctx, next) => {
    // 根据路径处理不同的WebSocket逻辑
    if (ctx.path === '/echo') {
      // Echo服务
      const echoClientId = Math.random().toString(36).substring(7);
      const serverPort = app.server && app.server.address() ? (app.server.address() as { port: number }).port : 3000;

      console.log(`Echo client connected (ID: ${echoClientId})`);

      // 发送欢迎消息
      ctx.websocket.send(
        JSON.stringify({
          type: 'system',
          service: 'echo',
          clientId: echoClientId,
          timestamp: new Date().toISOString(),
          serverInfo: {
            port: serverPort,
            path: ctx.path,
            protocol: 'ws',
          },
        }),
      );

      ctx.websocket.on('message', (message) => {
        try {
          // 尝试解析JSON，如果成功则保持JSON格式返回
          const jsonMessage = JSON.parse(message.toString());
          ctx.websocket.send(
            JSON.stringify({
              type: 'echo',
              clientId: echoClientId,
              timestamp: new Date().toISOString(),
              data: jsonMessage,
            }),
          );
        } catch {
          // 如果不是JSON，则直接回显原始消息
          ctx.websocket.send(message.toString());
        }
      });

      ctx.websocket.on('close', () => {
        console.log(`Echo client disconnected (ID: ${echoClientId})`);
      });

      ctx.websocket.on('error', (error) => {
        console.error(`Echo WebSocket error for client ${echoClientId}:`, error);
      });
    } else {
      // 默认处理
      await wsHandler(ctx, next);
    }
  });
}
