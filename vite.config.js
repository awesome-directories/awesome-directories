import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig, loadEnv } from "vite";
import { compression } from "vite-plugin-compression2";
import { ViteMinifyPlugin } from "vite-plugin-minify";

export default defineConfig(function configureVite({ mode }) {
  var env = loadEnv(mode, process.cwd(), "");
  var isProd = mode === "production";

  var requiredEnvVars = ["VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY"];

  var missingVars = requiredEnvVars.filter(function filterMissingVars(varName) {
    return !env[varName];
  });

  if (missingVars.length > 0 && mode === "production") {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(", ")}\n` +
        "Please set these in your .env file or environment."
    );
  }

  var plugins = [
    vue({
      template: {
        compilerOptions: {
          hoistStatic: true,
          cacheHandlers: true,
        },
      },
    }),
    ViteMinifyPlugin({}),
    visualizer({
      filename: "bundle-analysis.html",
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ];

  if (isProd) {
    plugins.push(
      compression({
        algorithm: "gzip",
        exclude: [/\.(br)$/, /\.(gz)$/],
        threshold: 1024,
        compressionOptions: { level: 9 },
      }),
      compression({
        algorithm: "brotliCompress",
        exclude: [/\.(br)$/, /\.(gz)$/],
        threshold: 1024,
        compressionOptions: { level: 11 },
      })
    );
  }

  return {
    plugins: plugins,
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    optimizeDeps: {
      exclude: ["loglevel"],
    },
    build: {
      outDir: "dist",
      assetsDir: "assets",
      sourcemap: isProd ? false : "inline",
      chunkSizeWarningLimit: 600,
      minify: isProd ? "terser" : false,
      terserOptions: isProd
        ? {
            compress: {
              drop_console: true,
              drop_debugger: true,
              pure_funcs: ["console.log", "console.info", "console.debug"],
              passes: 2,
            },
            mangle: {
              safari10: true,
            },
            format: {
              comments: false,
            },
          }
        : undefined,
      cssCodeSplit: true,
      cssMinify: isProd ? "lightningcss" : false,
      rollupOptions: {
        treeshake: isProd
          ? {
              preset: "recommended",
              moduleSideEffects: false,
            }
          : false,
        output: {
          manualChunks: function getManualChunk(id) {
            if (id.includes("node_modules")) {
              if (id.includes("vue") && !id.includes("vue-router")) {
                return "vue-core";
              }
              if (id.includes("vue-router")) {
                return "vue-router";
              }
              if (id.includes("@supabase/supabase-js")) {
                return "supabase";
              }
              if (id.includes("@vueuse/core")) {
                return "vueuse";
              }
              if (id.includes("html2canvas")) {
                return "html2canvas";
              }
              if (id.includes("jspdf")) {
                return "jspdf";
              }
              if (id.includes("papaparse")) {
                return "papaparse";
              }
              if (id.includes("slugify")) {
                return "slugify";
              }
              return "vendor";
            }
          },
          compact: isProd,
        },
      },
    },
    server: {
      port: 3000,
    },
  };
});
