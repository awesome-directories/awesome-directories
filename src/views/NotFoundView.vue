<template>
  <div class="min-h-screen bg-gray-50 py-16">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="card p-8 md:p-12 text-center">
        <!-- Large emoji icon -->
        <div class="text-8xl md:text-9xl mb-6">🗺️</div>

        <!-- 404 heading -->
        <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Page Not Found
        </h1>

        <!-- Description -->
        <p class="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Oops! Looks like you've wandered off the map. The page you're looking for doesn't exist in our directory.
        </p>

        <!-- Primary CTA -->
        <div class="mb-8">
          <router-link to="/" class="btn-primary">
            📂 Back to Home
          </router-link>
        </div>

        <!-- Helpful links section -->
        <div class="border-t border-gray-200 pt-8 mt-8">
          <p class="text-gray-700 font-medium mb-4">
            Here are some helpful links instead:
          </p>

          <div class="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <router-link
              to="/"
              class="text-primary hover:text-primary-dark font-medium transition-colors"
            >
              🏠 Browse Directories
            </router-link>

            <span class="hidden sm:inline text-gray-300">|</span>

            <router-link
              to="/submit"
              class="text-primary hover:text-primary-dark font-medium transition-colors"
            >
              ➕ Submit a Directory
            </router-link>

            <span class="hidden sm:inline text-gray-300">|</span>

            <router-link
              to="/about"
              class="text-primary hover:text-primary-dark font-medium transition-colors"
            >
              ℹ️ About Us
            </router-link>
          </div>
        </div>
      </div>

      <!-- Optional: Current URL display for debugging -->
      <div class="mt-6 text-center">
        <p class="text-sm text-gray-500">
          Error code: 404 • Path: <code class="bg-gray-100 px-2 py-1 rounded text-gray-700">{{ currentPath }}</code>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const currentPath = computed(() => {
  return route.path
})
</script>
