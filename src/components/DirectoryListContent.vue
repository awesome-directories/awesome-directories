<template>
  <div id="directory-app">
    <!-- Error State -->
    <div
      v-if="error"
      class="max-w-8xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8"
      role="alert"
      aria-live="assertive"
    >
      <div
        class="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6 text-center"
      >
        <div class="text-red-600 mb-4">
          <svg
            class="w-12 h-12 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 class="text-lg font-semibold text-gray-900 mb-2">
          Failed to Load Directories
        </h2>
        <p class="text-gray-600 mb-4">{{ error }}</p>
        <button
          @click="retryLoad"
          class="btn-primary min-h-[44px] px-6 touch-manipulation"
        >
          Try Again
        </button>
      </div>
    </div>

    <!-- Main Content with Sidebar Layout -->
    <div v-else class="directory-layout">
      <!-- Mobile Filter Button & Search Bar -->
      <div
        class="lg:hidden sticky top-0 sm:top-16 z-40 bg-white border-b border-gray-200 shadow-sm"
      >
        <div class="px-3 sm:px-4 py-3">
          <!-- Search Bar -->
          <div class="mb-3">
            <label for="mobile-search" class="sr-only">Search directories</label>
            <div class="relative w-full">
              <div
                class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
              >
                <svg
                  class="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                id="mobile-search"
                v-model="searchQuery"
                type="search"
                placeholder="Search directories..."
                class="search-input w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg text-base bg-white min-h-[48px] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent transition-all"
              />
              <button
                v-if="searchQuery"
                @click="clearSearch"
                class="absolute inset-y-0 right-0 w-12 flex items-center justify-center rounded-r-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-colors z-10"
                aria-label="Clear search"
              >
                <svg
                  class="h-5 w-5 text-gray-400 hover:text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          <!-- Filter Button & Result Count -->
          <div class="flex items-center justify-between gap-3">
            <button
              @click="openMobileFilters"
              class="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[44px]"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              <span>Filters</span>
              <span
                v-if="activeFilterCount > 0"
                class="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-primary rounded-full"
              >
                {{ activeFilterCount }}
              </span>
            </button>

            <span class="text-sm text-gray-600">
              <span class="font-semibold text-gray-900">{{
                visibleDirectories.length.toLocaleString()
              }}</span>
              results
            </span>
          </div>

          <!-- Active Filter Chips (Mobile) -->
          <div
            v-if="activeFilterChips.length > 0"
            class="mt-3 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide"
          >
            <button
              v-for="chip in activeFilterChips"
              :key="chip.key"
              @click="removeFilter(chip.key)"
              class="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-primary/10 text-primary text-xs font-medium rounded-full hover:bg-primary/20 transition-colors flex-shrink-0"
            >
              <span>{{ chip.label }}</span>
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Desktop Sidebar + Content Grid -->
      <div class="directory-grid">
        <!-- Sidebar (Desktop) -->
        <FilterSidebar
          :filters="currentFilters"
          :categories="categories"
          :resultCount="visibleDirectories.length"
          :isMobile="false"
          @update:filters="handleFilterUpdate"
          @reset="resetToDefault"
          @applyPreset="applyQuickFilter"
          class="hidden lg:block"
        />

        <!-- Main Content Area -->
        <div class="directory-content">
          <!-- Desktop Search & Results Header -->
          <div class="hidden lg:block sticky top-16 z-30 bg-gray-50 border-b border-gray-200">
            <div class="px-6 py-4">
              <!-- Search Bar -->
              <div class="mb-4">
                <label for="desktop-search" class="sr-only">Search directories</label>
                <div class="relative max-w-xl">
                  <div
                    class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                  >
                    <svg
                      class="h-5 w-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <input
                    id="desktop-search"
                    v-model="searchQuery"
                    type="search"
                    placeholder="Search directories by name, description, or category..."
                    class="search-input w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-lg text-sm bg-white min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent transition-all"
                  />
                  <button
                    v-if="searchQuery"
                    @click="clearSearch"
                    class="absolute inset-y-0 right-0 w-10 flex items-center justify-center rounded-r-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-colors"
                    aria-label="Clear search"
                  >
                    <svg
                      class="h-5 w-5 text-gray-400 hover:text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Results Summary & Active Chips -->
              <div class="flex items-center justify-between gap-4">
                <div class="flex items-center gap-3 flex-wrap">
                  <span class="text-sm text-gray-700">
                    <span class="font-semibold text-gray-900">{{
                      visibleDirectories.length.toLocaleString()
                    }}</span>
                    <template v-if="isDefaultState">
                      {{ resultsLabel }}
                    </template>
                    <template v-else-if="hasActiveFilters">
                      of {{ totalDirectoriesCount.toLocaleString() }} directories
                    </template>
                    <template v-else>
                      {{ visibleDirectories.length === 1 ? "directory" : "directories" }}
                    </template>
                  </span>

                  <!-- Active Filter Chips (Desktop) -->
                  <div
                    v-if="activeFilterChips.length > 0"
                    class="flex items-center gap-2 flex-wrap"
                  >
                    <button
                      v-for="chip in activeFilterChips"
                      :key="chip.key"
                      @click="removeFilter(chip.key)"
                      class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full hover:bg-primary/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      <span>{{ chip.label }}</span>
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                <!-- Pending Submissions Badge -->
                <span
                  v-if="pendingSubmissions.length > 0"
                  class="text-xs text-yellow-800 bg-yellow-50 px-2 py-1 rounded-full"
                >
                  {{ pendingSubmissions.length }} pending
                </span>
              </div>
            </div>
          </div>

          <!-- Directory Grid -->
          <div class="p-4 sm:p-6">
            <!-- Loading Skeleton -->
            <div v-if="isLoading" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
              <div v-for="i in 6" :key="i" class="animate-pulse">
                <div class="bg-white rounded-xl border border-gray-200 p-5">
                  <div class="flex items-start gap-4">
                    <div class="w-14 h-14 bg-gray-200 rounded-xl"></div>
                    <div class="flex-1">
                      <div class="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div class="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div class="mt-4 h-12 bg-gray-200 rounded"></div>
                  <div class="mt-4 grid grid-cols-3 gap-2">
                    <div class="h-16 bg-gray-200 rounded"></div>
                    <div class="h-16 bg-gray-200 rounded"></div>
                    <div class="h-16 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div
              v-else-if="visibleDirectories.length === 0"
              class="text-center py-12 px-4"
            >
              <div class="mb-4">
                <svg
                  class="w-16 h-16 mx-auto text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              <h2 class="text-xl font-semibold text-gray-900 mb-2">
                <template v-if="currentFilters.search">
                  No results for "{{ currentFilters.search }}"
                </template>
                <template v-else>No directories match your filters</template>
              </h2>

              <p class="text-gray-600 mb-6 max-w-md mx-auto">
                Try adjusting your filters or search query to find more directories.
              </p>

              <div class="space-y-3 max-w-xs mx-auto">
                <button
                  v-if="currentFilters.search && searchOnlyResultsCount > 0"
                  @click="searchAllDirectories"
                  class="w-full btn-primary min-h-[44px]"
                >
                  Search all directories ({{ searchOnlyResultsCount }} results)
                </button>
                <button
                  @click="resetToDefault"
                  class="w-full px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors min-h-[44px]"
                >
                  Reset all filters
                </button>
              </div>
            </div>

            <!-- Directory Cards Grid -->
            <div
              v-else
              class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5"
            >
              <DirectoryCard
                v-for="dir in visibleDirectories.slice(0, itemsToShow)"
                :key="dir.id"
                :directory="dir"
                :isPendingSubmission="dir.isPending"
                :userFavoriteIds="userFavoriteIds"
              />
            </div>

            <!-- Load More Button -->
            <div
              v-if="visibleDirectories.length > itemsToShow"
              class="mt-8 text-center"
            >
              <button
                @click="loadMore"
                class="btn-primary min-h-[44px] w-full sm:w-auto px-8"
              >
                Load More
                <span class="ml-2 opacity-80">
                  ({{ (visibleDirectories.length - itemsToShow).toLocaleString() }} remaining)
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Mobile Filter Drawer -->
      <Teleport to="body">
        <Transition name="drawer">
          <div
            v-if="mobileFiltersOpen"
            class="fixed inset-0 z-50 lg:hidden"
          >
            <!-- Backdrop -->
            <div
              class="absolute inset-0 bg-black/50 backdrop-blur-sm"
              @click="closeMobileFilters"
            ></div>

            <!-- Drawer -->
            <FilterSidebar
              :filters="currentFilters"
              :categories="categories"
              :resultCount="visibleDirectories.length"
              :isMobile="true"
              :isMobileOpen="mobileFiltersOpen"
              @update:filters="handleFilterUpdate"
              @reset="resetToDefault"
              @applyPreset="applyQuickFilter"
              @close="closeMobileFilters"
            />
          </div>
        </Transition>
      </Teleport>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useStore } from "@nanostores/vue";
