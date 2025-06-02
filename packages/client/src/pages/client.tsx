import { defineComponent } from 'vue';
import { useWebSocket } from '@we-socket/hooks';
import { socketUrl } from '@we-socket/config';

export default defineComponent({
  name: 'Client',
  setup() {
    const { status, messageHistory, send } = useWebSocket(socketUrl, {
      type: 'client',
      onMessage: ({ e }) => {
        console.info('Received:', e.data);
        console.info('MessageHistory:', messageHistory);
      },
      onError: (error) => {
        console.error('WebSocket error:', error);
      },
      onOpen: () => {
        console.info('WebSocket connection established', status);
        send(JSON.stringify({ a: 'Hello!' }));
      },
      onClose: () => {
        console.info('WebSocket connection closed');
      },
    });

    return () => {
      return (
        <div>
          <div>This is Client Page</div>
        </div>
      );
    };
  },
});
