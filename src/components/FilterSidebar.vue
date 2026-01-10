<template>
  <aside
    class="filter-sidebar"
    :class="{ 'is-mobile-open': isMobileOpen }"
    role="complementary"
    aria-label="Directory filters"
  >
    <!-- Mobile Header -->
    <div
      v-if="isMobile"
      class="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white sticky top-0 z-10"
    >
      <div class="flex items-center gap-2">
        <button
          @click="$emit('close')"
          class="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Close filters"
        >
          <svg
            class="w-5 h-5 text-gray-600"
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
        <h2 class="text-lg font-semibold text-gray-900">Filters</h2>
      </div>
      <button
        v-if="hasActiveFilters"
        @click="resetAllFilters"
        class="text-sm text-primary font-medium hover:text-primary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded px-2 py-1"
      >
        Reset all
      </button>
    </div>

    <div class="filter-sidebar-content">
      <!-- Quick Filter Presets -->
      <div class="filter-section">
        <h3 class="filter-section-title">Quick Filters</h3>
        <div class="space-y-1">
          <button
            v-for="preset in quickFilterPresets"
            :key="preset.id"
            @click="applyQuickFilter(preset)"
            :class="[
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
              isActivePreset(preset)
                ? 'bg-primary text-white shadow-sm'
                : 'text-gray-700 hover:bg-gray-100',
            ]"
            :aria-pressed="isActivePreset(preset)"
          >
            <span class="text-base" aria-hidden="true">{{ preset.icon }}</span>
            <span class="flex-1 text-left">{{ preset.label }}</span>
            <svg
              v-if="isActivePreset(preset)"
              class="w-4 h-4 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Category Filter -->
      <div class="filter-section">
        <button
          @click="toggleSection('category')"
          class="filter-section-header"
          :aria-expanded="expandedSections.category"
        >
          <h3 class="filter-section-title">Category</h3>
          <svg
            class="w-4 h-4 text-gray-500 transition-transform duration-200"
            :class="{ 'rotate-180': expandedSections.category }"
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
        <transition name="collapse">
          <div v-show="expandedSections.category" class="filter-section-content">
            <select
              :value="filters.category"
              @change="updateFilter('category', $event.target.value)"
              :class="[
                'w-full px-3 py-2.5 rounded-lg text-sm bg-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary border',
                filters.category !== 'All'
                  ? 'border-primary/50 bg-primary/5'
                  : 'border-gray-300',
              ]"
            >
              <option v-for="cat in categories" :key="cat" :value="cat">
                {{ cat }}
              </option>
            </select>
          </div>
        </transition>
      </div>

      <!-- Domain Rating Filter -->
      <div class="filter-section">
        <button
          @click="toggleSection('drRange')"
          class="filter-section-header"
          :aria-expanded="expandedSections.drRange"
        >
          <h3 class="filter-section-title">Domain Rating</h3>
          <div class="flex items-center gap-2">
            <span
              v-if="filters.drRange !== 'All'"
              class="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full"
            >
              {{ filters.drRange }}
            </span>
            <svg
              class="w-4 h-4 text-gray-500 transition-transform duration-200"
              :class="{ 'rotate-180': expandedSections.drRange }"
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
          </div>
        </button>
        <transition name="collapse">
          <div v-show="expandedSections.drRange" class="filter-section-content">
            <div class="space-y-1">
              <label
                v-for="option in drOptions"
                :key="option.value"
                :class="[
                  'flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors',
                  filters.drRange === option.value
                    ? 'bg-primary/10 text-primary'
                    : 'hover:bg-gray-50 text-gray-700',
                ]"
              >
                <input
                  type="radio"
                  name="drRange"
                  :value="option.value"
                  :checked="filters.drRange === option.value"
                  @change="updateFilter('drRange', option.value)"
                  class="sr-only"
                />
                <span
                  :class="[
                    'w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors',
                    filters.drRange === option.value
                      ? 'border-primary bg-primary'
                      : 'border-gray-300',
                  ]"
                >
                  <span
                    v-if="filters.drRange === option.value"
                    class="w-1.5 h-1.5 rounded-full bg-white"
                  ></span>
                </span>
                <span class="text-sm font-medium">{{ option.label }}</span>
              </label>
            </div>
          </div>
        </transition>
      </div>

      <!-- Link Type Filter -->
      <div class="filter-section">
        <button
          @click="toggleSection('linkType')"
          class="filter-section-header"
          :aria-expanded="expandedSections.linkType"
        >
          <h3 class="filter-section-title">Link Type</h3>
          <div class="flex items-center gap-2">
            <span
              v-if="filters.linkType !== 'All'"
              class="text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full"
            >
              DoFollow
            </span>
            <svg
              class="w-4 h-4 text-gray-500 transition-transform duration-200"
              :class="{ 'rotate-180': expandedSections.linkType }"
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
          </div>
        </button>
        <transition name="collapse">
          <div v-show="expandedSections.linkType" class="filter-section-content">
            <label
              :class="[
                'flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors',
                filters.linkType === 'Dofollow Only'
                  ? 'bg-green-50 text-green-800'
                  : 'hover:bg-gray-50 text-gray-700',
              ]"
            >
              <input
                type="checkbox"
                :checked="filters.linkType === 'Dofollow Only'"
                @change="
                  updateFilter(
                    'linkType',
                    $event.target.checked ? 'Dofollow Only' : 'All'
                  )
                "
                class="sr-only"
              />
              <span
                :class="[
                  'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
                  filters.linkType === 'Dofollow Only'
                    ? 'border-green-600 bg-green-600'
                    : 'border-gray-300',
                ]"
              >
                <svg
                  v-if="filters.linkType === 'Dofollow Only'"
                  class="w-3 h-3 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
              </span>
              <span class="text-sm font-medium">DoFollow links only</span>
            </label>
          </div>
        </transition>
      </div>

      <!-- Pricing Filter -->
      <div class="filter-section">
        <button
          @click="toggleSection('pricing')"
          class="filter-section-header"
          :aria-expanded="expandedSections.pricing"
        >
          <h3 class="filter-section-title">Pricing</h3>
          <div class="flex items-center gap-2">
            <span
              v-if="filters.pricing !== 'All'"
              class="text-xs font-medium capitalize"
              :class="pricingBadgeClass"
            >
              {{ filters.pricing }}
            </span>
            <svg
              class="w-4 h-4 text-gray-500 transition-transform duration-200"
              :class="{ 'rotate-180': expandedSections.pricing }"
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
          </div>
        </button>
        <transition name="collapse">
          <div v-show="expandedSections.pricing" class="filter-section-content">
            <div class="space-y-1">
              <label
                v-for="option in pricingOptions"
                :key="option.value"
                :class="[
                  'flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors',
                  filters.pricing === option.value
                    ? 'bg-primary/10 text-primary'
                    : 'hover:bg-gray-50 text-gray-700',
                ]"
              >
                <input
                  type="radio"
                  name="pricing"
                  :value="option.value"
                  :checked="filters.pricing === option.value"
                  @change="updateFilter('pricing', option.value)"
                  class="sr-only"
                />
                <span
                  :class="[
                    'w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors',
                    filters.pricing === option.value
                      ? 'border-primary bg-primary'
                      : 'border-gray-300',
                  ]"
                >
                  <span
                    v-if="filters.pricing === option.value"
                    class="w-1.5 h-1.5 rounded-full bg-white"
                  ></span>
                </span>
                <span class="text-sm font-medium">{{ option.label }}</span>
              </label>
            </div>
          </div>
        </transition>
      </div>

      <!-- Sort By -->
      <div class="filter-section">
        <button
          @click="toggleSection('sortBy')"
          class="filter-section-header"
          :aria-expanded="expandedSections.sortBy"
        >
          <h3 class="filter-section-title">Sort By</h3>
          <svg
            class="w-4 h-4 text-gray-500 transition-transform duration-200"
            :class="{ 'rotate-180': expandedSections.sortBy }"
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
        <transition name="collapse">
          <div v-show="expandedSections.sortBy" class="filter-section-content">
            <div class="space-y-1">
              <label
                v-for="option in sortOptions"
                :key="option.value"
                :class="[
                  'flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors',
                  filters.sortBy === option.value
                    ? 'bg-primary/10 text-primary'
                    : 'hover:bg-gray-50 text-gray-700',
                ]"
              >
                <input
                  type="radio"
                  name="sortBy"
                  :value="option.value"
                  :checked="filters.sortBy === option.value"
                  @change="updateFilter('sortBy', option.value)"
                  class="sr-only"
                />
                <span
                  :class="[
                    'w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors',
                    filters.sortBy === option.value
                      ? 'border-primary bg-primary'
                      : 'border-gray-300',
                  ]"
                >
                  <span
                    v-if="filters.sortBy === option.value"
                    class="w-1.5 h-1.5 rounded-full bg-white"
                  ></span>
                </span>
                <span class="text-sm font-medium">{{ option.label }}</span>
              </label>
            </div>
          </div>
        </transition>
      </div>

      <!-- Reset Button (Desktop) -->
      <div v-if="!isMobile && hasActiveFilters" class="px-4 pt-4 pb-2">
        <button
          @click="resetAllFilters"
          class="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span>Reset filters</span>
        </button>
      </div>
    </div>

    <!-- Mobile Apply Button -->
    <div
      v-if="isMobile"
      class="sticky bottom-0 px-4 py-3 bg-white border-t border-gray-200"
    >
      <button
        @click="$emit('close')"
        class="w-full btn-primary min-h-[48px] text-base font-semibold"
      >
        Show {{ resultCount.toLocaleString() }} directories
      </button>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  filters: {
    type: Object,
    required: true,
  },
  categories: {
    type: Array,
    default: () => [],
  },
  resultCount: {
    type: Number,
    default: 0,
  },
  isMobile: {
    type: Boolean,
    default: false,
  },
  isMobileOpen: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:filters", "close", "reset", "applyPreset"]);