import { $user } from "@/stores/auth";
import { useDirectory } from "@/composables/useDirectory";
import { supabase } from "@/lib/supabase-client";
import httpClient from "@/lib/httpclient.js";
import DirectoryCard from "./DirectoryCard.vue";
import FilterSidebar from "./FilterSidebar.vue";
import log from "@/lib/logger.js";

const props = defineProps({
  categories: {
    type: Array,
    default: () => [],
  },
});

const user = useStore($user);
const { getUserFavoriteIds } = useDirectory();

const allData = ref([]);
const filteredData = ref([]);
const pendingSubmissions = ref([]);
const isLoading = ref(true);
const userFavoriteIds = ref([]);
const mobileFiltersOpen = ref(false);

// Default filters: DR 70+ for instant value
const DEFAULT_FILTERS = {
  search: "",
  category: "All",
  drRange: "70+",
  linkType: "All",
  pricing: "All",
  sortBy: "Highest Rated",
};

const currentFilters = ref({ ...DEFAULT_FILTERS });
const itemsToShow = ref(30);

// Search input state with debounce
const searchQuery = ref("");
let searchDebounceTimer = null;

watch(searchQuery, (newValue) => {
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer);
  }
  searchDebounceTimer = setTimeout(() => {
    currentFilters.value.search = newValue;
    applyFilters();
  }, 300);
});

