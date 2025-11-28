<template>
  <article
    class="directory-card group relative bg-white rounded-xl border border-gray-200 hover:border-primary/30 hover:shadow-lg transition-all duration-200 overflow-hidden"
    :class="{ 'ring-2 ring-yellow-400/50 border-yellow-300': isPendingSubmission }"
  >
    <div v-if="isPendingSubmission" class="absolute top-0 left-0 right-0 bg-yellow-50 px-3 py-1.5 text-xs font-medium text-yellow-800 flex items-center gap-1.5 border-b border-yellow-200">
      <span class="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
      Pending Review
    </div>

    <div class="p-4 sm:p-5" :class="{ 'pt-10': isPendingSubmission }">
      <div class="flex items-start gap-3 sm:gap-4">
        <div class="flex-shrink-0">
          <div class="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center overflow-hidden border border-gray-200">
            <img
              v-if="directory.logo_url"
              :src="directory.logo_url"
              :alt="`${directory.name} logo`"
              class="w-full h-full object-cover"
              loading="lazy"
            />
            <span v-else class="text-xl sm:text-2xl font-bold text-gray-400">
              {{ directory.name.charAt(0).toUpperCase() }}
            </span>
          </div>
        </div>

        <div class="flex-1 min-w-0">
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <h3 class="font-semibold text-gray-900 text-base sm:text-lg leading-tight truncate group-hover:text-primary transition-colors">
                {{ directory.name }}
              </h3>
              <div class="flex items-center gap-2 mt-1 flex-wrap">
                <span
                  v-if="directory.is_dofollow"
                  class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                >
                  <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                  DoFollow
                </span>
                <span
                  v-else
                  class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600"
                >
                  NoFollow
                </span>
                <span :class="pricingBadgeClasses">
                  {{ pricingLabel }}
                </span>
              </div>
            </div>

            <button
              @click.prevent="toggleFavorite"
              class="flex-shrink-0 p-2 -m-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              :aria-label="isFavorited ? 'Remove from favorites' : 'Add to favorites'"
              :aria-pressed="isFavorited"
            >
              <svg
                class="w-5 h-5 transition-colors"
                :class="isFavorited ? 'text-red-500 fill-current' : 'text-gray-400'"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </button>
          </div>

          <p class="mt-2 text-sm text-gray-600 line-clamp-2 leading-relaxed">
            {{ directory.description || 'No description available.' }}
          </p>
        </div>
      </div>

      <div class="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
        <div class="metric-card">
          <div class="flex items-center gap-1.5 mb-1">
            <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
            </svg>
            <span class="text-xs text-gray-500 font-medium">DR</span>
          </div>
          <div class="flex items-baseline gap-1">
            <span class="text-lg sm:text-xl font-bold" :class="drColorClass">
              {{ directory.domain_rating || '—' }}
            </span>
            <div v-if="directory.domain_rating" class="w-full max-w-[40px] h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all"
                :class="drBarClass"
                :style="{ width: `${directory.domain_rating}%` }"
              ></div>
            </div>
          </div>
        </div>

        <div class="metric-card">
          <div class="flex items-center gap-1.5 mb-1">
            <svg class="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
            </svg>
            <span class="text-xs text-gray-500 font-medium">Traffic</span>
          </div>
          <span class="text-lg sm:text-xl font-bold text-gray-900">
            {{ formatTraffic(organicTraffic) }}
          </span>
        </div>

        <div class="metric-card">
          <div class="flex items-center gap-1.5 mb-1">
            <svg class="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
            </svg>
            <span class="text-xs text-gray-500 font-medium">Links</span>
          </div>
          <span class="text-lg sm:text-xl font-bold text-gray-900">
            {{ formatNumber(directory.backlinks_count) }}
          </span>
        </div>
      </div>

      <div v-if="hasCategories" class="mt-3 flex items-center gap-1.5 flex-wrap">
        <span
          v-for="category in displayCategories"
          :key="category"
          class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
        >
          {{ category }}
        </span>
        <span
          v-if="remainingCategoriesCount > 0"
          class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-50 text-gray-500"
        >
          +{{ remainingCategoriesCount }}
        </span>
      </div>

      <div class="mt-4 flex items-center gap-2">
        <a
          :href="`/directory/${directory.slug}`"
          class="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <span>View Details</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        </a>
        <a
          :href="directory.submission_url || directory.url"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center justify-center p-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          aria-label="Visit directory website"
          @click.stop
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
          </svg>
        </a>
      </div>
    </div>

    <div
      v-if="showQuickStats"
      class="px-4 sm:px-5 py-3 bg-gray-50 border-t border-gray-100 grid grid-cols-2 gap-4 text-xs"
    >
      <div class="flex items-center gap-2 text-gray-600">
        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064"/>
        </svg>
        <span>{{ formatNumber(directory.referring_domains) }} ref. domains</span>
      </div>
      <div v-if="topCountry" class="flex items-center gap-2 text-gray-600">
        <span class="text-base">{{ countryFlag }}</span>
        <span>{{ topCountryShare }}% from {{ topCountry.toUpperCase() }}</span>
      </div>
    </div>
  </article>
