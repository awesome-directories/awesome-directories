<template>
  <article
    class="directory-card group relative"
    :class="{ 'pending-state': isPendingSubmission }"
  >
    <div v-if="isPendingSubmission" class="pending-banner">
      <span class="pending-indicator"></span>
      Pending Review
    </div>

    <div class="card-content" :class="{ 'pt-10': isPendingSubmission }">
      <div class="flex items-start gap-3 sm:gap-4">
        <div class="flex-shrink-0">
          <div class="logo-container">
            <img
              v-if="directory.logo_url"
              :src="directory.logo_url"
              :alt="`${directory.name} logo`"
              class="w-full h-full object-cover"
              loading="lazy"
            />
            <span v-else class="logo-placeholder">
              {{ directory.name.charAt(0).toUpperCase() }}
            </span>
          </div>
        </div>

        <div class="flex-1 min-w-0">
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <h3 class="card-title">
                {{ directory.name }}
              </h3>
              <div class="flex items-center gap-2 mt-1 flex-wrap">
                <span
                  v-if="directory.is_dofollow"
                  class="badge badge-success"
                >
                  <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                  DoFollow
                </span>
                <span
                  v-else
                  class="badge badge-neutral"
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
              class="favorite-button"
              :class="{ 'is-favorited': isFavorited }"
              :aria-label="isFavorited ? 'Remove from favorites' : 'Add to favorites'"
              :aria-pressed="isFavorited"
            >
              <svg
                class="w-5 h-5"
                :class="isFavorited ? 'fill-current' : ''"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
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

          <p class="card-description">
            {{ directory.description || 'No description available.' }}
          </p>
        </div>
      </div>

      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-header">
            <svg class="w-4 h-4 metric-icon-dr" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
            </svg>
            <span class="metric-label">DR</span>
          </div>
          <div class="flex items-baseline gap-1">
            <span class="metric-value" :class="drColorClass">
              {{ directory.domain_rating || '—' }}
            </span>
            <div v-if="directory.domain_rating" class="dr-bar">
              <div
                class="dr-bar-fill"
                :class="drBarClass"
                :style="{ width: `${directory.domain_rating}%` }"
              ></div>
            </div>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-header">
            <svg class="w-4 h-4 metric-icon-traffic" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
            </svg>
            <span class="metric-label">Traffic</span>
          </div>
          <span class="metric-value">
            {{ formatTraffic(organicTraffic) }}
          </span>
        </div>

        <div class="metric-card">
          <div class="metric-header">
            <svg class="w-4 h-4 metric-icon-links" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
            </svg>
            <span class="metric-label">Links</span>
          </div>
          <span class="metric-value">
            {{ formatNumber(directory.backlinks_count) }}
          </span>
        </div>
      </div>

      <div v-if="hasCategories" class="categories-list">
        <span
          v-for="category in displayCategories"
          :key="category"
          class="category-tag"
        >
          {{ category }}
        </span>
        <span
          v-if="remainingCategoriesCount > 0"
          class="category-tag category-tag-more"
        >
          +{{ remainingCategoriesCount }}
        </span>
      </div>

      <div class="card-actions">
        <a
          :href="`/directory/${directory.slug}`"
          class="btn-primary flex-1"
        >
          <span>View Details</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        </a>
        <a
          :href="directory.submission_url || directory.url"
          target="_blank"
          rel="noopener noreferrer"
          class="btn-secondary-icon"
          aria-label="Visit directory website"
          @click.stop
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
          </svg>
        </a>
      </div>
    </div>

    <div
      v-if="showQuickStats"
      class="quick-stats"
    >
      <div class="quick-stat">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064"/>
        </svg>
        <span>{{ formatNumber(directory.referring_domains) }} ref. domains</span>
      </div>
      <div v-if="topCountry" class="quick-stat">
        <span class="text-base" aria-hidden="true">{{ countryFlag }}</span>
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
  var base = "badge";
  if (!type || type.toLowerCase() === "free") {
    return base + " badge-success";
  }
  if (type.toLowerCase() === "paid") {
    return base + " badge-warning";
  }
  return base + " badge-info";
});

