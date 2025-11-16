import sitemap from "@astrojs/sitemap";
import vue from "@astrojs/vue";
import { defineConfig } from "astro/config";
import { visualizer } from "rollup-plugin-visualizer";
import { compression } from "vite-plugin-compression2";
import { ViteMinifyPlugin } from "vite-plugin-minify";

export default defineConfig(function configureAstro({ mode }) {
  var isProd = mode === "production";

  var vitePlugins = [
    ViteMinifyPlugin({}),
    visualizer({
      filename: "bundle-analysis.html",
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ];

  if (isProd) {
    vitePlugins.push(
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
      }),
    );
  }

  return {
    site: "https://awesome-directories.com",
    base: "/",
    server: {
      host: true,
      port: 3000,
    },
    integrations: [
      vue({
        appEntrypoint: "/src/pages/_app",
      }),
      sitemap(),
    ],
    vite: {
      plugins: vitePlugins,
      resolve: {
        alias: {
          "@": "/src",
        },
      },
      optimizeDeps: {
        exclude: ["loglevel"],
      },
      build: {
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
    },
    output: "static",
    build: {
      inlineStylesheets: "auto",
      assets: "_astro",
    },
    compressHTML: true,
  };
});
