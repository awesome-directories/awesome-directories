import sitemap from "@astrojs/sitemap";
import compress from "@playform/compress";
import vue from "@astrojs/vue";
import mdx from "@astrojs/mdx";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "astro/config";
import { fileURLToPath } from "node:url";
import { saveDirectoriesIntegration } from "./src/integrations/save-directories.js";
import { saveStatsIntegration } from "./src/integrations/save-stats.js";
import pagefindIntegration from "./src/integrations/pagefind.js";

// https://astro.build/config
export default defineConfig({
  site: "https://awesome-directories.com",
  base: "/",
  server: {
    port: 3000,
  },

  integrations: [
    mdx(),
    saveDirectoriesIntegration(),
    saveStatsIntegration(),
    vue(),
    sitemap(),
    pagefindIntegration(),
    compress({
      CSS: true,
      HTML: {
        "html-minifier-terser": {
          removeAttributeQuotes: false,
          collapseWhitespace: true,
          removeComments: true,
          minifyCSS: true,
          minifyJS: true,
        },
      },
      Image: false, // Disable image compression as we're using sharp
      JavaScript: true,
      SVG: true,
    }),
  ],

  output: "static",

  vite: {
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },

    build: {
      outDir: "dist",
      assetsDir: "assets",
      sourcemap: false,
      chunkSizeWarningLimit: 500,
      minify: "terser",
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ["console.log", "console.info", "console.debug"],
          passes: 3,
          ecma: 2020,
          unsafe_arrows: true,
          unsafe_methods: true,
        },
        mangle: {
          safari10: true,
        },
        format: {
          comments: false,
        },
      },
      cssMinify: "lightningcss",
      rollupOptions: {
        treeshake: {
          preset: "recommended",
          moduleSideEffects: false,
        },
        output: {
          manualChunks: function manualChunks(id) {
            if (id.includes("node_modules")) {
              if (id.includes("@supabase/supabase-js")) {
                return "supabase";
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
              if (id.includes("nanostores")) {
                return "nanostores";
              }
              if (id.includes("chart.js")) {
                return "chartjs";
              }
              if (id.includes("vue")) {
                return "vue";
              }
              return "vendor";
            }
          },
          compact: true,
        },
        plugins: [
          visualizer({
            filename: "bundle-analysis.html",
            open: false,
            gzipSize: true,
            brotliSize: true,
          }),
        ],
      },
    },

    optimizeDeps: {
      include: ["vue", "@supabase/supabase-js"],
    },
  },

  compressHTML: true,
  scopedStyleStrategy: "class",
});