var drColorClass = computed(function getDrColorClass() {
  var dr = props.directory.domain_rating;
  if (!dr) return "dr-none";
  if (dr >= 80) return "dr-high";
  if (dr >= 70) return "dr-good";
  if (dr >= 60) return "dr-medium";
  return "dr-low";
});

var drBarClass = computed(function getDrBarClass() {
  var dr = props.directory.domain_rating;
  if (!dr) return "dr-bar-none";
  if (dr >= 80) return "dr-bar-high";
  if (dr >= 70) return "dr-bar-good";
  if (dr >= 60) return "dr-bar-medium";
  return "dr-bar-low";
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
/* Card Container */
.directory-card {
  background-color: var(--color-bg-primary);
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-border-primary);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  contain: layout style;
  transition: box-shadow var(--duration-fast) var(--ease-default),
              border-color var(--duration-fast) var(--ease-default),
              transform var(--duration-fast) var(--ease-default);
}

.directory-card:hover {
  box-shadow: var(--shadow-lg);
  border-color: var(--color-brand-primary);
}

@media (hover: hover) {
  .directory-card:hover {
    transform: translateY(-2px);
  }
}

/* Pending State */
.directory-card.pending-state {
  border-color: var(--color-warning);
  box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.2);
}

.pending-banner {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background-color: var(--color-warning-bg);
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-warning-text);
  display: flex;
  align-items: center;
  gap: 0.375rem;
  border-bottom: 1px solid var(--color-warning);
}

.pending-indicator {
  width: 0.5rem;
  height: 0.5rem;
  background-color: var(--color-warning);
  border-radius: 9999px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Card Content */
.card-content {
  padding: 1rem;
}

@media (min-width: 640px) {
  .card-content {
    padding: 1.25rem;
  }
}

/* Logo Container */
.logo-container {
  width: 3rem;
  height: 3rem;
  border-radius: var(--radius-xl);
  background: linear-gradient(to bottom right, var(--color-bg-tertiary), var(--color-bg-secondary));
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 1px solid var(--color-border-primary);
}

@media (min-width: 640px) {
  .logo-container {
    width: 3.5rem;
    height: 3.5rem;
  }
}

.logo-placeholder {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text-tertiary);
}

@media (min-width: 640px) {
  .logo-placeholder {
    font-size: 1.5rem;
  }
}

/* Card Title */
.card-title {
  font-weight: 600;
  color: var(--color-text-primary);
  font-size: 1rem;
  line-height: 1.25;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color var(--duration-fast) var(--ease-default);
}

@media (min-width: 640px) {
  .card-title {
    font-size: 1.125rem;
  }
}

.directory-card:hover .card-title {
  color: var(--color-brand-primary);
}

/* Card Description */
.card-description {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  line-height: 1.625;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Badges */
.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.badge-success {
  background-color: var(--color-success-bg);
  color: var(--color-success-text);
}

.badge-warning {
  background-color: var(--color-warning-bg);
  color: var(--color-warning-text);
}

.badge-info {
  background-color: var(--color-info-bg);
  color: var(--color-info-text);
}

.badge-neutral {
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-tertiary);
}

/* Favorite Button */
.favorite-button {
  flex-shrink: 0;
  padding: 0.5rem;
  margin: -0.5rem;
  border-radius: var(--radius-lg);
  color: var(--color-text-tertiary);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background-color var(--duration-fast) var(--ease-default),
              color var(--duration-fast) var(--ease-default);
}

.favorite-button:hover {
  background-color: var(--color-bg-tertiary);
}

.favorite-button:focus-visible {
  outline: var(--ring-width) solid var(--ring-color);
  outline-offset: var(--ring-offset);
}