</template>

<script setup>
import { ref, computed } from "vue";
import { useStore } from "@nanostores/vue";
import { $user } from "@/stores/auth";
import { useDirectory } from "@/composables/useDirectory";

var props = defineProps({
  directory: {
    type: Object,
    required: true,
  },
  isPendingSubmission: {
    type: Boolean,
    default: false,
  },
  userFavoriteIds: {
    type: Array,
    default: function defaultFavorites() {
      return [];
    },
  },
});

var user = useStore($user);
var { toggleFavorite: toggleFav } = useDirectory();

var isFavorited = computed(function checkFavorited() {
  return props.userFavoriteIds.includes(props.directory.id);
});

var seoData = computed(function parseSeoData() {
  if (!props.directory.seo_data) return null;
  try {
    return typeof props.directory.seo_data === "string"
      ? JSON.parse(props.directory.seo_data)
      : props.directory.seo_data;
  } catch (e) {
    return null;
  }
});

var organicTraffic = computed(function getTraffic() {
  if (props.directory.organic_search_traffic) {
    return props.directory.organic_search_traffic;
  }
  if (seoData.value && seoData.value.traffic) {
    return seoData.value.traffic.monthly_avg || null;
  }
  return null;
});

var showQuickStats = computed(function checkQuickStats() {
  return props.directory.referring_domains || topCountry.value;
});

var topCountry = computed(function getTopCountry() {
  if (!seoData.value || !seoData.value.traffic) return null;
  var countries = seoData.value.traffic.top_countries;
  if (countries && countries.length > 0) {
    return countries[0].country;
  }
  return null;
});

var topCountryShare = computed(function getTopCountryShare() {
  if (!seoData.value || !seoData.value.traffic) return null;
  var countries = seoData.value.traffic.top_countries;
  if (countries && countries.length > 0) {
    return Math.round(countries[0].share);
  }
  return null;
});

var countryFlag = computed(function getCountryFlag() {
  var country = topCountry.value;
  if (!country) return "";
  var flags = {
    us: "🇺🇸",
    gb: "🇬🇧",
    in: "🇮🇳",
    ca: "🇨🇦",
    au: "🇦🇺",
    de: "🇩🇪",
    fr: "🇫🇷",
    br: "🇧🇷",
    es: "🇪🇸",
    mx: "🇲🇽",
    id: "🇮🇩",
    ph: "🇵🇭",
    nl: "🇳🇱",
    ru: "🇷🇺",
    th: "🇹🇭",
  };
  return flags[country.toLowerCase()] || "🌍";
});

var pricingLabel = computed(function getPricingLabel() {
  var type = props.directory.pricing_type;
  if (!type) return "Free";
  var labels = {
    free: "Free",
    paid: "Paid",
    freemium: "Freemium",
  };
  return labels[type.toLowerCase()] || "Free";
});

var pricingBadgeClasses = computed(function getPricingBadgeClasses() {
  var type = props.directory.pricing_type;
  var base = "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium";
  if (!type || type.toLowerCase() === "free") {
    return base + " bg-emerald-100 text-emerald-800";
  }
  if (type.toLowerCase() === "paid") {
    return base + " bg-orange-100 text-orange-800";
  }
  return base + " bg-blue-100 text-blue-800";
});

var drColorClass = computed(function getDrColorClass() {
  var dr = props.directory.domain_rating;
  if (!dr) return "text-gray-400";
  if (dr >= 80) return "text-green-600";
  if (dr >= 70) return "text-blue-600";
  if (dr >= 60) return "text-amber-600";
  return "text-gray-600";
});

var drBarClass = computed(function getDrBarClass() {
  var dr = props.directory.domain_rating;
  if (!dr) return "bg-gray-300";
  if (dr >= 80) return "bg-green-500";
  if (dr >= 70) return "bg-blue-500";
  if (dr >= 60) return "bg-amber-500";
  return "bg-gray-400";
});

var hasCategories = computed(function checkCategories() {
  return (
    props.directory.categories &&
    Array.isArray(props.directory.categories) &&
    props.directory.categories.length > 0
  );
});

var displayCategories = computed(function getDisplayCategories() {
  if (!hasCategories.value) return [];
  return props.directory.categories.slice(0, 2);
});

var remainingCategoriesCount = computed(function getRemainingCount() {
  if (!hasCategories.value) return 0;
  return Math.max(0, props.directory.categories.length - 2);
});

function formatNumber(num) {
  if (!num) return "—";
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return num.toString();
}

function formatTraffic(num) {
  if (!num) return "—";
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (num >= 1000) {
    return Math.round(num / 1000) + "K";
  }
  return num.toString();
}

function toggleFavorite() {
  if (!user.value) {
    window.location.href = "/auth";
    return;
  }
  toggleFav(props.directory.id, user.value);
}
</script>

<style scoped>
.directory-card {
  contain: layout style;
}

/* .metric-card {
  @apply bg-gray-50 rounded-lg p-2.5 sm:p-3 text-center;
} */

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@media (hover: hover) {
  .directory-card:hover {
    transform: translateY(-2px);
  }
}
</style>
