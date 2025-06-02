// useWebSocket.ts
import { ref, onUnmounted, watch } from 'vue';
import { socketHeartbeatInterval, socketReConnectInterval, socketReConnectLimit, socketUrl } from '@we-socket/config';

type ErrorCallback = (msg: string, { e }?: { e: Event }) => void;
type MessageCallback = ({ e }?: { e: MessageEvent }) => void;
type CloseCallback = ({ e }?: { e: CloseEvent }) => void;
type OpenCallback = ({ e }?: { e: Event }) => void;

interface WebSocketOptions {
  type?: 'client' | 'manage';
  reconnectLimit?: number;
  reconnectInterval?: number;
  manual?: boolean;
  onOpen?: OpenCallback;
  onClose?: CloseCallback;
  onMessage?: MessageCallback;
  onError?: ErrorCallback;
}

export function useWebSocket(url: string = socketUrl, options: WebSocketOptions = {}) {
  const {
    type: clientType,
    reconnectLimit = socketReConnectLimit,
    reconnectInterval = socketReConnectInterval,
    manual = false,
    onOpen,
    onClose,
    onMessage,
    onError,
  } = options;

  const wsRef = ref<WebSocket | null>(null);
  const status = ref<'connecting' | 'open' | 'closed' | 'error'>('connecting');
  const reconnectCount = ref(0);
  const messageHistory = ref<MessageEvent[]>([]);

  const heartbeat = () => {
    if (wsRef.value && status.value === 'open') {
      wsRef.value.send(
        JSON.stringify({
          type: 'heartbeat',
        }),
      );
    }
  };

  const sendClientType = () => {
    if (wsRef.value && status.value === 'open') {
      wsRef.value.send(
        JSON.stringify({
          type: 'setClientType',
          data: {
            type: clientType,
          },
        }),
      );
    }
  };

  const connect = () => {
    if (wsRef.value) {
      wsRef.value.close();
    }

    const ws = new WebSocket(url);
    wsRef.value = ws;
    status.value = 'connecting';

    ws.onopen = (e) => {
      status.value = 'open';
      reconnectCount.value = 0;
      onOpen?.({ e });
      sendClientType();
      setInterval(heartbeat, socketHeartbeatInterval ?? 30000);
    };

    ws.onmessage = (e: MessageEvent) => {
      messageHistory.value.push(e);
      onMessage?.({ e });
    };

    ws.onclose = (e) => {
      status.value = 'closed';
      onClose?.({ e });
      reconnect();
    };

    ws.onerror = (e) => {
      status.value = 'error';
      onError?.('unknown', { e });
      reconnect();
    };
  };

  const reconnect = () => {
    if (reconnectCount.value < reconnectLimit) {
      reconnectCount.value += 1;
      setTimeout(() => {
        console.warn(`[SocketConnectHooks] reconnecting, reconnect time: ${reconnectCount.value}`);
        connect();
      }, reconnectInterval);
    }
  };

  const send = (data: string | ArrayBuffer | Blob | ArrayBufferView) => {
    if (wsRef.value && status.value === 'open') {
      wsRef.value.send(data);
    } else {
      onError?.('WebSocket is not connected');
    }
  };

  const close = () => {
    if (wsRef.value) {
      wsRef.value.close();
    }
  };

  // Auto connect unless manual is true
  if (!manual) {
    connect();
  }

  // Clean up on component unmount
  onUnmounted(() => {
    close();
  });

  // Reconnect when url changes
  watch(
    () => url,
    () => {
      connect();
    },
  );

  return {
    ws: wsRef,
    status,
    messageHistory,
    connect,
    send,
    close,
    reconnectCount,
  };
}
