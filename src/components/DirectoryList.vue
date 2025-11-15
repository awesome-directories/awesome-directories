<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Hero Section -->
    <section
      class="bg-gradient-to-br from-primary to-blue-600 text-white py-16 px-4"
    >
      <div class="max-w-8xl mx-auto text-center">
        <h1 class="text-4xl md:text-5xl font-bold mb-4">
          Find the Top Launch Directories for Your SaaS
        </h1>
        <p class="text-xl md:text-2xl mb-4 text-blue-100">
          Curated, verified, and updated weekly
        </p>
        <p class="text-lg text-blue-100 mb-8">
          Stop wasting time on dead links and low-value directories. Get the 20
          that actually drive traffic—in under 3 minutes.
        </p>

        <div
          class="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8"
        >
          <div class="text-center">
            <div class="text-3xl font-bold">{{ totalDirectoriesCount }}+</div>
            <div class="text-sm text-blue-100">Curated Directories</div>
          </div>
          <div class="hidden sm:block text-blue-200">•</div>
          <div class="text-center">
            <div class="text-3xl font-bold">{{ withDRCount }}+</div>
            <div class="text-sm text-blue-100">With DR Ratings</div>
          </div>
          <div class="hidden sm:block text-blue-200">•</div>
          <div class="text-center">
            <div class="text-3xl font-bold">Open Source</div>
            <div class="text-sm text-blue-100">Apache 2.0 License ❤️</div>
          </div>
        </div>

        <!-- Search Bar -->
        <div class="max-w-2xl mx-auto">
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search directories... (e.g., 'Product Hunt', 'reddit', 'dev tools')"
              class="w-full px-6 py-4 pr-12 rounded-lg text-gray-900 placeholder-gray-700 focus:outline-none focus:ring-4 focus:ring-blue-300 text-lg"
            />
            <svg
              class="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400"
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
            <button
              v-if="searchQuery"
              @click="searchQuery = ''"
              class="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Filter Bar -->
    <div class="bg-white border-b border-gray-200 sticky top-16 z-40 shadow-sm">
      <div class="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
          <!-- Category Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Category</label
            >
            <select
              v-model="filters.category"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            >
              <option v-for="cat in categories" :key="cat" :value="cat">
                {{ cat }}
              </option>
            </select>
          </div>

          <!-- Domain Rating Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Domain Rating</label
            >
            <select
              v-model="filters.drRange"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            >
              <option value="All">All DR</option>
              <option value="80+">80+</option>
              <option value="70-79">70-79</option>
              <option value="60-69">60-69</option>
              <option value="<60">&lt;60</option>
            </select>
          </div>

          <!-- Link Type Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Link Type</label
            >
            <select
              v-model="filters.linkType"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            >
              <option value="All">All</option>
              <option value="Dofollow Only">Dofollow Only</option>
            </select>
          </div>

          <!-- Pricing Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Pricing</label
            >
            <select
              v-model="filters.pricing"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            >
              <option value="All">All</option>
              <option value="free">Free</option>
              <option value="paid">Paid</option>
              <option value="freemium">Freemium</option>
            </select>
          </div>

          <!-- Sort -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Sort By</label
            >
            <select
              v-model="sortBy"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            >
              <option>Most Helpful</option>
              <option>Highest DR</option>
              <option>Newest</option>
              <option>Alphabetical</option>
            </select>
          </div>
        </div>

        <!-- Active Filters Info -->
        <div
          v-if="activeFilterCount > 0 || searchQuery"
          class="mt-4 flex items-center justify-between"
        >
          <div class="text-sm text-gray-600">
            Showing
            <span class="font-semibold">{{ filteredDirectories.length }}</span> directories
            <span v-if="activeFilterCount > 0">
              ({{ activeFilterCount }} filter{{
                activeFilterCount > 1 ? "s" : ""
              }}
              active)
            </span>
            <span v-if="searchQuery" class="text-primary">
              matching "{{ searchQuery }}"
            </span>
          </div>

          <button
            v-if="activeFilterCount > 0 || searchQuery"
            @click="clearFilters"
            class="text-sm text-primary hover:text-primary-dark font-medium"
          >
            Clear all filters
          </button>
        </div>

        <!-- Selection Actions -->
        <div
          v-if="selectedDirectories.length > 0"
          class="mt-4 flex items-center justify-between bg-blue-50 px-4 py-3 rounded-lg"
        >
          <div class="text-sm text-gray-700">
            <span class="font-semibold">{{ selectedDirectories.length }}</span>
            director{{ selectedDirectories.length > 1 ? "ies" : "y" }} selected
          </div>

          <div class="flex gap-2">
            <button
              @click="selectAll"
              class="text-sm text-primary hover:text-primary-dark font-medium"
            >
              Select All ({{ filteredDirectories.length }})
            </button>
            <button
              @click="deselectAll"
              class="text-sm text-gray-600 hover:text-gray-900 font-medium"
            >
              Deselect All
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Directory Grid -->
    <div class="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Empty State -->
      <div
        v-if="filteredDirectories.length === 0"
        class="text-center py-12"
      >
        <div class="text-6xl mb-4">🔍</div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">
          No directories found
        </h3>
        <p class="text-gray-600 mb-4">
          <span v-if="searchQuery">No results for "{{ searchQuery }}"</span>
          <span v-else>Try adjusting your filters</span>
        </p>
        <button @click="clearFilters" class="btn-primary">Clear Filters</button>
      </div>

      <!-- Directory Grid -->
      <div v-else>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DirectoryCard
            v-for="directory in filteredDirectories"
            :key="directory.id"
            :directory="directory"
            :selectable="true"
            :is-selected="isDirectorySelected(directory)"
            @toggle-select="toggleDirectorySelection"
            @vote="handleVote"
          />
        </div>
      </div>
    </div>

    <!-- Floating Action Button -->
    <transition name="fade">
      <button
        v-if="selectedDirectories.length > 0"
        @click="showChecklistModalLocal = true"
        class="fixed bottom-6 right-6 bg-primary text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all z-40"
      >
        <div class="relative">
          <svg
            class="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <span
            class="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center"
          >
            {{ selectedDirectories.length }}
          </span>
        </div>
      </button>
    </transition>

    <!-- Checklist Modal -->
    <ChecklistModal
      v-if="showChecklistModalLocal"
      :selected-directories="selectedDirectories"
      @close="showChecklistModalLocal = false"
      @clear-selection="deselectAll"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import DirectoryCard from "./DirectoryCard.vue";
