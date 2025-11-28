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

    <!-- Main Content -->
    <div v-else>
      <!-- Sticky Filter Bar -->
      <div
        class="bg-white border-b border-gray-200 sticky top-0 sm:top-16 z-40 shadow-sm"
      >
        <div
          class="max-w-8xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4"
        >
          <!-- First-Visit Tooltip -->
          <transition
            name="slide-down"
            @enter="onTooltipEnter"
            @after-enter="onTooltipAfterEnter"
            @leave="onTooltipLeave"
          >
            <div
              v-if="showTooltip"
              class="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3"
              role="status"
              aria-live="polite"
            >
              <span class="text-lg flex-shrink-0" aria-hidden="true">👋</span>
              <div class="flex-1 text-sm text-gray-700">
                <p class="font-medium mb-1">
                  We pre-filtered to show you the best directories
                </p>
                <p class="text-gray-600">
                  DoFollow links with high DR (70+). Tap "All Directories" to
                  see everything.
                </p>
              </div>
              <button
                @click="dismissTooltip"
                class="text-gray-400 hover:text-gray-600 focus:text-gray-600 flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center -mr-2 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                aria-label="Dismiss notification"
              >
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
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
          </transition>

          <!-- Search Bar -->
          <div class="mb-3">
            <label for="directory-search" class="sr-only"
              >Search directories</label
            >
            <div class="relative w-full">
              <input
                id="directory-search"
                v-model="searchQuery"
                type="search"
                placeholder="Search directories..."
                class="search-input w-full pl-10 pr-12 py-3 sm:py-2.5 border border-gray-300 rounded-lg text-sm sm:text-base bg-white min-h-[48px] sm:min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent transition-all"
                aria-label="Search directories"
                :aria-describedby="searchQuery ? 'search-clear' : undefined"
              />
              <transition name="fade">
                <button
                  v-if="searchQuery"
                  id="search-clear"
                  @click="clearSearch"
                  class="absolute inset-y-0 right-0 w-12 flex items-center justify-center rounded-r-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-colors z-10"
                  aria-label="Clear search"
                >
                  <svg
                    class="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </transition>
            </div>
          </div>

          <!-- Active Filter Chips -->
          <div
            v-if="activeFilterChips.length > 0"
            class="flex items-center gap-2 flex-wrap mb-3"
            role="group"
            aria-label="Active filters"
          >
            <span class="text-xs text-gray-500 mr-1">Active:</span>
            <transition-group
              name="chip"
              tag="div"
              class="flex items-center gap-2 flex-wrap"
            >
              <button
                v-for="chip in activeFilterChips"
                :key="chip.key"
                @click="removeFilter(chip.key)"
                class="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-primary/10 text-primary text-xs font-medium rounded-full hover:bg-primary/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
                :aria-label="`Remove ${chip.type} filter: ${chip.label}`"
              >
                <span>{{ chip.label }}</span>
                <svg
                  class="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </transition-group>
            <button
              v-if="activeFilterChips.length > 1"
              @click="resetAllFilters"
              class="text-xs text-gray-500 hover:text-gray-700 underline underline-offset-2 ml-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 rounded"
              aria-label="Clear all filters"
            >
              Clear all
            </button>
          </div>

          <!-- Quick Filter Pills -->
          <div class="mb-3">
            <div
              class="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-3 px-3 sm:mx-0 sm:px-0"
              role="group"
              aria-label="Quick filter presets"
            >
              <button
                v-for="preset in quickFilterPresets"
                :key="preset.id"
                @click="applyQuickFilter(preset)"
                :class="[
                  'flex-shrink-0 px-4 py-2.5 sm:py-2 rounded-full text-sm font-medium transition-all min-h-[44px] sm:min-h-[40px] whitespace-nowrap touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                  isActivePreset(preset)
                    ? 'bg-primary text-white shadow-sm focus-visible:ring-primary'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300 focus-visible:ring-gray-400',
                ]"
                :aria-label="`Apply ${preset.label} filter`"
                :aria-pressed="isActivePreset(preset)"
              >
                <span class="inline-block mr-1" aria-hidden="true">{{
                  preset.icon
                }}</span>
                <span>{{ preset.label }}</span>
              </button>
            </div>
          </div>

          <!-- Advanced Filters Accordion -->
          <div class="border-t border-gray-200 pt-3">
            <button
              @click="toggleAdvancedFilters"
              class="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 min-h-[48px] sm:min-h-[44px] w-full justify-between touch-manipulation active:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              aria-label="Toggle advanced filters"
              :aria-expanded="advancedFiltersExpanded"
              aria-controls="advanced-filters"
            >
              <span>Advanced Filters</span>
              <svg
                class="w-5 h-5 transition-transform duration-200 flex-shrink-0"
                :class="{ 'rotate-180': advancedFiltersExpanded }"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            <transition
              name="accordion"
              @enter="onEnter"
              @after-enter="onAfterEnter"
              @leave="onLeave"
            >
              <div
                v-show="advancedFiltersExpanded"
                id="advanced-filters"
                class="overflow-hidden"
              >
                <div
                  class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 mt-3 pb-1"
                  role="group"
                  aria-label="Advanced filter options"
                >
                  <div>
                    <label
                      for="filter-category"
                      class="block text-sm font-medium text-gray-900 mb-1.5"
                    >
                      Category
                    </label>
                    <select
                      id="filter-category"
                      v-model="currentFilters.category"
                      @change="applyFilters"
                      :class="[
                        'w-full px-3 py-3 sm:py-2.5 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-base sm:text-sm min-h-[48px] sm:min-h-[44px] bg-white touch-manipulation transition-colors focus:outline-none border',
                        currentFilters.category !== 'All'
                          ? 'border-primary/50 bg-primary/5'
                          : 'border-gray-300',
                      ]"
                    >
                      <option v-for="cat in categories" :key="cat" :value="cat">
                        {{ cat }}
                      </option>
                    </select>
                  </div>

                  <div>
                    <label
                      for="filter-dr"
                      class="block text-sm font-medium text-gray-900 mb-1.5"
                    >
                      Domain Rating
                    </label>
                    <select
                      id="filter-dr"
                      v-model="currentFilters.drRange"
                      @change="applyFilters"
                      :class="[
                        'w-full px-3 py-3 sm:py-2.5 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-base sm:text-sm min-h-[48px] sm:min-h-[44px] bg-white touch-manipulation transition-colors focus:outline-none border',
                        currentFilters.drRange !== 'All'
                          ? 'border-primary/50 bg-primary/5'
                          : 'border-gray-300',
                      ]"
                    >
                      <option value="All">All DR</option>
                      <option value="80+">80+</option>
                      <option value="70+">70+</option>
                      <option value="70-79">70-79</option>
                      <option value="60-69">60-69</option>
                      <option value="<60">&lt;60</option>
                    </select>
                  </div>

                  <div>
                    <label
                      for="filter-link"
                      class="block text-sm font-medium text-gray-900 mb-1.5"
                    >
                      Link Type
                    </label>
                    <select
                      id="filter-link"
                      v-model="currentFilters.linkType"
                      @change="applyFilters"
                      :class="[
                        'w-full px-3 py-3 sm:py-2.5 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-base sm:text-sm min-h-[48px] sm:min-h-[44px] bg-white touch-manipulation transition-colors focus:outline-none border',
                        currentFilters.linkType !== 'All'
                          ? 'border-primary/50 bg-primary/5'
                          : 'border-gray-300',
                      ]"
                    >
                      <option value="All">All</option>
                      <option value="Dofollow Only">Dofollow Only</option>
                    </select>
                  </div>

                  <div>
                    <label
                      for="filter-pricing"
                      class="block text-sm font-medium text-gray-900 mb-1.5"
                    >
                      Pricing
                    </label>
                    <select
                      id="filter-pricing"
                      v-model="currentFilters.pricing"
                      @change="applyFilters"
                      :class="[
                        'w-full px-3 py-3 sm:py-2.5 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-base sm:text-sm min-h-[48px] sm:min-h-[44px] bg-white touch-manipulation transition-colors focus:outline-none border',
                        currentFilters.pricing !== 'All'
                          ? 'border-primary/50 bg-primary/5'
                          : 'border-gray-300',
                      ]"
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
                      class="block text-sm font-medium text-gray-900 mb-1.5"
                    >
                      Sort By
                    </label>
                    <select
                      id="filter-sort"
                      v-model="currentFilters.sortBy"
                      @change="applyFilters"
                      class="w-full px-3 py-3 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-base sm:text-sm min-h-[48px] sm:min-h-[44px] bg-white touch-manipulation transition-colors focus:outline-none"
                    >
                      <option>Highest Rated</option>
                      <option>Highest DR</option>
                      <option>Newest</option>
                      <option>Alphabetical</option>
                    </select>
                  </div>
                </div>
              </div>
            </transition>
          </div>

          <!-- Results Summary -->
          <div
            class="mt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-gray-200"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            <div class="flex items-center gap-2 flex-wrap">
              <!-- Result count with context -->
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
                  {{
                    visibleDirectories.length === 1
                      ? "directory"
                      : "directories"
                  }}
                </template>
              </span>

              <!-- Search scope indicator -->
              <span
                v-if="
                  currentFilters.search &&
                  hasActiveFilters &&
                  activeFilterChips.length > 1
                "
                class="text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded-full inline-flex items-center gap-1"
              >
                <svg
                  class="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
                filtered search
              </span>

              <!-- Pending submissions badge -->
              <span
                v-if="pendingSubmissions.length > 0"
                class="text-xs text-yellow-800 bg-yellow-50 px-2 py-1 rounded-full"
              >
                {{ pendingSubmissions.length }} pending
              </span>
            </div>

            <button
              v-if="!isDefaultState"
              @click="resetToDefault"
              class="text-sm text-primary hover:text-primary-dark font-medium whitespace-nowrap min-h-[48px] sm:min-h-[44px] px-3 -mx-3 sm:mx-0 sm:px-2 flex items-center gap-1.5 touch-manipulation active:bg-gray-50 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              aria-label="Reset to default filters"
            >
              <svg
                class="w-4 h-4 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
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
      </div>

      <!-- Directory Grid -->
      <div class="max-w-8xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8">
        <!-- Loading Skeleton -->
        <div v-if="isLoading" class="space-y-4">
          <div v-for="i in 6" :key="i" class="animate-pulse">
            <div class="bg-gray-200 rounded-lg h-48"></div>
          </div>
        </div>

        <!-- Empty State -->
        <div
          v-else-if="visibleDirectories.length === 0"
          class="text-center py-12 px-4"
          role="status"
          aria-live="polite"
        >
          <div class="mb-4">
            <svg
              class="w-16 h-16 mx-auto text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          <!-- Different messages based on context -->
          <h2 class="text-xl font-semibold text-gray-900 mb-2">
            <template v-if="currentFilters.search">
              No results for "{{ currentFilters.search }}"
            </template>
            <template v-else> No directories match your filters </template>
          </h2>

          <!-- Show active filters -->
          <div v-if="activeFilterChips.length > 0" class="mb-4">
            <p class="text-gray-600 mb-3">
              <template
                v-if="currentFilters.search && activeFilterChips.length > 1"
              >
                Your search is limited by
                {{ activeFilterChips.length - 1 }} active filter{{
                  activeFilterChips.length > 2 ? "s" : ""
                }}:
              </template>
              <template v-else-if="!currentFilters.search">
                Active filters:
              </template>
            </p>
            <div class="flex items-center justify-center gap-2 flex-wrap">
              <button
                v-for="chip in activeFilterChips"
                :key="chip.key"
                @click="removeFilter(chip.key)"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-full hover:bg-red-50 hover:text-red-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 group"
                :aria-label="`Remove ${chip.type} filter: ${chip.label}`"
              >
                <span>{{ chip.label }}</span>
                <svg
                  class="w-4 h-4 text-gray-400 group-hover:text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
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

          <!-- Suggestions -->
          <div class="space-y-3 max-w-md mx-auto">
            <!-- Search all directories option (when search + filters active) -->
            <button
              v-if="
                currentFilters.search &&
                searchOnlyResultsCount > 0 &&
                activeFilterChips.length > 1
              "
              @click="searchAllDirectories"
              class="w-full btn-primary min-h-[48px] sm:min-h-[44px] px-6 touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 inline-flex items-center justify-center gap-2"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <span>Search all directories</span>
              <span
                class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-white bg-opacity-20"
              >
                {{ searchOnlyResultsCount }} result{{
                  searchOnlyResultsCount !== 1 ? "s" : ""
                }}
              </span>
            </button>

            <!-- Reset all filters -->
            <button
              @click="resetAllFilters"
              :class="[
                'w-full min-h-[48px] sm:min-h-[44px] px-6 touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors',
                currentFilters.search &&
                searchOnlyResultsCount > 0 &&
                activeFilterChips.length > 1
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  : 'btn-primary',
              ]"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span>Reset all filters</span>
              <span
                class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-white bg-opacity-20"
              >
                {{ totalDirectoriesCount }} directories
              </span>
            </button>
          </div>

          <!-- Helpful tip -->
          <p
            v-if="activeFilterChips.length > 0"
            class="text-sm text-gray-500 mt-6"
          >
            💡 Tip: Click on any filter chip above to remove it individually
          </p>
        </div>

        <!-- Directory Grid -->
        <div
          v-else
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 lg:gap-6"
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
          class="mt-6 sm:mt-8 text-center"
        >
          <button
            @click="loadMore"
            class="btn-primary min-h-[48px] sm:min-h-[44px] w-full sm:w-auto px-6 touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 inline-flex items-center justify-center gap-2"
            aria-label="Load more directories"
          >
            <span>Load More</span>
            <span
              class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-white bg-opacity-20"
            >
              {{ (visibleDirectories.length - itemsToShow).toLocaleString() }}
              remaining
            </span>
          </button>
        </div>
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