// Section expansion state
const expandedSections = ref({
  category: true,
  drRange: true,
  linkType: true,
  pricing: true,
  sortBy: false,
});

function toggleSection(section) {
  expandedSections.value[section] = !expandedSections.value[section];
}

// Filter options
const drOptions = [
  { value: "All", label: "All DR" },
  { value: "80+", label: "80+ (Excellent)" },
  { value: "70+", label: "70+ (Great)" },
  { value: "70-79", label: "70-79" },
  { value: "60-69", label: "60-69" },
  { value: "<60", label: "Under 60" },
];

const pricingOptions = [
  { value: "All", label: "All pricing" },
  { value: "free", label: "Free" },
  { value: "freemium", label: "Freemium" },
  { value: "paid", label: "Paid" },
];

const sortOptions = [
  { value: "Highest Rated", label: "Highest Rated" },
  { value: "Highest DR", label: "Highest DR" },
  { value: "Newest", label: "Newest" },
  { value: "Alphabetical", label: "Alphabetical" },
];

// Quick filter presets
const quickFilterPresets = [
  {
    id: "quick-wins",
    label: "Quick Wins",
    icon: "🚀",
    filters: {
      category: "All",
      drRange: "70+",
      linkType: "Dofollow Only",
      pricing: "free",
      sortBy: "Highest DR",
    },
  },
  {
    id: "premium",
    label: "Premium",
    icon: "💎",
    filters: {
      category: "All",
      drRange: "80+",
      linkType: "Dofollow Only",
      pricing: "All",
      sortBy: "Highest DR",
    },
  },
  {
    id: "all-free",
    label: "All Free",
    icon: "🆓",
    filters: {
      category: "All",
      drRange: "All",
      linkType: "All",
      pricing: "free",
      sortBy: "Highest Rated",
    },
  },
  {
    id: "top-rated",
    label: "Top Rated",
    icon: "⭐",
    filters: {
      category: "All",
      drRange: "All",
      linkType: "All",
      pricing: "All",
      sortBy: "Highest Rated",
    },
  },
  {
    id: "all",
    label: "All Directories",
    icon: "📂",
    filters: {
      category: "All",
      drRange: "All",
      linkType: "All",
      pricing: "All",
      sortBy: "Highest DR",
    },
  },
];