import ChecklistModal from "./ChecklistModal.vue";
import { supabase } from "@/lib/supabase";

const props = defineProps({
  directories: {
    type: Array,
    required: true,
  },
  categories: {
    type: Array,
    required: true,
  },
});

const searchQuery = ref("");
const filters = ref({
  category: "All",
  drRange: "All",
  linkType: "All",
  pricing: "All",
});
const sortBy = ref("Most Helpful");
const selectedDirectories = ref([]);
const showChecklistModalLocal = ref(false);

const totalDirectoriesCount = computed(() => props.directories.length);
const withDRCount = computed(
  () => props.directories.filter((d) => d.domain_rating).length,
);

const activeFilterCount = computed(() => {
  let count = 0;
  if (filters.value.category !== "All") count++;
  if (filters.value.drRange !== "All") count++;
  if (filters.value.linkType !== "All") count++;
  if (filters.value.pricing !== "All") count++;
  return count;
});

// Filter logic
const filterDirectories = (dirs) => {
  let filtered = [...dirs];

  // Category filter
  if (filters.value.category && filters.value.category !== "All") {
    filtered = filtered.filter(
      (dir) => dir.categories && dir.categories.includes(filters.value.category),
    );
  }

  // Domain Rating filter
  if (filters.value.drRange && filters.value.drRange !== "All") {
    filtered = filtered.filter((dir) => {
      if (!dir.domain_rating) return false;

      switch (filters.value.drRange) {
        case "80+":
          return dir.domain_rating >= 80;
        case "70-79":
          return dir.domain_rating >= 70 && dir.domain_rating < 80;
        case "60-69":
          return dir.domain_rating >= 60 && dir.domain_rating < 70;
        case "<60":
          return dir.domain_rating < 60;
        default:
          return true;
      }
    });
  }

  // Link Type filter
  if (filters.value.linkType && filters.value.linkType !== "All") {
    if (filters.value.linkType === "Dofollow Only") {
      filtered = filtered.filter((dir) => dir.is_dofollow === true);
    }
  }

  // Pricing filter
  if (filters.value.pricing && filters.value.pricing !== "All") {
    filtered = filtered.filter((dir) => {
      if (!dir.pricing_type) return false;
      return dir.pricing_type.toLowerCase() === filters.value.pricing.toLowerCase();
    });
  }

  // Search filter
  if (searchQuery.value) {
    const searchLower = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (dir) =>
        dir.name.toLowerCase().includes(searchLower) ||
        (dir.description &&
          dir.description.toLowerCase().includes(searchLower)) ||
        (dir.categories &&
          dir.categories.some((cat) =>
            cat.toLowerCase().includes(searchLower),
          )),
    );
  }

  return filtered;
};