// Default filters: DoFollow + DR 70+ for instant value
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
const advancedFiltersExpanded = ref(false);
const showTooltip = ref(false);

// Quick filter presets
const quickFilterPresets = ref([
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
    icon: "⚡",
    filters: {
      category: "All",
      drRange: "All",
      linkType: "All",
      pricing: "All",
      sortBy: "Highest DR",
    },
  },
]);

const hasActiveFilters = computed(() => {
  return (
    currentFilters.value.search ||
    currentFilters.value.category !== "All" ||
    currentFilters.value.drRange !== "All" ||
    currentFilters.value.linkType !== "All" ||
    currentFilters.value.pricing !== "All"
  );
});

// Compute active filter chips for display
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
      label: currentFilters.value.linkType,
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

// Count results without any filters (for empty state suggestions)
const totalDirectoriesCount = computed(() => allData.value.length);

// Count results with only search (no other filters)
const searchOnlyResultsCount = computed(() => {
  if (!currentFilters.value.search) return 0;
  const searchLower = currentFilters.value.search.toLowerCase();
  return allData.value.filter((dir) => {
    return (
      dir.name.toLowerCase().includes(searchLower) ||
      (dir.description &&
        dir.description.toLowerCase().includes(searchLower)) ||
      (dir.categories &&
        dir.categories.some((cat) => cat.toLowerCase().includes(searchLower)))
    );
  }).length;
});

