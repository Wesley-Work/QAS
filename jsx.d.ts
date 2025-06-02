import { HTMLAttributes } from 'vue';

declare module '*.vue' {
  import type { DefineComponent, Plugin } from 'vue';
  const component: DefineComponent<{}, {}, any> & Plugin;
  export default component;
}

declare global {
  namespace JSX {
    interface IntrinsicAttributes {
      [emit: string]: any;
    }

    interface IntrinsicElements {
      [elem: string]: any;
    }
  }
}

declare module '@vue/runtime-dom' {}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    // todo
    [x: string]: any;
  }
}
