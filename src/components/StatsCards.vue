<template>
  <div v-if="loading" class="text-center py-12">
    <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    <p class="mt-4 text-gray-600">Loading statistics...</p>
  </div>

  <div v-else-if="error" class="card p-8 bg-red-50 border-red-200">
    <p class="text-red-700">{{ error }}</p>
  </div>

  <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
    <!-- Total Directories Card -->
    <div class="card p-6 hover:shadow-lg transition-shadow">
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-sm font-medium text-gray-600">Total Directories</h3>
        <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
        </svg>
      </div>
      <p class="text-3xl font-bold text-gray-900">{{ stats.overview.totalDirectories }}</p>
      <p class="text-sm text-gray-500 mt-1">Verified & Active</p>
    </div>

    <!-- Average DR Card -->
    <div class="card p-6 hover:shadow-lg transition-shadow">
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-sm font-medium text-gray-600">Average DR</h3>
        <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
        </svg>
      </div>
      <p class="text-3xl font-bold text-gray-900">{{ stats.overview.averageDR }}</p>
      <div class="mt-2">
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div
            class="h-2 rounded-full transition-all"
            :class="getDRColorClass(stats.overview.averageDR)"
            :style="{ width: stats.overview.averageDR + '%' }"
          ></div>
        </div>
      </div>
    </div>

    <!-- Total Categories Card -->
    <div class="card p-6 hover:shadow-lg transition-shadow">
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-sm font-medium text-gray-600">Categories</h3>
        <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
        </svg>
      </div>
      <p class="text-3xl font-bold text-gray-900">{{ stats.overview.totalCategories }}</p>
      <p class="text-sm text-gray-500 mt-1">Unique Categories</p>
    </div>

    <!-- Free vs Paid Ratio Card -->
    <div class="card p-6 hover:shadow-lg transition-shadow">
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-sm font-medium text-gray-600">Free Directories</h3>
        <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      </div>
      <p class="text-3xl font-bold text-gray-900">{{ freePercentage }}%</p>
      <p class="text-sm text-gray-500 mt-1">{{ stats.overview.freeCount }} of {{ stats.overview.totalDirectories }}</p>
    </div>

    <!-- Total Votes Card -->
    <div class="card p-6 hover:shadow-lg transition-shadow">
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-sm font-medium text-gray-600">Total Helpful Votes</h3>
        <svg class="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"></path>
        </svg>
      </div>
      <p class="text-3xl font-bold text-gray-900">{{ formatNumber(stats.overview.totalVotes) }}</p>
      <p class="text-sm text-gray-500 mt-1">Community Engagement</p>
    </div>

    <!-- Total Views Card -->
    <div class="card p-6 hover:shadow-lg transition-shadow">
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-sm font-medium text-gray-600">Total Views</h3>
        <svg class="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
        </svg>
      </div>
      <p class="text-3xl font-bold text-gray-900">{{ formatNumber(stats.overview.totalViews) }}</p>
      <p class="text-sm text-gray-500 mt-1">Directory Visits</p>
    </div>

    <!-- Dofollow Links Card -->
    <div class="card p-6 hover:shadow-lg transition-shadow">
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-sm font-medium text-gray-600">Dofollow Links</h3>
        <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
        </svg>
      </div>
      <p class="text-3xl font-bold text-gray-900">{{ dofollowPercentage }}%</p>
      <p class="text-sm text-gray-500 mt-1">Pass SEO Value</p>
    </div>

    <!-- Recent Additions Card -->
    <div class="card p-6 hover:shadow-lg transition-shadow">
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-sm font-medium text-gray-600">Added (30d)</h3>
        <svg class="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
        </svg>
      </div>
      <p class="text-3xl font-bold text-gray-900">{{ stats.recentAdditions.last30Days }}</p>
      <p class="text-sm text-gray-500 mt-1">New This Month</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const stats = ref({
  overview: {
    totalDirectories: 0,
    averageDR: 0,
    totalCategories: 0,
    freeCount: 0,
    paidCount: 0,
    freemiumCount: 0,
    totalVotes: 0,
    totalViews: 0,
  },
  linkTypes: {
    dofollow: 0,
    nofollow: 0,
  },
  recentAdditions: {
    last30Days: 0,
    last60Days: 0,
    last90Days: 0,
  },
});

const loading = ref(true);
const error = ref(null);

const freePercentage = computed(() => {
  if (stats.value.overview.totalDirectories === 0) return 0;
  return Math.round((stats.value.overview.freeCount / stats.value.overview.totalDirectories) * 100);
});

const dofollowPercentage = computed(() => {
  const total = stats.value.linkTypes.dofollow + stats.value.linkTypes.nofollow;
  if (total === 0) return 0;
  return Math.round((stats.value.linkTypes.dofollow / total) * 100);
});

function getDRColorClass(dr) {
  if (dr >= 80) return 'bg-green-600';
  if (dr >= 60) return 'bg-green-500';
  if (dr >= 40) return 'bg-yellow-500';
  if (dr >= 20) return 'bg-orange-500';
  return 'bg-red-500';
}

function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
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
    stats.value = data;
  } catch (err) {
    console.error('Error loading stats:', err);
    error.value = 'Failed to load statistics. Please try again later.';
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadStats();
});
</script>
