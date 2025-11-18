<template>
  <div id="directory-app">
    <div class="bg-white border-b border-gray-200 sticky top-0 sm:top-16 z-40 shadow-sm">
      <div class="max-w-8xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4">

        <div class="flex items-center justify-between mb-3 lg:hidden">
          <h2 class="text-sm font-semibold text-gray-900">Filters</h2>
          <button
            @click="toggleFilters"
            class="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-dark min-h-[44px] px-3"
            aria-label="Toggle filters"
          >
            <span>{{ filtersExpanded ? 'Hide' : 'Show' }}</span>
            <svg
              class="w-4 h-4 transition-transform duration-200"
              :class="{ 'rotate-180': filtersExpanded }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>

        <div
          class="transition-all duration-300 ease-in-out overflow-hidden"
          :class="{
            'max-h-0 lg:max-h-none': !filtersExpanded,
            'max-h-[800px]': filtersExpanded
          }"
        >
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
            <div>
              <label
                for="filter-category"
                class="block text-xs sm:text-sm font-medium text-gray-900 mb-1.5"
              >
                Category
              </label>
              <select
                id="filter-category"
                v-model="currentFilters.category"
                @change="applyFilters"
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm min-h-[44px] bg-white"
              >
                <option v-for="cat in categories" :key="cat" :value="cat">
                  {{ cat }}
                </option>
              </select>
            </div>

            <div>
              <label
                for="filter-dr"
                class="block text-xs sm:text-sm font-medium text-gray-900 mb-1.5"
              >
                Domain Rating
              </label>
              <select
                id="filter-dr"
                v-model="currentFilters.drRange"
                @change="applyFilters"
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm min-h-[44px] bg-white"
              >
                <option value="All">All DR</option>
                <option value="80+">80+</option>
                <option value="70-79">70-79</option>
                <option value="60-69">60-69</option>
                <option value="<60">&lt;60</option>
              </select>
            </div>

            <div>
              <label
                for="filter-link"
                class="block text-xs sm:text-sm font-medium text-gray-900 mb-1.5"
              >
                Link Type
              </label>
              <select
                id="filter-link"
                v-model="currentFilters.linkType"
                @change="applyFilters"
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm min-h-[44px] bg-white"
              >
                <option value="All">All</option>
                <option value="Dofollow Only">Dofollow Only</option>
              </select>
            </div>

            <div>
              <label
                for="filter-pricing"
                class="block text-xs sm:text-sm font-medium text-gray-900 mb-1.5"
              >
                Pricing
              </label>
              <select
                id="filter-pricing"
                v-model="currentFilters.pricing"
                @change="applyFilters"
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm min-h-[44px] bg-white"
              >
                <option value="All">All</option>
                <option value="free">Free</option>
                <option value="paid">Paid</option>
                <option value="freemium">Freemium</option>
              </select>
            </div>

            <div>
              <label
                for="filter-sort"
                class="block text-xs sm:text-sm font-medium text-gray-900 mb-1.5"
              >
                Sort By
              </label>
              <select
                id="filter-sort"
                v-model="currentFilters.sortBy"
                @change="applyFilters"
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm min-h-[44px] bg-white"
              >
                <option>Most Helpful</option>
                <option>Highest DR</option>
                <option>Newest</option>
                <option>Alphabetical</option>
              </select>
            </div>
          </div>
        </div>

        <div
          v-if="hasActiveFilters"
          class="mt-3 sm:mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-3 border-t border-gray-200"
        >
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-xs sm:text-sm text-gray-900">
              <span class="font-semibold">{{ visibleDirectories.length }}</span>
              {{ visibleDirectories.length === 1 ? 'directory' : 'directories' }}
            </span>
            <span v-if="pendingSubmissions.length > 0" class="text-xs text-yellow-800 bg-yellow-50 px-2 py-1 rounded-full">
              {{ pendingSubmissions.length }} pending
            </span>
          </div>

          <button
            @click="resetAllFilters"
            class="text-xs sm:text-sm text-primary hover:text-primary-dark font-medium whitespace-nowrap min-h-[44px] px-2 flex items-center gap-1"
            aria-label="Clear all filters"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span>Clear filters</span>
          </button>
        </div>
      </div>
    </div>

    <div class="max-w-8xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8">
      <div v-if="isLoading" class="text-center py-12">
        <div class="text-gray-900 text-sm sm:text-base">Loading directories...</div>
      </div>

      <div
        v-else-if="visibleDirectories.length === 0"
        class="text-center py-12 px-4"
      >
        <div class="text-gray-900 mb-4 text-sm sm:text-base">
          No directories found matching your filters.
        </div>
        <button @click="resetAllFilters" class="btn-primary min-h-[44px]">
          Reset Filters
        </button>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
        <DirectoryCard
          v-for="dir in visibleDirectories.slice(0, itemsToShow)"
          :key="dir.id"
          :directory="dir"
          :isPendingSubmission="dir.isPending"
          :userVotedIds="userVotedIds"
          :userFavoriteIds="userFavoriteIds"
        />
      </div>

      <div
        v-if="visibleDirectories.length > itemsToShow"
        class="mt-6 sm:mt-8 text-center"
      >
        <button
          @click="loadMore"
          class="btn-primary min-h-[44px] w-full sm:w-auto px-6"
          aria-label="Load more directories"
        >
          Load More ({{ visibleDirectories.length - itemsToShow }} remaining)
        </button>
      </div>
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
import log from "@/lib/logger";

const props = defineProps({
  categories: {
    type: Array,
    default: () => [],
  },
});

