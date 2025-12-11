<template>
  <div id="directory-app">
    <div class="filter-bar">
      <div class="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label class="filter-label">Category</label>
            <select
              v-model="currentFilters.category"
              @change="applyFilters"
              class="filter-select"
            >
              <option v-for="cat in categories" :key="cat" :value="cat">
                {{ cat }}
              </option>
            </select>
          </div>

          <div>
            <label class="filter-label">Domain Rating</label>
            <select
              v-model="currentFilters.drRange"
              @change="applyFilters"
              class="filter-select"
            >
              <option value="All">All DR</option>
              <option value="80+">80+</option>
              <option value="70-79">70-79</option>
              <option value="60-69">60-69</option>
              <option value="<60">&lt;60</option>
            </select>
          </div>

          <div>
            <label class="filter-label">Link Type</label>
            <select
              v-model="currentFilters.linkType"
              @change="applyFilters"
              class="filter-select"
            >
              <option value="All">All</option>
              <option value="Dofollow Only">Dofollow Only</option>
            </select>
          </div>

          <div>
            <label class="filter-label">Pricing</label>
            <select
              v-model="currentFilters.pricing"
              @change="applyFilters"
              class="filter-select"
            >
              <option value="All">All</option>
              <option value="free">Free</option>
              <option value="paid">Paid</option>
              <option value="freemium">Freemium</option>
            </select>
          </div>

          <div>
            <label class="filter-label">Sort By</label>
            <select
              v-model="currentFilters.sortBy"
              @change="applyFilters"
              class="filter-select"
            >
              <option>Most Helpful</option>
              <option>Highest DR</option>
              <option>Newest</option>
              <option>Alphabetical</option>
            </select>
          </div>
        </div>

        <div
          v-if="hasActiveFilters"
          class="mt-4 flex items-center justify-between"
        >
          <div class="filter-count">
            Showing
            <span class="font-semibold">{{ filteredData.length }}</span>
            directories
          </div>

          <button
            @click="resetAllFilters"
            class="filter-clear-btn"
          >
            Clear all filters
          </button>
        </div>
      </div>
    </div>

    <div class="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div v-if="isLoading" class="text-center py-12">
        <div class="loading-text">Loading directories...</div>
      </div>

      <div v-else-if="filteredData.length === 0" class="text-center py-12">
        <div class="empty-text">
          No directories found matching your filters.
        </div>
        <button @click="resetAllFilters" class="btn-primary mt-4">
          Reset Filters
        </button>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="dir in filteredData" :key="dir.slug" class="directory-card-simple">
          <div class="flex items-start justify-between mb-3">
            <h3 class="card-title-simple">
              <a
                :href="`/directory/${dir.slug}`"
                class="card-link"
              >
                {{ dir.name }}
              </a>
            </h3>
            <span v-if="dir.domain_rating" class="badge badge-info"
              >DR {{ dir.domain_rating }}</span
            >
          </div>
          <p v-if="dir.description" class="card-description-simple">
            {{
              dir.description.length > 150
                ? dir.description.substring(0, 150) + "..."
                : dir.description
            }}
          </p>
          <div class="flex flex-wrap gap-2 mb-4">
            <span
              v-for="cat in dir.categories"
              :key="cat"
              class="badge badge-neutral"
              >{{ cat }}</span
            >
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="pricing-text">{{ dir.pricing_type || "Free" }}</span>
            <span v-if="dir.is_dofollow" class="dofollow-text">✓ Dofollow</span>
            <span v-else class="nofollow-text">Nofollow</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import httpClient from "@/lib/httpclient.js";

