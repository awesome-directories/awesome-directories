<template>
  <div v-if="loading" class="text-center py-12">
    <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    <p class="mt-4 text-gray-600">Loading top directories...</p>
  </div>

  <div v-else-if="error" class="card p-8 bg-red-50 border-red-200">
    <p class="text-red-700">{{ error }}</p>
  </div>

  <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <!-- Top by Helpful Votes -->
    <div class="card p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <svg class="w-5 h-5 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"></path>
        </svg>
        Top by Helpful Votes
      </h3>

      <div v-if="stats.topByVotes.length === 0" class="text-gray-500 text-center py-8">
        No data available
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
              <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Directory</th>
              <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">DR</th>
              <th class="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Votes</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(dir, index) in stats.topByVotes" :key="dir.slug" class="hover:bg-gray-50 transition-colors">
              <td class="px-3 py-3 whitespace-nowrap text-sm text-gray-500">
                {{ index + 1 }}
              </td>
              <td class="px-3 py-3">
                <div class="flex flex-col">
                  <a
                    :href="`/directory/${dir.slug}`"
                    class="text-sm font-medium text-primary hover:text-primary-dark transition-colors"
                  >
                    {{ dir.name }}
                  </a>
                  <div class="flex flex-wrap gap-1 mt-1">
                    <span
                      v-for="cat in dir.categories.slice(0, 2)"
                      :key="cat"
                      class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700"
                    >
                      {{ cat }}
                    </span>
                    <span
                      v-if="dir.categories.length > 2"
                      class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-500"
                    >
                      +{{ dir.categories.length - 2 }}
                    </span>
                  </div>
                </div>
              </td>
              <td class="px-3 py-3 whitespace-nowrap hidden sm:table-cell">
                <span
                  v-if="dir.domain_rating"
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="getDRBadgeClass(dir.domain_rating)"
                >
                  {{ dir.domain_rating }}
                </span>
                <span v-else class="text-sm text-gray-400">N/A</span>
              </td>
              <td class="px-3 py-3 whitespace-nowrap text-right">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  {{ dir.helpful_count }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Top by Domain Rating -->
    <div class="card p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <svg class="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
        </svg>
        Top by Domain Rating
      </h3>

      <div v-if="stats.topByDR.length === 0" class="text-gray-500 text-center py-8">
        No data available
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
              <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Directory</th>
              <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DR</th>
              <th class="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Votes</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(dir, index) in stats.topByDR" :key="dir.slug" class="hover:bg-gray-50 transition-colors">
              <td class="px-3 py-3 whitespace-nowrap text-sm text-gray-500">
                {{ index + 1 }}
              </td>
              <td class="px-3 py-3">
                <div class="flex flex-col">
                  <a
                    :href="`/directory/${dir.slug}`"
                    class="text-sm font-medium text-primary hover:text-primary-dark transition-colors"
                  >
                    {{ dir.name }}
                  </a>
                  <div class="flex flex-wrap gap-1 mt-1">
                    <span
                      v-for="cat in dir.categories.slice(0, 2)"
                      :key="cat"
                      class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700"
                    >
                      {{ cat }}
                    </span>
                    <span
                      v-if="dir.categories.length > 2"
                      class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-500"
                    >
                      +{{ dir.categories.length - 2 }}
                    </span>
                  </div>
                </div>
              </td>
              <td class="px-3 py-3 whitespace-nowrap">
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="getDRBadgeClass(dir.domain_rating)"
                >
                  {{ dir.domain_rating }}
                </span>
              </td>
              <td class="px-3 py-3 whitespace-nowrap text-right hidden sm:table-cell">
                <span
                  v-if="dir.helpful_count > 0"
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
                >
                  {{ dir.helpful_count }}
                </span>
                <span v-else class="text-sm text-gray-400">0</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const stats = ref({
  topByVotes: [],
  topByDR: []
});

const loading = ref(true);
const error = ref(null);

function getDRBadgeClass(dr) {
  if (dr >= 80) return 'bg-green-100 text-green-800';
  if (dr >= 60) return 'bg-green-100 text-green-700';
  if (dr >= 40) return 'bg-yellow-100 text-yellow-800';
  if (dr >= 20) return 'bg-orange-100 text-orange-800';
  return 'bg-red-100 text-red-800';
}

async function loadStats() {
  try {
    loading.value = true;
    error.value = null;

    const response = await fetch('/data/stats.json');
    if (!response.ok) {
      throw new Error(`Failed to load stats: ${response.statusText}`);
    }

    const data = await response.json();
    stats.value = {
      topByVotes: data.topByVotes || [],
      topByDR: data.topByDR || []
    };
  } catch (err) {
    console.error('Error loading stats:', err);
    error.value = 'Failed to load top directories. Please try again later.';
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadStats();
});
</script>