const user = useStore($user);
const { getUserFavoriteIds, getUserVotedIds } = useDirectory();

const allData = ref([]);
const filteredData = ref([]);
const pendingSubmissions = ref([]);
const isLoading = ref(true);
const userFavoriteIds = ref([]);
const userVotedIds = ref([]);

const currentFilters = ref({
  search: "",
  category: "All",
  drRange: "All",
  linkType: "All",
  pricing: "All",
  sortBy: "Most Helpful",
});

const itemsToShow = ref(30);

const hasActiveFilters = computed(() => {
  return (
    currentFilters.value.search ||
    currentFilters.value.category !== "All" ||
    currentFilters.value.drRange !== "All" ||
    currentFilters.value.linkType !== "All" ||
    currentFilters.value.pricing !== "All"
  );
});

const filteredPendingSubmissions = computed(() => {
  return pendingSubmissions.value.filter((pending) => {
    const dir = convertPendingToDirectory(pending);
    return applyFiltersToDirectory(dir);
  });
});

const visibleDirectories = computed(function computeVisibleDirectories() {
  var pending = filteredPendingSubmissions.value.map(function mapPending(p) {
    return { ...convertPendingToDirectory(p), isPending: true };
  });
  return [...pending, ...filteredData.value];
});

onMounted(async () => {
  await loadDirectories();
  await loadUserData();
  setupSearchListener();
});

// Watch for user changes (login/logout)
watch(
  user,
  async (newUser) => {
    if (newUser) {
      await loadUserData();
    } else {
      pendingSubmissions.value = [];
      userFavoriteIds.value = [];
      userVotedIds.value = [];
    }
  },
  { immediate: false },
);

async function loadDirectories() {
  try {
    const response = await httpClient.get("/data/directories.json");
    allData.value = await response.json();
    filteredData.value = [...allData.value];
    isLoading.value = false;
    applyFilters();
  } catch (error) {
    console.error("Failed to load directories:", error);
    isLoading.value = false;
  }
}

async function loadUserData() {
  if (!user.value) return;

  try {
    // Load user's pending submissions
    const { data: pending } = await supabase
      .from("pending_directories")
      .select("*")
      .eq("user_id", user.value.id)
      .eq("status", "pending");

    pendingSubmissions.value = pending || [];

    // Load user's favorites and votes
    userFavoriteIds.value = await getUserFavoriteIds(user.value);
    userVotedIds.value = await getUserVotedIds(user.value);

    log.info(
      `Loaded ${pendingSubmissions.value.length} pending submissions, ${userFavoriteIds.value.length} favorites, ${userVotedIds.value.length} votes`,
    );
  } catch (error) {
    log.error("Failed to load user data:", error);
  }
}

function convertPendingToDirectory(pending) {
  return {
    id: pending.id,
    slug: pending.id, // Use id as a safe, unique slug for pending submissions
    name: pending.name,
    description: pending.description,
    url: pending.url,
    logo_url: pending.logo_url,
    domain_rating: pending.domain_rating,
    is_dofollow: pending.is_dofollow,
    categories: pending.categories || [],
    pricing_type: pending.pricing_type,
    pricing_amount: pending.pricing_amount,
    helpful_count: 0,
    view_count: 0,
    created_at: pending.submitted_at,
  };
}

function setupSearchListener() {
  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      currentFilters.value.search = e.target.value;
      applyFilters();
    });
  }
}

function applyFiltersToDirectory(dir) {
  // Search filter
  if (currentFilters.value.search) {
    const searchLower = currentFilters.value.search.toLowerCase();
    const matchesSearch =
      dir.name.toLowerCase().includes(searchLower) ||
      (dir.description &&
        dir.description.toLowerCase().includes(searchLower)) ||
      (dir.categories &&
        dir.categories.some((cat) => cat.toLowerCase().includes(searchLower)));

    if (!matchesSearch) return false;
  }

  // Category filter
  if (currentFilters.value.category !== "All") {
    if (
      !dir.categories ||
      !dir.categories.includes(currentFilters.value.category)
    ) {
      return false;
    }
  }

  // DR filter
  if (currentFilters.value.drRange !== "All") {
    if (!dir.domain_rating) return false;
    const dr = dir.domain_rating;
    const range = currentFilters.value.drRange;

    if (range === "80+" && dr < 80) return false;
    if (range === "70-79" && (dr < 70 || dr >= 80)) return false;
    if (range === "60-69" && (dr < 60 || dr >= 70)) return false;
    if (range === "<60" && dr >= 60) return false;
  }

  // Link type filter
  if (currentFilters.value.linkType === "Dofollow Only") {
    if (!dir.is_dofollow) return false;
  }

  // Pricing filter
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
    case "Most Helpful":
      return sorted.sort(
        (a, b) => (b.helpful_count || 0) - (a.helpful_count || 0),
      );
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
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
    case "Alphabetical":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return sorted;
  }
}

function loadMore() {
  itemsToShow.value += 30;
}

const filtersExpanded = ref(false);

function toggleFilters() {
  filtersExpanded.value = !filtersExpanded.value;
}

function resetAllFilters() {
  var searchInput = document.getElementById("search-input");
  if (searchInput) searchInput.value = "";

  currentFilters.value = {
    search: "",
    category: "All",
    drRange: "All",
    linkType: "All",
    pricing: "All",
    sortBy: "Most Helpful",
  };
  itemsToShow.value = 30;
  applyFilters();

  if (window.innerWidth < 1024) {
    filtersExpanded.value = false;
  }
}
</script>