// Remove a specific filter
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

// Search all directories (remove filters but keep search)
function searchAllDirectories() {
  currentFilters.value.category = "All";
  currentFilters.value.drRange = "All";
  currentFilters.value.linkType = "All";
  currentFilters.value.pricing = "All";
  applyFilters();
}

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
    return "premium directories (DoFollow + DR 70+)";
  }
  return visibleDirectories.value.length === 1 ? "directory" : "directories";
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

onMounted(async function handleMounted() {
  await loadDirectories();
  await loadUserData();
  checkFirstVisit();
});

// Check if this is the user's first visit
function checkFirstVisit() {
  const hasVisited = localStorage.getItem("awesome-dirs-visited");
  if (!hasVisited) {
    showTooltip.value = true;
    localStorage.setItem("awesome-dirs-visited", "true");
  }
}

function dismissTooltip() {
  showTooltip.value = false;
}

// Search input state
var searchQuery = ref("");
var searchDebounceTimer = ref(null);

// Watch for search query changes with debouncing
watch(searchQuery, function handleSearchChange(newValue) {
  if (searchDebounceTimer.value) {
    clearTimeout(searchDebounceTimer.value);
  }

  searchDebounceTimer.value = setTimeout(function executeSearch() {
    currentFilters.value.search = newValue;
    applyFilters();
  }, 300);
});

