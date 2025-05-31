import { defineComponent } from 'vue';

export default defineComponent({
  name: 'RenderComponent',
  setup() {
    return () => <router-view />;
  },
});