.favorite-button.is-favorited {
  color: #EF4444;
}

/* Metrics Grid */
.metrics-grid {
  margin-top: 1rem;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

@media (min-width: 640px) {
  .metrics-grid {
    gap: 0.75rem;
  }
}

.metric-card {
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  padding: 0.625rem;
}

@media (min-width: 640px) {
  .metric-card {
    padding: 0.75rem;
  }
}

.metric-header {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  margin-bottom: 0.25rem;
}

.metric-label {
  font-size: 0.75rem;
  color: var(--color-text-tertiary);
  font-weight: 500;
}

.metric-icon-dr { color: var(--color-info); }
.metric-icon-traffic { color: var(--color-brand-secondary); }
.metric-icon-links { color: var(--color-warning); }

.metric-value {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-text-primary);
}

@media (min-width: 640px) {
  .metric-value {
    font-size: 1.25rem;
  }
}

/* DR Colors */
.dr-none { color: var(--color-text-tertiary); }
.dr-high { color: var(--color-dr-high); }
.dr-good { color: var(--color-dr-good); }
.dr-medium { color: var(--color-dr-medium); }
.dr-low { color: var(--color-text-secondary); }

/* DR Bar */
.dr-bar {
  width: 100%;
  max-width: 2.5rem;
  height: 0.375rem;
  background-color: var(--color-bg-tertiary);
  border-radius: 9999px;
  overflow: hidden;
}

.dr-bar-fill {
  height: 100%;
  border-radius: 9999px;
  transition: width var(--duration-normal) var(--ease-default);
}

.dr-bar-none { background-color: var(--color-bg-tertiary); }
.dr-bar-high { background-color: var(--color-dr-high); }
.dr-bar-good { background-color: var(--color-dr-good); }
.dr-bar-medium { background-color: var(--color-dr-medium); }
.dr-bar-low { background-color: var(--color-text-tertiary); }

/* Categories */
.categories-list {
  margin-top: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  flex-wrap: wrap;
}

.category-tag {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-md);
  font-size: 0.75rem;
  font-weight: 500;
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-secondary);
  transition: background-color var(--duration-fast) var(--ease-default);
}

.category-tag:hover {
  background-color: var(--color-border-primary);
}

.category-tag-more {
  background-color: var(--color-bg-secondary);
  color: var(--color-text-tertiary);
}

/* Card Actions */
.card-actions {
  margin-top: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background-color: var(--color-brand-primary);
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: var(--radius-lg);
  text-decoration: none;
  transition: background-color var(--duration-fast) var(--ease-default);
}

.btn-primary:hover {
  background-color: var(--color-brand-primary-hover);
}

.btn-primary:focus-visible {
  outline: var(--ring-width) solid var(--ring-color);
  outline-offset: var(--ring-offset);
}

.btn-secondary-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.625rem;
  border: 1px solid var(--color-border-secondary);
  color: var(--color-text-secondary);
  border-radius: var(--radius-lg);
  text-decoration: none;
  transition: background-color var(--duration-fast) var(--ease-default),
              border-color var(--duration-fast) var(--ease-default),
              color var(--duration-fast) var(--ease-default);
}

.btn-secondary-icon:hover {
  background-color: var(--color-bg-tertiary);
  border-color: var(--color-text-tertiary);
  color: var(--color-text-primary);
}

.btn-secondary-icon:focus-visible {
  outline: var(--ring-width) solid var(--ring-color);
  outline-offset: var(--ring-offset);
}

/* Quick Stats */
.quick-stats {
  padding: 0.75rem 1rem;
  background-color: var(--color-bg-secondary);
  border-top: 1px solid var(--color-border-primary);
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  font-size: 0.75rem;
}

@media (min-width: 640px) {
  .quick-stats {
    padding: 0.75rem 1.25rem;
  }
}

.quick-stat {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-text-secondary);
}

.quick-stat svg {
  color: var(--color-text-tertiary);
}
</style>
