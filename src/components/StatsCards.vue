<template>
  <div v-if="loading" class="loading-container">
    <div class="loading-spinner"></div>
    <p class="loading-text">Loading statistics...</p>
  </div>

  <div v-else-if="error" class="error-card">
    <p class="error-text">{{ error }}</p>
  </div>

  <div v-else class="stats-grid">
    <!-- Total Directories Card -->
    <div class="stat-card">
      <div class="stat-header">
        <h3 class="stat-label">Total Directories</h3>
        <svg
          class="stat-icon stat-icon-primary"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          ></path>
        </svg>
      </div>
      <p class="stat-value">
        {{ stats.overview.totalDirectories }}
      </p>
      <p class="stat-description">Verified & Active</p>
    </div>

    <!-- Average DR Card -->
    <div class="stat-card">
      <div class="stat-header">
        <h3 class="stat-label">Average DR</h3>
        <svg
          class="stat-icon stat-icon-success"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
          ></path>
        </svg>
      </div>
      <p class="stat-value">
        {{ stats.overview.averageDR }}
      </p>
      <div class="dr-bar-container">
        <div class="dr-bar-track">
          <div
            class="dr-bar-fill"
            :class="getDRBarClass(stats.overview.averageDR)"
            :style="{ width: stats.overview.averageDR + '%' }"
          ></div>
        </div>
      </div>
    </div>

    <!-- Total Categories Card -->
    <div class="stat-card">
      <div class="stat-header">
        <h3 class="stat-label">Categories</h3>
        <svg
          class="stat-icon stat-icon-secondary"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
          ></path>
        </svg>
      </div>
      <p class="stat-value">
        {{ stats.overview.totalCategories }}
      </p>
      <p class="stat-description">Unique Categories</p>
    </div>

    <!-- Free vs Paid Ratio Card -->
    <div class="stat-card">
      <div class="stat-header">
        <h3 class="stat-label">Free Directories</h3>
        <svg
          class="stat-icon stat-icon-info"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
      </div>
      <p class="stat-value">{{ freePercentage }}%</p>
      <p class="stat-description">
        {{ stats.overview.freeCount }} of {{ stats.overview.totalDirectories }}
      </p>
    </div>

    <!-- Total Votes Card -->
    <div class="stat-card">
      <div class="stat-header">
        <h3 class="stat-label">Total Helpful Votes</h3>
        <svg
          class="stat-icon stat-icon-warning"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
          ></path>
        </svg>
      </div>
      <p class="stat-value">
        {{ formatNumber(stats.overview.totalVotes) }}
      </p>
      <p class="stat-description">Community Engagement</p>
    </div>

    <!-- Total Views Card -->
    <div class="stat-card">
      <div class="stat-header">
        <h3 class="stat-label">Total Views</h3>
        <svg
          class="stat-icon stat-icon-primary"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          ></path>
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          ></path>
        </svg>
      </div>
      <p class="stat-value">
        {{ formatNumber(stats.overview.totalViews) }}
      </p>
      <p class="stat-description">Directory Visits</p>
    </div>

    <!-- Dofollow Links Card -->
    <div class="stat-card">
      <div class="stat-header">
        <h3 class="stat-label">Dofollow Links</h3>
        <svg
          class="stat-icon stat-icon-success"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
          ></path>
        </svg>
      </div>
      <p class="stat-value">{{ dofollowPercentage }}%</p>
      <p class="stat-description">Pass SEO Value</p>
    </div>

    <!-- Recent Additions Card -->
    <div class="stat-card">
      <div class="stat-header">
        <h3 class="stat-label">Added (30d)</h3>
        <svg
          class="stat-icon stat-icon-accent"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          ></path>
        </svg>
      </div>
      <p class="stat-value">
        {{ stats.recentAdditions.last30Days }}
      </p>
      <p class="stat-description">New This Month</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";

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
  return Math.round(
    (stats.value.overview.freeCount / stats.value.overview.totalDirectories) *
      100,
  );
});

const dofollowPercentage = computed(() => {
  const total = stats.value.linkTypes.dofollow + stats.value.linkTypes.nofollow;
  if (total === 0) return 0;
  return Math.round((stats.value.linkTypes.dofollow / total) * 100);
});

function getDRBarClass(dr) {
  if (dr >= 80) return "dr-bar-high";
  if (dr >= 60) return "dr-bar-good";
  if (dr >= 40) return "dr-bar-medium";
  return "dr-bar-low";
}

function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
}

async function loadStats() {
  try {
    loading.value = true;
    error.value = null;

    const response = await fetch("/data/stats.json");
    if (!response.ok) {
      throw new Error(`Failed to load stats: ${response.statusText}`);
    }

    const data = await response.json();
    stats.value = data;
  } catch (err) {
    console.error("Error loading stats:", err);
    error.value = "Failed to load statistics. Please try again later.";
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadStats();
});
</script>

<style scoped>
/* Loading State */
.loading-container {
  text-align: center;
  padding: 3rem 0;
}

.loading-spinner {
  display: inline-block;
  width: 3rem;
  height: 3rem;
  border: 2px solid var(--color-border-primary);
  border-top-color: var(--color-brand-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  margin-top: 1rem;
  color: var(--color-text-secondary);
}

/* Error State */
.error-card {
  background-color: var(--color-error-bg);
  border: 1px solid var(--color-error);
  border-radius: var(--radius-lg);
  padding: 2rem;
}

.error-text {
  color: var(--color-error-text);
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 1.5rem;
}

@media (min-width: 640px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* Stat Card */
.stat-card {
  background-color: var(--color-bg-primary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border-primary);
  box-shadow: var(--shadow-sm);
  padding: 1.5rem;
  transition: box-shadow var(--duration-fast) var(--ease-default);
}

.stat-card:hover {
  box-shadow: var(--shadow-lg);
}

.stat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.stat-icon {
  width: 2rem;
  height: 2rem;
}

.stat-icon-primary {
  color: var(--color-brand-primary);
}

.stat-icon-secondary {
  color: var(--color-brand-secondary);
}

.stat-icon-success {
  color: var(--color-success);
}

.stat-icon-warning {
  color: var(--color-warning);
}

.stat-icon-info {
  color: var(--color-info);
}

.stat-icon-accent {
  color: var(--color-brand-accent);
}

.stat-value {
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1.2;
}

.stat-description {
  font-size: 0.875rem;
  color: var(--color-text-tertiary);
  margin-top: 0.25rem;
}

/* DR Bar */
.dr-bar-container {
  margin-top: 0.5rem;
}

.dr-bar-track {
  width: 100%;
  height: 0.5rem;
  background-color: var(--color-bg-tertiary);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.dr-bar-fill {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width var(--duration-normal) var(--ease-default);
}

.dr-bar-high {
  background-color: var(--color-dr-high);
}

.dr-bar-good {
  background-color: var(--color-dr-good);
}

.dr-bar-medium {
  background-color: var(--color-dr-medium);
}

.dr-bar-low {
  background-color: var(--color-text-tertiary);
}
</style>
