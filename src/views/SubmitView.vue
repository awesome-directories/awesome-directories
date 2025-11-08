<template>
  <div class="min-h-screen bg-gray-50 py-12">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 class="text-4xl font-bold text-gray-900 mb-4">Submit a Directory</h1>
      <p class="text-xl text-gray-600 mb-8">
        Help the community by contributing high-quality directories
      </p>

      <div class="card p-8 mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Submission Guidelines</h2>

        <div class="prose prose-blue max-w-none">
          <h3>How to Submit</h3>
          <p>
            Awesome Directories is an open-source project. To submit a new directory:
          </p>

          <ol class="space-y-2">
            <li>Fork the repository on GitHub</li>
            <li>Add your directory to the <code>supabase/seed-data.json</code> file</li>
            <li>Create a Pull Request with your changes</li>
            <li>We'll review and merge within 48 hours</li>
          </ol>

          <h3 class="mt-6">Submission Criteria</h3>
          <ul class="space-y-2">
            <li>✅ Domain Rating (DR) of 60 or higher preferred</li>
            <li>✅ Active directory (no dead links)</li>
            <li>✅ Quality focus (not just link farms)</li>
            <li>✅ Relevant to startups, SaaS, or developers</li>
            <li>✅ Free or freemium submission option available</li>
          </ul>

          <h3 class="mt-6">What to Include</h3>
          <ul class="space-y-2">
            <li>Directory name</li>
            <li>URL</li>
            <li>Description (1-2 sentences)</li>
            <li>Categories</li>
            <li>Pricing type (free, paid, freemium)</li>
            <li>Domain Rating (if known)</li>
            <li>Dofollow status (if known)</li>
          </ul>
        </div>

        <div class="mt-8">
          <a
            href="https://github.com/awesome-directories/awesome-directories"
            target="_blank"
            rel="noopener"
            class="btn-primary inline-flex items-center"
          >
            <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd" />
            </svg>
            Create GitHub PR
          </a>
        </div>
      </div>

      <div class="card p-8 bg-blue-50 border-blue-200">
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Need Help?</h3>
        <p class="text-gray-700">
          If you have questions about the submission process, please open an issue on GitHub or reach out via email.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  if (window.pirsch) {
    window.pirsch('Submit Page View')
  }
})
</script>

<style scoped>
.prose code {
  @apply bg-gray-100 px-2 py-1 rounded text-sm;
}
</style>