export default {
  name: "DirectoryFilter",
  props: {
    categories: {
      type: Array,
      default: function defaultCategories() {
        return [];
      },
    },
  },
  data: function data() {
    return {
      allData: [],
      filteredData: [],
      isLoading: true,
      currentFilters: {
        search: "",
        category: "All",
        drRange: "All",
        linkType: "All",
        pricing: "All",
        sortBy: "Most Helpful",
      },
    };
  },
  computed: {
    hasActiveFilters: function hasActiveFilters() {
      return (
        this.currentFilters.search ||
        this.currentFilters.category !== "All" ||
        this.currentFilters.drRange !== "All" ||
        this.currentFilters.linkType !== "All" ||
        this.currentFilters.pricing !== "All"
      );
    },
  },
  mounted: function mounted() {
    this.loadDirectories();
    this.setupSearchListener();
  },
  methods: {
    loadDirectories: async function loadDirectories() {
      var self = this;
      try {
        var response = await httpClient.get("/data/directories.json");
        self.allData = await response.json();
        self.filteredData = [].concat(self.allData);
        self.isLoading = false;
        self.applyFilters();
      } catch (error) {
        console.error("Failed to load directories:", error);
        self.isLoading = false;
      }
    },
    setupSearchListener: function setupSearchListener() {
      var self = this;
      var searchInput = document.getElementById("search-input");
      if (searchInput) {
        searchInput.addEventListener("input", function handleSearchInput(e) {
          self.currentFilters.search = e.target.value;
          self.applyFilters();
        });
      }
    },
    applyFilters: function applyFilters() {
      var self = this;
      var filtered = [].concat(self.allData);

      if (self.currentFilters.search) {
        var searchLower = self.currentFilters.search.toLowerCase();
        filtered = filtered.filter(function filterBySearch(dir) {
          return (
            dir.name.toLowerCase().includes(searchLower) ||
            (dir.description &&
              dir.description.toLowerCase().includes(searchLower)) ||
            (dir.categories &&
              dir.categories.some(function checkCategory(cat) {
                return cat.toLowerCase().includes(searchLower);
              }))
          );
        });
      }

      if (self.currentFilters.category !== "All") {
        filtered = filtered.filter(function filterByCategory(dir) {
          return (
            dir.categories &&
            dir.categories.includes(self.currentFilters.category)
          );
        });
      }

      if (self.currentFilters.drRange !== "All") {
        filtered = filtered.filter(function filterByDR(dir) {
          if (!dir.domain_rating) return false;
          var dr = dir.domain_rating;
          switch (self.currentFilters.drRange) {
            case "80+":
              return dr >= 80;
            case "70-79":
              return dr >= 70 && dr < 80;
            case "60-69":
              return dr >= 60 && dr < 70;
            case "<60":
              return dr < 60;
            default:
              return true;
          }
        });
      }

      if (self.currentFilters.linkType === "Dofollow Only") {
        filtered = filtered.filter(function filterByLinkType(dir) {
          return dir.is_dofollow === true;
        });
      }

      if (self.currentFilters.pricing !== "All") {
        filtered = filtered.filter(function filterByPricing(dir) {
          return (
            dir.pricing_type &&
            dir.pricing_type.toLowerCase() === self.currentFilters.pricing
          );
        });
      }

      filtered = self.sortDirectories(filtered, self.currentFilters.sortBy);
      self.filteredData = filtered;
    },
    sortDirectories: function sortDirectories(dirs, sortBy) {
      var sorted = [].concat(dirs);
      switch (sortBy) {
        case "Most Helpful":
          return sorted.sort(function sortByHelpful(a, b) {
            return (b.helpful_count || 0) - (a.helpful_count || 0);
          });
        case "Highest DR":
          return sorted.sort(function sortByDR(a, b) {
            if (!a.domain_rating && !b.domain_rating) return 0;
            if (!a.domain_rating) return 1;
            if (!b.domain_rating) return -1;
            return b.domain_rating - a.domain_rating;
          });
        case "Newest":
          return sorted.sort(function sortByDate(a, b) {
            return (
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
            );
          });
        case "Alphabetical":
          return sorted.sort(function sortAlphabetically(a, b) {
            return a.name.localeCompare(b.name);
          });
        default:
          return sorted;
      }
    },
    resetAllFilters: function resetAllFilters() {
      var self = this;
      var searchInput = document.getElementById("search-input");
      if (searchInput) searchInput.value = "";

      self.currentFilters = {
        search: "",
        category: "All",
        drRange: "All",
        linkType: "All",
        pricing: "All",
        sortBy: "Most Helpful",
      };
      self.applyFilters();
    },
  },
};
</script>

<style scoped>
/* Filter Bar */
.filter-bar {
  background-color: var(--color-bg-primary);
  border-bottom: 1px solid var(--color-border-primary);
  position: sticky;
  top: 4rem;
  z-index: var(--z-sticky);
  box-shadow: var(--shadow-sm);
}

.filter-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  margin-bottom: 0.25rem;
}

.filter-select {
  width: 100%;
  padding: 0.5rem 2.5rem 0.5rem 0.75rem;
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-lg);
  font-size: 0.875rem;
  color: var(--color-text-primary);
  min-height: 44px;
  cursor: pointer;
  transition: border-color var(--duration-fast) var(--ease-default),
              box-shadow var(--duration-fast) var(--ease-default);
  -webkit-appearance: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%2371717A' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
}

.filter-select:focus {
  outline: none;
  border-color: var(--color-border-focus);
  box-shadow: 0 0 0 3px var(--color-brand-primary-alpha);
}

.filter-select option {
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
}

.filter-count {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.filter-clear-btn {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-brand-primary);
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  margin: -0.5rem;
  border-radius: var(--radius-md);
  transition: color var(--duration-fast) var(--ease-default),
              background-color var(--duration-fast) var(--ease-default);
}

.filter-clear-btn:hover {
  color: var(--color-brand-primary-hover);
  background-color: var(--color-brand-primary-alpha);
}

.filter-clear-btn:focus-visible {
  outline: var(--ring-width) solid var(--ring-color);
  outline-offset: var(--ring-offset);
}

/* Loading & Empty States */
.loading-text {
  color: var(--color-text-secondary);
}

.empty-text {
  color: var(--color-text-secondary);
  margin-bottom: 1rem;
}

/* Simple Directory Card (for this view) */
.directory-card-simple {
  background-color: var(--color-bg-primary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border-primary);
  box-shadow: var(--shadow-sm);
  padding: 1.5rem;
  transition: box-shadow var(--duration-fast) var(--ease-default),
              border-color var(--duration-fast) var(--ease-default),
              transform var(--duration-fast) var(--ease-default);
}

.directory-card-simple:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--color-brand-primary);
}

@media (hover: hover) {
  .directory-card-simple:hover {
    transform: translateY(-2px);
  }
}

.card-title-simple {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.card-link {
  color: inherit;
  text-decoration: none;
  transition: color var(--duration-fast) var(--ease-default);
}

.card-link:hover {
  color: var(--color-brand-primary);
}

.card-description-simple {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin-bottom: 1rem;
  line-height: 1.5;
}

.pricing-text {
  color: var(--color-text-secondary);
}

.dofollow-text {
  color: var(--color-success);
  font-weight: 500;
}

.nofollow-text {
  color: var(--color-text-tertiary);
}
</style>