// Apply quick filter preset
function applyQuickFilter(preset) {
  currentFilters.value = {
    search: "",
    ...preset.filters,
  };

  searchQuery.value = "";

  applyFilters();
  advancedFiltersExpanded.value = false;
  itemsToShow.value = 30;
}

// Check if a preset is currently active
function isActivePreset(preset) {
  return (
    currentFilters.value.category === preset.filters.category &&
    currentFilters.value.drRange === preset.filters.drRange &&
    currentFilters.value.linkType === preset.filters.linkType &&
    currentFilters.value.pricing === preset.filters.pricing &&
    currentFilters.value.sortBy === preset.filters.sortBy &&
    !currentFilters.value.search
  );
}

// Reset to default smart filters
function resetToDefault() {
  currentFilters.value = { ...DEFAULT_FILTERS };
  searchQuery.value = "";
  itemsToShow.value = 30;
  applyFilters();
  advancedFiltersExpanded.value = false;
}

function resetAllFilters() {
  resetToDefault();
}

// Toggle advanced filters visibility
function toggleAdvancedFilters() {
  advancedFiltersExpanded.value = !advancedFiltersExpanded.value;
}

var error = ref(null);
var retryCount = ref(0);
var maxRetries = 3;

function clearSearch() {
  searchQuery.value = "";
  var searchInput = document.getElementById("directory-search");
  if (searchInput) {
    searchInput.focus();
  }
}

