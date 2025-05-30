import { Server as HTTPServer } from 'http';
import { Server as WebSocketServer, WebSocket } from 'ws';
import Koa from 'koa';

// 创建WebSocket服务器并将其附加到HTTP服务器
export function attachWebSocketServer(httpServer: HTTPServer): WebSocketServer {
  const wss = new WebSocketServer({ server: httpServer });

  // 处理WebSocket连接
  wss.on('connection', (ws: WebSocket) => {
    // 处理连接建立
    console.log('Client connected');

    // 处理消息接收
    ws.on('message', (message: Buffer) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('Received message:', data);

        // 发送响应
        ws.send(
          JSON.stringify({
            type: 'response',
            data: `Server received: ${JSON.stringify(data)}`,
          }),
        );
      } catch (error) {
        console.error('Error processing message:', error);
        ws.send(
          JSON.stringify({
            type: 'error',
            message: 'Invalid message format',
          }),
        );
      }
    });

    // 处理连接关闭
    ws.on('close', () => {
      console.log('Client disconnected');
    });

    // 处理错误
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  return wss;
}

// 广播消息给所有连接的客户端
export function broadcast(wss: WebSocketServer, message: any) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}
