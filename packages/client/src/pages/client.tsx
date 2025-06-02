import { defineComponent, onMounted } from 'vue';
import { useWebSocket } from '@qas/hooks';
import { socketUrl } from '@qas/config';

export default defineComponent({
  name: 'QASClient',
  setup() {
    const { status, messageHistory, send } = useWebSocket(socketUrl, {
      type: 'client',
      onMessage: ({ e }) => {
        console.log('Received:', e.data);
      },
      onError: (error) => {
        console.error('WebSocket error:', error);
      },
      onOpen: () => {
        console.log('WebSocket connection established');
        send(JSON.stringify({ a: 'Hello!' }));
      },
      onClose: () => {
        console.log('WebSocket connection closed');
      },
    });

    // onMounted(() => {
    //   send('Hello!');
    // });

    return () => {
      return (
        <div>
          <div>123</div>
        </div>
      );
    };
  },
});