const hasActiveFilters = computed(() => {
  return (
    props.filters.search ||
    props.filters.category !== "All" ||
    props.filters.drRange !== "All" ||
    props.filters.linkType !== "All" ||
    props.filters.pricing !== "All"
  );
});

const pricingBadgeClass = computed(() => {
  const pricing = props.filters.pricing;
  if (pricing === "free") return "text-emerald-700 bg-emerald-100";
  if (pricing === "paid") return "text-orange-700 bg-orange-100";
  return "text-blue-700 bg-blue-100";
});

function updateFilter(key, value) {
  emit("update:filters", { ...props.filters, [key]: value });
}

function applyQuickFilter(preset) {
  emit("applyPreset", preset);
}

function isActivePreset(preset) {
  return (
    props.filters.category === preset.filters.category &&
    props.filters.drRange === preset.filters.drRange &&
    props.filters.linkType === preset.filters.linkType &&
    props.filters.pricing === preset.filters.pricing &&
    props.filters.sortBy === preset.filters.sortBy &&
    !props.filters.search
  );
}

function resetAllFilters() {
  emit("reset");
}
</script>

<style scoped>
@reference "../style.css";

.filter-sidebar {
  @apply bg-white h-full overflow-y-auto;
}

.filter-sidebar-content {
  @apply py-2;
}

.filter-section {
  @apply border-b border-gray-100;
}

.filter-section:last-of-type {
  @apply border-b-0;
}

.filter-section-header {
  @apply w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary;
}

.filter-section-title {
  @apply text-sm font-semibold text-gray-900;
}

.filter-section-content {
  @apply px-4 pb-3;
}

/* Collapse transition */
.collapse-enter-active,
.collapse-leave-active {
  transition: all 0.2s ease-out;
  overflow: hidden;
}

.collapse-enter-from,
.collapse-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
}

.collapse-enter-to,
.collapse-leave-from {
  opacity: 1;
  max-height: 500px;
}

/* Mobile drawer styles */
@media (max-width: 1023px) {
  .filter-sidebar {
    @apply fixed inset-y-0 left-0 z-50 w-full max-w-sm transform -translate-x-full transition-transform duration-300 ease-out shadow-xl;
  }

  .filter-sidebar.is-mobile-open {
    @apply translate-x-0;
  }
}

/* Desktop styles */
@media (min-width: 1024px) {
  .filter-sidebar {
    @apply sticky top-20 border-r border-gray-200 max-h-[calc(100vh-5rem)];
  }
}
</style>
