import sitemap from '@astrojs/sitemap';
import compress from '@playform/compress';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';

// https://astro.build/config
export default defineConfig({
  site: 'https://awesome-directories.github.io',
  base: '/awesome-directories',

  integrations: [
    sitemap(),
    compress({
      CSS: true,
      HTML: {
        'html-minifier-terser': {
          removeAttributeQuotes: false,
        },
      },
      Image: false, // Disable image compression as we're using sharp
      JavaScript: true,
      SVG: true,
    }),
  ],

  output: 'static',

  vite: {
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },

    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
      chunkSizeWarningLimit: 600,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info', 'console.debug'],
          passes: 2,
        },
        mangle: {
          safari10: true,
        },
        format: {
          comments: false,
        },
      },
      cssMinify: 'lightningcss',
      rollupOptions: {
        treeshake: {
          preset: 'recommended',
          moduleSideEffects: false,
        },
        output: {
          manualChunks(id) {
            // Manual chunking strategy for optimal code splitting
            if (id.includes('node_modules')) {
              if (id.includes('@supabase/supabase-js')) {
                return 'supabase';
              }
              if (id.includes('html2canvas')) {
                return 'html2canvas';
              }
              if (id.includes('jspdf')) {
                return 'jspdf';
              }
              if (id.includes('papaparse')) {
                return 'papaparse';
              }
              if (id.includes('nanostores')) {
                return 'nanostores';
              }
              return 'vendor';
            }
          },
          compact: true,
        },
        plugins: [
          visualizer({
            filename: 'bundle-analysis.html',
            open: false,
            gzipSize: true,
            brotliSize: true,
          }),
        ],
      },
    },

    server: {
      port: 3000,
    },
  },
});
