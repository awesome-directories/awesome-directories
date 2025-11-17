<template>
  <div>
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-4">
      <div
        class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"
      ></div>
      <p class="text-gray-600 mt-2 text-sm">Loading GitHub stats...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-4">
      <p class="text-red-600 text-sm">{{ error }}</p>
      <button
        @click="fetchStats"
        class="btn-secondary text-sm mt-2"
      >
        Retry
      </button>
    </div>

    <!-- Stats Display -->
    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div>
        <div class="text-2xl font-bold text-primary mb-1">
          {{ stats.stars?.toLocaleString() || 0 }}
        </div>
        <div class="text-gray-600">⭐ Stars</div>
      </div>
      <div>
        <div class="text-2xl font-bold text-primary mb-1">
          {{ stats.forks?.toLocaleString() || 0 }}
        </div>
        <div class="text-gray-600">🍴 Forks</div>
      </div>
      <div>
        <div class="text-2xl font-bold text-primary mb-1">
          {{ stats.watchers?.toLocaleString() || 0 }}
        </div>
        <div class="text-gray-600">👁️ Watchers</div>
      </div>
    </div>

    <!-- Repository Link -->
    <div v-if="!loading && !error" class="mt-6 pt-6 border-t border-gray-100">
      <a
        href="https://github.com/awesome-directories/awesome-directories"
        target="_blank"
        rel="noopener noreferrer"
        class="text-primary hover:text-primary-dark font-medium inline-flex items-center"
      >
        View on GitHub
        <svg
          class="w-4 h-4 ml-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
          />
        </svg>
      </a>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const props = defineProps({
  repo: {
    type: String,
    default: "awesome-directories/awesome-directories",
  },
});

const stats = ref({
  stars: 0,
  forks: 0,
  watchers: 0,
});
const loading = ref(true);
const error = ref("");

onMounted(() => {
  fetchStats();
});

const fetchStats = async () => {
  loading.value = true;
  error.value = "";

  try {
    const response = await fetch(`https://api.github.com/repos/${props.repo}`);

    if (!response.ok) {
      throw new Error(`GitHub API returned ${response.status}`);
    }

    const data = await response.json();

    stats.value = {
      stars: data.stargazers_count,
      forks: data.forks_count,
      watchers: data.subscribers_count,
    };

    // Track stats view in analytics
    if (window.pirsch) {
      window.pirsch("GitHub Stats Loaded");
    }
  } catch (err) {
    console.error("Error fetching GitHub stats:", err);
    error.value = "Failed to load GitHub stats";
  } finally {
    loading.value = false;
  }
};
</script>