// Computed properties
const hasActiveFilters = computed(() => {
  return (
    currentFilters.value.search ||
    currentFilters.value.category !== "All" ||
    currentFilters.value.drRange !== "All" ||
    currentFilters.value.linkType !== "All" ||
    currentFilters.value.pricing !== "All"
  );
});

const activeFilterCount = computed(() => {
  let count = 0;
  if (currentFilters.value.search) count++;
  if (currentFilters.value.category !== "All") count++;
  if (currentFilters.value.drRange !== "All") count++;
  if (currentFilters.value.linkType !== "All") count++;
  if (currentFilters.value.pricing !== "All") count++;
  return count;
});

const activeFilterChips = computed(() => {
  const chips = [];

  if (currentFilters.value.search) {
    chips.push({
      key: "search",
      label: `"${currentFilters.value.search}"`,
      type: "Search",
    });
  }

  if (currentFilters.value.category !== "All") {
    chips.push({
      key: "category",
      label: currentFilters.value.category,
      type: "Category",
    });
  }

  if (currentFilters.value.drRange !== "All") {
    chips.push({
      key: "drRange",
      label: `DR ${currentFilters.value.drRange}`,
      type: "Domain Rating",
    });
  }

  if (currentFilters.value.linkType !== "All") {
    chips.push({
      key: "linkType",
      label: "DoFollow",
      type: "Link Type",
    });
  }

  if (currentFilters.value.pricing !== "All") {
    const pricingLabel =
      currentFilters.value.pricing.charAt(0).toUpperCase() +
      currentFilters.value.pricing.slice(1);
    chips.push({
      key: "pricing",
      label: pricingLabel,
      type: "Pricing",
    });
  }

  return chips;
});

const totalDirectoriesCount = computed(() => allData.value.length);

const searchOnlyResultsCount = computed(() => {
  if (!currentFilters.value.search) return 0;
  const searchLower = currentFilters.value.search.toLowerCase();
  return allData.value.filter((dir) => {
    return (
      dir.name.toLowerCase().includes(searchLower) ||
      (dir.description && dir.description.toLowerCase().includes(searchLower)) ||
      (dir.categories &&
        dir.categories.some((cat) => cat.toLowerCase().includes(searchLower)))
    );
  }).length;
});

