import { defineConfig } from 'vite';
import path from 'path';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';

const srcRootPath = path.resolve(__dirname, './src');
const packagesRootPath = path.resolve(__dirname, '../');

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  server: {
    port: 30012,
    host: '0.0.0.0',
    open: true,
  },
  resolve: {
    alias: {
      '@': srcRootPath,
      '@qas/service': path.resolve(packagesRootPath, 'service'),
      '@qas/hooks': path.resolve(packagesRootPath, 'hooks'),
      '@qas/utils': path.resolve(packagesRootPath, 'utils'),
      '@qas/config': path.resolve(packagesRootPath, 'config'),
      '@qas/type': path.resolve(packagesRootPath, 'types'),
    },
  },
  plugins: [vue(), vueJsx()],
});
