<template>
  <div id="directory-app">
    <div class="bg-white border-b border-gray-200 sticky top-16 z-40 shadow-sm">
      <div class="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Category</label
            >
            <select
              v-model="currentFilters.category"
              @change="applyFilters"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            >
              <option v-for="cat in categories" :key="cat" :value="cat">
                {{ cat }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Domain Rating</label
            >
            <select
              v-model="currentFilters.drRange"
              @change="applyFilters"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            >
              <option value="All">All DR</option>
              <option value="80+">80+</option>
              <option value="70-79">70-79</option>
              <option value="60-69">60-69</option>
              <option value="<60">&lt;60</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Link Type</label
            >
            <select
              v-model="currentFilters.linkType"
              @change="applyFilters"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            >
              <option value="All">All</option>
              <option value="Dofollow Only">Dofollow Only</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Pricing</label
            >
            <select
              v-model="currentFilters.pricing"
              @change="applyFilters"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            >
              <option value="All">All</option>
              <option value="free">Free</option>
              <option value="paid">Paid</option>
              <option value="freemium">Freemium</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Sort By</label
            >
            <select
              v-model="currentFilters.sortBy"
              @change="applyFilters"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
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
          <div class="text-sm text-gray-600">
            Showing
            <span class="font-semibold">{{ filteredData.length }}</span>
            directories
            <span v-if="pendingSubmissions.length > 0" class="text-yellow-700">
              ({{ pendingSubmissions.length }} pending)
            </span>
          </div>

          <button
            @click="resetAllFilters"
            class="text-sm text-primary hover:text-primary-dark font-medium"
          >
            Clear all filters
          </button>
        </div>
      </div>
    </div>

    <div class="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div v-if="isLoading" class="text-center py-12">
        <div class="text-gray-600">Loading directories...</div>
      </div>

      <div v-else-if="filteredData.length === 0 && pendingSubmissions.length === 0" class="text-center py-12">
        <div class="text-gray-600 mb-4">
          No directories found matching your filters.
        </div>
        <button @click="resetAllFilters" class="btn-primary">
          Reset Filters
        </button>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Pending Submissions (shown first, only visible to user) -->
        <DirectoryCard
          v-for="pending in filteredPendingSubmissions"
          :key="'pending-' + pending.id"
          :directory="convertPendingToDirectory(pending)"
          :isPendingSubmission="true"
          :userVotedIds="userVotedIds"
          :userFavoriteIds="userFavoriteIds"
        />

        <!-- Regular Directories -->
        <DirectoryCard
          v-for="dir in filteredData"
          :key="dir.id"
          :directory="dir"
          :userVotedIds="userVotedIds"
          :userFavoriteIds="userFavoriteIds"
        />
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
  { immediate: false }
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
      `Loaded ${pendingSubmissions.value.length} pending submissions, ${userFavoriteIds.value.length} favorites, ${userVotedIds.value.length} votes`
    );
  } catch (error) {
    log.error("Failed to load user data:", error);
  }
}

function convertPendingToDirectory(pending) {
  return {
    id: pending.id,
    slug: pending.url, // Use URL as temporary slug
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
      (dir.description && dir.description.toLowerCase().includes(searchLower)) ||
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
      return sorted.sort((a, b) => (b.helpful_count || 0) - (a.helpful_count || 0));
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

function resetAllFilters() {
  const searchInput = document.getElementById("search-input");
  if (searchInput) searchInput.value = "";

  currentFilters.value = {
    search: "",
    category: "All",
    drRange: "All",
    linkType: "All",
    pricing: "All",
    sortBy: "Most Helpful",
  };
  applyFilters();
}
</script>
