import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

/**
 * Astro integration for Pagefind search
 * Runs Pagefind indexing after the build completes
 */
export default function pagefindIntegration() {
  let outDir;

  return {
    name: 'pagefind-integration',
    hooks: {
      'astro:config:done': ({ config }) => {
        // Store the output directory
        outDir = fileURLToPath(config.outDir);
      },
      'astro:build:done': () => {
        // Run Pagefind indexing after build completes
        try {
          console.log('🔍 Running Pagefind indexing...');

          // Index only blog pages (data-pagefind-body attribute)
          execSync(
            `npx pagefind --site "${outDir}" --glob "blog/**/*.html"`,
            {
              encoding: 'utf-8',
              stdio: 'inherit',
            }
          );

          console.log('✅ Pagefind indexing completed successfully!');
        } catch (error) {
          console.error('❌ Error running Pagefind:', error.message);
          // Don't throw - allow build to continue even if Pagefind fails
        }
      },
    },
  };
}
