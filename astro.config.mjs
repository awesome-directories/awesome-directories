import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://awesome-directories.com',
  base: '/',
  integrations: [
    vue({
      appEntrypoint: '/src/pages/_app'
    }),
    sitemap()
  ],
  vite: {
    resolve: {
      alias: {
        '@': '/src',
      },
    },
  },
  output: 'static',
  build: {
    inlineStylesheets: 'auto',
  },
  compressHTML: true,
});
