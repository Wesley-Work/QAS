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

interface WebsocketClientList {
  [clientId: string]: {
    type: 'client' | 'manage' | null;
    connectTimestamp: number;
  };
}

interface WebsocketReceivedMessage {
  type: string;
  [k: string]: any;
}

// 统一的错误处理
const handleError = (ctx: MiddlewareContext<DefaultState>, error: any, clientId: string = null) => {
  ctx.websocket.send(
    JSON.stringify({
      type: 'error',
      data: {
        clientId: clientId,
        errcode: 'Internal WebSocket error',
        errmsg: error,
      },
      timestamp: new Date().toISOString(),
    }),
  );
};

// 统一处理告警消息
const handleWarning = (msg: any, data: any, clientId: string = null) => {
  return JSON.stringify({
    type: 'warning',
    data: {
      clientId: clientId,
      msg: msg,
      receiveData: data,
    },
    timestamp: new Date().toISOString(),
  });
};

// 设置WebSocket路由和处理程序
export function setupWebSocketRoutes(app: ReturnType<typeof websocket> & { server?: any }): void {
  // 连接列表
  let clientsList: WebsocketClientList = {};

  // WebSocket错误处理中间件
  app.ws.use(async (ctx: MiddlewareContext<DefaultState>, next) => {
    try {
      await next();
    } catch (err) {
      console.error('WebSocket Error:', err);
      handleError(ctx, err);
    }
  });

  const handleReceived = (data: WebsocketReceivedMessage, clientId: string) => {
    const clientData = clientsList[clientId];

    // 判断消息类型
    if (!data?.type) {
      return handleWarning('消息类型不正确！', data, clientId);
    }

    // 处理心跳
    if (data.type === 'heartbeat') {
      return JSON.stringify({
        type: 'heartbeat',
        data: {
          clientId: clientId,
          receiveData: data,
          msg: "I'm alive!",
        },
        timestamp: new Date().toISOString(),
      });
    }

    if (data.type === 'setClientType') {
      const type = data.data.type;

      if (!['client', 'manage'].includes(type)) {
        return handleWarning('未知的客户端类型', data, clientId);
      }

      clientsList[clientId].type = type;

      return JSON.stringify({
        type: 'setClientType',
        data: {
          clientId: clientId,
          receiveData: data,
          clientType: type,
        },
        timestamp: new Date().toISOString(),
      });
    }

    // 判断当前客户端类型，如未设置就返回告警
    if (!clientData?.type) {
      return handleWarning('需要设置客户端类型！', data, clientId);
    }

    return JSON.stringify({
      type: 'response',
      data: {
        clientId: clientId,
        msg: 'DEFAULT RETURN',
      },
      timestamp: new Date().getTime(),
    });
  };

  // WebSocket处理
  app.ws.use(async (ctx) => {
    const clientId = Math.random().toString(36).substring(3);
    console.info(`Client connected (ID: ${clientId})`);

    // 发送ServerHello消息
    ctx.websocket.send(
      JSON.stringify({
        type: 'connected',
        data: {
          clientId: clientId,
        },
        timestamp: new Date().getTime(),
      }),
    );

    // 记录客户端连接
    clientsList[clientId] = { type: null, connectTimestamp: new Date().getTime() };

    // 消息接收
    ctx.websocket.on('message', (message: Buffer) => {
      try {
        const data: WebsocketReceivedMessage = JSON.parse(message.toString());
        console.info(`Received message from ${clientId}:`, data);

        // 返回响应
        ctx.websocket.send(handleReceived(data, clientId));
      } catch (error) {
        console.error(`Error processing message from ${clientId}:`, error);
        handleError(ctx, 'Invalid message format. Please send valid JSON.', clientId);
      }
    });

    // 连接关闭
    ctx.websocket.on('close', () => {
      console.info(`Client disconnected (ID: ${clientId})`);
      // 删除记录
      clientsList = Object.keys(clientsList)
        .filter((key) => key !== clientId)
        .reduce((obj: any, key: string) => {
          obj[key] = clientsList[key];
          return obj;
        }, {});
    });

    // 连接错误
    ctx.websocket.on('error', (error: any) => {
      console.error(`WebSocket error for client ${clientId}:`, error);
      // 返回错误
      handleError(ctx, error, clientId);
    });
  });
}
