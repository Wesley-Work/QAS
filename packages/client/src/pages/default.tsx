import { Button, Space } from 'tdesign-vue-next';
import { defineComponent } from 'vue';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'QASDefault',
  setup() {
    const router = useRouter();
    return () => {
      return (
        <Space size="small">
          <Button onClick={() => router.push('/client')}>client</Button>
          <Button onClick={() => router.push('/manage')}>manage</Button>
        </Space>
      );
    };
  },
});
