<template>
  <div v-if="loading" class="loading-container">
    <div class="loading-spinner"></div>
    <p class="loading-text">Loading top directories...</p>
  </div>

  <div v-else-if="error" class="error-card">
    <p class="error-text">{{ error }}</p>
  </div>

  <div v-else class="tables-grid">
    <!-- Top by Helpful Votes -->
    <div class="table-card">
      <h3 class="table-title">
        <svg
          class="table-icon table-icon-warning"
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
        Top by Helpful Votes
      </h3>

      <div v-if="stats.topByVotes.length === 0" class="empty-state">
        No data available
      </div>

      <div v-else class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th class="table-header">#</th>
              <th class="table-header">Directory</th>
              <th class="table-header hidden sm:table-cell">DR</th>
              <th class="table-header table-header-right">Votes</th>
            </tr>
          </thead>
          <tbody class="table-body">
            <tr
              v-for="(dir, index) in stats.topByVotes"
              :key="dir.slug"
              class="table-row"
            >
              <td class="table-cell table-cell-muted">
                {{ index + 1 }}
              </td>
              <td class="table-cell">
                <div class="directory-info">
                  <a :href="`/directory/${dir.slug}`" class="directory-link">
                    {{ dir.name }}
                  </a>
                  <div class="category-tags">
                    <span
                      v-for="cat in dir.categories.slice(0, 2)"
                      :key="cat"
                      class="category-tag"
                    >
                      {{ cat }}
                    </span>
                    <span v-if="dir.categories.length > 2" class="category-tag category-tag-more">
                      +{{ dir.categories.length - 2 }}
                    </span>
                  </div>
                </div>
              </td>
              <td class="table-cell hidden sm:table-cell">
                <span
                  v-if="dir.domain_rating"
                  class="dr-badge"
                  :class="getDRBadgeClass(dir.domain_rating)"
                >
                  {{ dir.domain_rating }}
                </span>
                <span v-else class="na-text">N/A</span>
              </td>
              <td class="table-cell table-cell-right">
                <span class="votes-badge">
                  {{ dir.helpful_count }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Top by Domain Rating -->
    <div class="table-card">
      <h3 class="table-title">
        <svg
          class="table-icon table-icon-success"
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
        Top by Domain Rating
      </h3>

      <div v-if="stats.topByDR.length === 0" class="empty-state">
        No data available
      </div>

      <div v-else class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th class="table-header">#</th>
              <th class="table-header">Directory</th>
              <th class="table-header">DR</th>
              <th class="table-header table-header-right hidden sm:table-cell">Votes</th>
            </tr>
          </thead>
          <tbody class="table-body">
            <tr
              v-for="(dir, index) in stats.topByDR"
              :key="dir.slug"
              class="table-row"
            >
              <td class="table-cell table-cell-muted">
                {{ index + 1 }}
              </td>
              <td class="table-cell">
                <div class="directory-info">
                  <a :href="`/directory/${dir.slug}`" class="directory-link">
                    {{ dir.name }}
                  </a>
                  <div class="category-tags">
                    <span
                      v-for="cat in dir.categories.slice(0, 2)"
                      :key="cat"
                      class="category-tag"
                    >
                      {{ cat }}
                    </span>
                    <span v-if="dir.categories.length > 2" class="category-tag category-tag-more">
                      +{{ dir.categories.length - 2 }}
                    </span>
                  </div>
                </div>
              </td>
              <td class="table-cell">
                <span
                  class="dr-badge"
                  :class="getDRBadgeClass(dir.domain_rating)"
                >
                  {{ dir.domain_rating }}
                </span>
              </td>
              <td class="table-cell table-cell-right hidden sm:table-cell">
                <span v-if="dir.helpful_count > 0" class="votes-badge">
                  {{ dir.helpful_count }}
                </span>
                <span v-else class="na-text">0</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const stats = ref({
  topByVotes: [],
  topByDR: [],
});

const loading = ref(true);
const error = ref(null);

function getDRBadgeClass(dr) {
  if (dr >= 80) return "dr-badge-high";
  if (dr >= 60) return "dr-badge-good";
  if (dr >= 40) return "dr-badge-medium";
  return "dr-badge-low";
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
    stats.value = {
      topByVotes: data.topByVotes || [],
      topByDR: data.topByDR || [],
    };
  } catch (err) {
    console.error("Error loading stats:", err);
    error.value = "Failed to load top directories. Please try again later.";
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

/* Tables Grid */
.tables-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 1024px) {
  .tables-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Table Card */
.table-card {
  background-color: var(--color-bg-primary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border-primary);
  box-shadow: var(--shadow-sm);
  padding: 1.5rem;
}

.table-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
}

.table-icon {
  width: 1.25rem;
  height: 1.25rem;
  margin-right: 0.5rem;
}

.table-icon-warning {
  color: var(--color-warning);
}

.table-icon-success {
  color: var(--color-success);
}

.empty-state {
  color: var(--color-text-tertiary);
  text-align: center;
  padding: 2rem 0;
}

/* Table Container */
.table-container {
  overflow-x: auto;
}

.data-table {
  min-width: 100%;
  border-collapse: collapse;
}

/* Table Header */
.table-header {
  padding: 0.5rem 0.75rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid var(--color-border-primary);
}

.table-header-right {
  text-align: right;
}

/* Table Body */
.table-body {
  background-color: var(--color-bg-primary);
}

.table-body tr {
  border-bottom: 1px solid var(--color-border-primary);
}

.table-row {
  transition: background-color var(--duration-fast) var(--ease-default);
}

.table-row:hover {
  background-color: var(--color-bg-tertiary);
}

/* Table Cell */
.table-cell {
  padding: 0.75rem;
  white-space: nowrap;
  font-size: 0.875rem;
}

.table-cell-muted {
  color: var(--color-text-tertiary);
}

.table-cell-right {
  text-align: right;
}

/* Directory Info */
.directory-info {
  display: flex;
  flex-direction: column;
}

.directory-link {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-brand-primary);
  text-decoration: none;
  transition: color var(--duration-fast) var(--ease-default);
}

.directory-link:hover {
  color: var(--color-brand-primary-hover);
}

/* Category Tags */
.category-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-top: 0.25rem;
}

.category-tag {
  display: inline-flex;
  align-items: center;
  padding: 0.125rem 0.5rem;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 500;
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-secondary);
}

.category-tag-more {
  color: var(--color-text-tertiary);
}

/* DR Badge */
.dr-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.125rem 0.625rem;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 500;
}

.dr-badge-high {
  background-color: var(--color-success-bg);
  color: var(--color-success-text);
}

.dr-badge-good {
  background-color: var(--color-success-bg);
  color: var(--color-success);
}

.dr-badge-medium {
  background-color: var(--color-warning-bg);
  color: var(--color-warning-text);
}

.dr-badge-low {
  background-color: var(--color-error-bg);
  color: var(--color-error-text);
}

/* Votes Badge */
.votes-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.125rem 0.625rem;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 500;
  background-color: var(--color-warning-bg);
  color: var(--color-warning-text);
}

.na-text {
  font-size: 0.875rem;
  color: var(--color-text-tertiary);
}
</style>