async function loadDirectories() {
  try {
    error.value = null;
    var response = await httpClient.get("/data/directories.json");
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
    // Load user's pending submissions
    const { data: pending } = await supabase
      .from("pending_directories")
      .select("*")
      .eq("user_id", user.value.id)
      .eq("status", "pending");

    pendingSubmissions.value = pending || [];

    // Load user's favorites
    userFavoriteIds.value = await getUserFavoriteIds(user.value);

    log.info(
      `Loaded ${pendingSubmissions.value.length} pending submissions, ${userFavoriteIds.value.length} favorites`,
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
    average_rating: null,
    rating_count: 0,
    review_count: 0,
    view_count: 0,
    created_at: pending.submitted_at,
  };
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

    if (range === "70+" && dr < 70) return false;
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
    case "Highest Rated":
      return sorted.sort((a, b) => {
        // Sort by average rating first, then by rating count
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

function onEnter(el) {
  el.style.height = "0";
  el.style.overflow = "hidden";

  requestAnimationFrame(function setHeight() {
    el.style.height = el.scrollHeight + "px";
  });
}

function onAfterEnter(el) {
  el.style.height = "auto";
  el.style.overflow = "visible";
}

function onLeave(el) {
  el.style.height = el.scrollHeight + "px";
  el.style.overflow = "hidden";

  requestAnimationFrame(function collapseHeight() {
    requestAnimationFrame(function setZeroHeight() {
      el.style.height = "0";
    });
  });
}

function onTooltipEnter(el) {
  el.style.maxHeight = "0";
  el.style.overflow = "hidden";
  el.style.opacity = "0";
}

function onTooltipAfterEnter(el) {
  el.style.maxHeight = el.scrollHeight + "px";
  el.style.opacity = "1";
}

function onTooltipLeave(el) {
  el.style.maxHeight = "0";
  el.style.opacity = "0";
}
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.touch-manipulation {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.search-input {
  outline: none;
  transition:
    box-shadow 0.2s ease-in-out,
    border-color 0.2s ease-in-out;
}

.search-input:focus {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  border-color: #3b82f6;
}

.search-input::-webkit-search-cancel-button {
  -webkit-appearance: none;
  appearance: none;
}

.accordion-enter-active,
.accordion-leave-active {
  transition: height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-down-enter-from,
.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-10px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Filter chip transitions */
.chip-enter-active {
  transition: all 0.2s ease-out;
}

.chip-leave-active {
  transition: all 0.15s ease-in;
}

.chip-enter-from {
  opacity: 0;
  transform: scale(0.8);
}

.chip-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

.chip-move {
  transition: transform 0.2s ease;
}

@media (max-width: 640px) {
  .scrollbar-hide {
    scroll-padding-left: 0.75rem;
    scroll-padding-right: 0.75rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .accordion-enter-active,
  .accordion-leave-active,
  .slide-down-enter-active,
  .slide-down-leave-active,
  .fade-enter-active,
  .fade-leave-active {
    transition: none;
  }
}

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
</style>
