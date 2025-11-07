import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  // Validate required environment variables at build time
  const requiredEnvVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ]

  const missingVars = requiredEnvVars.filter(varName => !env[varName])

  if (missingVars.length > 0 && mode === 'production') {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
      'Please set these in your .env file or environment.'
    )
  }

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    base: '/awesome-directories/',
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            'vue-vendor': ['vue', 'vue-router'],
            'supabase-vendor': ['@supabase/supabase-js'],
            'utils': ['html2canvas', 'jspdf', 'papaparse']
          }
        }
      }
    },
    server: {
      port: 3000
    }
  }
})