const isDefaultState = computed(() => {
  return (
    currentFilters.value.search === DEFAULT_FILTERS.search &&
    currentFilters.value.category === DEFAULT_FILTERS.category &&
    currentFilters.value.drRange === DEFAULT_FILTERS.drRange &&
    currentFilters.value.linkType === DEFAULT_FILTERS.linkType &&
    currentFilters.value.pricing === DEFAULT_FILTERS.pricing &&
    currentFilters.value.sortBy === DEFAULT_FILTERS.sortBy
  );
});

const resultsLabel = computed(() => {
  if (isDefaultState.value) {
    return "premium directories (DR 70+)";
  }
  return visibleDirectories.value.length === 1 ? "directory" : "directories";
});

const filteredPendingSubmissions = computed(() => {
  return pendingSubmissions.value.filter((pending) => {
    const dir = convertPendingToDirectory(pending);
    return applyFiltersToDirectory(dir);
  });
});

const visibleDirectories = computed(() => {
  const pending = filteredPendingSubmissions.value.map((p) => ({
    ...convertPendingToDirectory(p),
    isPending: true,
  }));
  return [...pending, ...filteredData.value];
});

// Error handling
const error = ref(null);
const retryCount = ref(0);
const maxRetries = 3;

// Lifecycle
onMounted(async () => {
  await loadDirectories();
  await loadUserData();
});

// Methods
async function loadDirectories() {
  try {
    error.value = null;
    const response = await httpClient.get("/data/directories.json");
    allData.value = await response.json();
    filteredData.value = [...allData.value];
    isLoading.value = false;
    applyFilters();
  } catch (err) {
    console.error("Failed to load directories:", err);
    error.value =
      "Unable to load directories. Please check your connection and try again.";
    isLoading.value = false;
  }
}

async function retryLoad() {
  if (retryCount.value < maxRetries) {
    retryCount.value++;
    isLoading.value = true;
    await loadDirectories();
  }
}

async function loadUserData() {
  if (!user.value) return;

  try {
    const { data: pending } = await supabase
      .from("pending_directories")
      .select("*")
      .eq("user_id", user.value.id)
      .eq("status", "pending");

    pendingSubmissions.value = pending || [];
    userFavoriteIds.value = await getUserFavoriteIds(user.value);

    log.info(
      `Loaded ${pendingSubmissions.value.length} pending submissions, ${userFavoriteIds.value.length} favorites`
    );
  } catch (err) {
    log.error("Failed to load user data:", err);
  }
}

function convertPendingToDirectory(pending) {
  return {
    id: pending.id,
    slug: pending.id,
    name: pending.name,
    description: pending.description,
    url: pending.url,
    logo_url: pending.logo_url,
    domain_rating: pending.domain_rating,
    is_dofollow: pending.is_dofollow,
    categories: pending.categories || [],
    pricing_type: pending.pricing_type,
    pricing_amount: pending.pricing_amount,
    average_rating: null,
    rating_count: 0,
    review_count: 0,
    view_count: 0,
    created_at: pending.submitted_at,
  };
}

function applyFiltersToDirectory(dir) {
  if (currentFilters.value.search) {
    const searchLower = currentFilters.value.search.toLowerCase();
    const matchesSearch =
      dir.name.toLowerCase().includes(searchLower) ||
      (dir.description && dir.description.toLowerCase().includes(searchLower)) ||
      (dir.categories &&
        dir.categories.some((cat) => cat.toLowerCase().includes(searchLower)));

    if (!matchesSearch) return false;
  }

  if (currentFilters.value.category !== "All") {
    if (
      !dir.categories ||
      !dir.categories.includes(currentFilters.value.category)
    ) {
      return false;
    }
  }

  if (currentFilters.value.drRange !== "All") {
    if (!dir.domain_rating) return false;
    const dr = dir.domain_rating;
    const range = currentFilters.value.drRange;

    if (range === "70+" && dr < 70) return false;
    if (range === "80+" && dr < 80) return false;
    if (range === "70-79" && (dr < 70 || dr >= 80)) return false;
    if (range === "60-69" && (dr < 60 || dr >= 70)) return false;
    if (range === "<60" && dr >= 60) return false;
  }

  if (currentFilters.value.linkType === "Dofollow Only") {
    if (!dir.is_dofollow) return false;
  }

  if (currentFilters.value.pricing !== "All") {
    if (
      !dir.pricing_type ||
      dir.pricing_type.toLowerCase() !== currentFilters.value.pricing
    ) {
      return false;
    }
  }

  return true;
}