// Sort logic
const sortDirectories = (dirs, sortByOption) => {
  const sorted = [...dirs];

  switch (sortByOption) {
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
        (a, b) => new Date(b.created_at) - new Date(a.created_at),
      );
    case "Alphabetical":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return sorted;
  }
};

const filteredDirectories = computed(() => {
  const filtered = filterDirectories(props.directories);
  return sortDirectories(filtered, sortBy.value);
});

const isDirectorySelected = (directory) => {
  return selectedDirectories.value.some((d) => d.id === directory.id);
};

const toggleDirectorySelection = (directory) => {
  const index = selectedDirectories.value.findIndex(
    (d) => d.id === directory.id,
  );
  if (index > -1) {
    selectedDirectories.value.splice(index, 1);
  } else {
    selectedDirectories.value.push(directory);
  }

  // Store in localStorage
  localStorage.setItem(
    "selectedDirectories",
    JSON.stringify(selectedDirectories.value.map((d) => d.id)),
  );
};

const selectAll = () => {
  selectedDirectories.value = [...filteredDirectories.value];
  localStorage.setItem(
    "selectedDirectories",
    JSON.stringify(selectedDirectories.value.map((d) => d.id)),
  );
};

const deselectAll = () => {
  selectedDirectories.value = [];
  localStorage.removeItem("selectedDirectories");
};

const clearFilters = () => {
  searchQuery.value = "";
  filters.value = {
    category: "All",
    drRange: "All",
    linkType: "All",
    pricing: "All",
  };
};

const handleVote = async (directory) => {
  try {
    // Get IP hash (simplified - in production use proper IP detection)
    const ipHash = await getIPHash();

    const { error: voteError } = await supabase.from("directory_votes").insert({
      directory_id: directory.id,
      ip_hash: ipHash,
    });

    if (voteError) {
      if (voteError.code === "23505") {
        console.log("Already voted for this directory");
      } else {
        throw voteError;
      }
    }

    // Track with Pirsch
    if (window.pirsch) {
      window.pirsch("Directory Helpful Vote", { directory: directory.slug });
    }
  } catch (err) {
    console.error("Error voting:", err);
  }
};

const getIPHash = async () => {
  // Simplified IP hash - in production, use server-side IP detection
  const response = await fetch("https://api.ipify.org?format=json");
  const data = await response.json();
  const ip = data.ip;

  // Create simple hash
  const encoder = new TextEncoder();
  const data_encoded = encoder.encode(ip);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data_encoded);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return hashHex;
};

onMounted(() => {
  // Restore selection from localStorage
  const storedSelection = localStorage.getItem("selectedDirectories");
  if (storedSelection) {
    try {
      const ids = JSON.parse(storedSelection);
      selectedDirectories.value = props.directories.filter((d) =>
        ids.includes(d.id),
      );
    } catch (e) {
      console.error("Error restoring selection:", e);
    }
  }

  // Track page view with Pirsch
  if (window.pirsch) {
    window.pirsch("Page View");
  }
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