function applyFilters() {
  let filtered = allData.value.filter(applyFiltersToDirectory);
  filtered = sortDirectories(filtered, currentFilters.value.sortBy);
  filteredData.value = filtered;
}

function sortDirectories(dirs, sortBy) {
  const sorted = [...dirs];

  switch (sortBy) {
    case "Highest Rated":
      return sorted.sort((a, b) => {
        const ratingA = a.average_rating || 0;
        const ratingB = b.average_rating || 0;
        if (ratingB !== ratingA) return ratingB - ratingA;
        return (b.rating_count || 0) - (a.rating_count || 0);
      });
    case "Highest DR":
      return sorted.sort((a, b) => {
        if (!a.domain_rating && !b.domain_rating) return 0;
        if (!a.domain_rating) return 1;
        if (!b.domain_rating) return -1;
        return b.domain_rating - a.domain_rating;
      });
    case "Newest":
      return sorted.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    case "Alphabetical":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return sorted;
  }
}

function handleFilterUpdate(newFilters) {
  currentFilters.value = newFilters;
  applyFilters();
}

function applyQuickFilter(preset) {
  currentFilters.value = {
    search: "",
    ...preset.filters,
  };
  searchQuery.value = "";
  applyFilters();
  itemsToShow.value = 30;
}

function removeFilter(filterKey) {
  if (filterKey === "search") {
    currentFilters.value.search = "";
    searchQuery.value = "";
  } else if (filterKey === "category") {
    currentFilters.value.category = "All";
  } else if (filterKey === "drRange") {
    currentFilters.value.drRange = "All";
  } else if (filterKey === "linkType") {
    currentFilters.value.linkType = "All";
  } else if (filterKey === "pricing") {
    currentFilters.value.pricing = "All";
  }
  applyFilters();
}

function searchAllDirectories() {
  currentFilters.value.category = "All";
  currentFilters.value.drRange = "All";
  currentFilters.value.linkType = "All";
  currentFilters.value.pricing = "All";
  applyFilters();
}

function resetToDefault() {
  currentFilters.value = { ...DEFAULT_FILTERS };
  searchQuery.value = "";
  itemsToShow.value = 30;
  applyFilters();
}

function clearSearch() {
  searchQuery.value = "";
  currentFilters.value.search = "";
  applyFilters();
}

function loadMore() {
  itemsToShow.value += 30;
}

function openMobileFilters() {
  mobileFiltersOpen.value = true;
  document.body.style.overflow = "hidden";
}

function closeMobileFilters() {
  mobileFiltersOpen.value = false;
  document.body.style.overflow = "";
}
</script>

<style scoped>
@reference "../style.css";

.directory-layout {
  @apply min-h-screen bg-gray-50;
}

.directory-grid {
  @apply lg:grid lg:grid-cols-[280px_1fr];
}

.directory-content {
  @apply min-h-screen;
}

/* Search input styling */
.search-input {
  outline: none;
  transition: box-shadow 0.2s ease-in-out, border-color 0.2s ease-in-out;
}

.search-input:focus {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  border-color: #3b82f6;
}

.search-input::-webkit-search-cancel-button {
  -webkit-appearance: none;
  appearance: none;
}

/* Scrollbar hide utility */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Drawer transition */
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.3s ease;
}

.drawer-enter-active .filter-sidebar,
.drawer-leave-active .filter-sidebar {
  transition: transform 0.3s ease;
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}

.drawer-enter-from .filter-sidebar,
.drawer-leave-to .filter-sidebar {
  transform: translateX(-100%);
}

/* Loading animation */
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .drawer-enter-active,
  .drawer-leave-active,
  .drawer-enter-active .filter-sidebar,
  .drawer-leave-active .filter-sidebar {
    transition: none;
  }
}
</style>
