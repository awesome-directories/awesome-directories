<template>
  <div class="card p-4 sm:p-5 h-full flex flex-col relative">
    <!-- Pending Submission Badge -->
    <div
      v-if="isPendingSubmission"
      class="absolute top-3 right-3 sm:top-4 sm:right-4 inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-300"
      title="This is your pending submission, visible only to you"
      aria-label="Pending Review"
    >
      ⏳ <span class="hidden sm:inline ml-1">Pending Review</span
      ><span class="sm:hidden ml-1">Pending</span>
    </div>

    <!-- Checkbox for selection -->
    <label
      v-if="selectable && !isPendingSubmission"
      class="absolute top-3 right-3 sm:top-4 sm:right-4 min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer touch-manipulation"
    >
      <input
        type="checkbox"
        :checked="isSelected"
        @change="$emit('toggle-select', directory)"
        class="w-6 h-6 sm:w-5 sm:h-5 text-primary focus:ring-primary border-gray-300 rounded cursor-pointer"
        :aria-label="`Select ${directory.name} for checklist`"
      />
    </label>

    <!-- Logo/Icon -->
    <div class="flex items-start space-x-4 mb-4">
      <div class="flex-shrink-0">
        <div
          v-if="directory.logo_url"
          class="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center"
        >
          <img
            :src="directory.logo_url"
            :alt="directory.name"
            class="w-full h-full object-cover"
            @error="handleImageError"
          />
        </div>
        <div
          v-else
          class="w-12 h-12 rounded-lg bg-primary bg-opacity-10 flex items-center justify-center text-2xl"
        >
          📂
        </div>
      </div>

      <div class="flex-1 min-w-0">
        <h3 class="font-bold text-lg text-gray-900 mb-1 truncate">
          {{ directory.name }}
        </h3>

        <div class="flex items-center flex-wrap gap-2">
          <!-- DR Badge -->
          <span
            v-if="directory.domain_rating"
            :class="drBadgeClass"
            class="badge text-xs font-semibold"
          >
            ⭐ DR: {{ directory.domain_rating }}
          </span>

          <!-- Dofollow Badge -->
          <span v-if="directory.is_dofollow" class="badge-green text-xs">
            🔗 Dofollow
          </span>
        </div>
      </div>
    </div>

    <!-- Description -->
    <p class="text-sm text-gray-600 mb-4 flex-grow line-clamp-3">
      {{ directory.description || "No description available." }}
    </p>

    <!-- Tags and Pricing -->
    <div class="flex items-center justify-between mb-4 flex-wrap gap-2">
      <div class="flex flex-wrap gap-1">
        <span
          v-for="category in displayCategories"
          :key="category"
          class="badge-gray text-xs"
        >
          {{ category }}
        </span>
      </div>

      <span
        v-if="directory.pricing_type"
        :class="pricingBadgeClass"
        class="badge text-xs font-medium"
      >
        {{ pricingLabel }}
      </span>
    </div>

    <!-- Footer -->
    <div class="pt-4 border-t border-gray-100">
      <div class="flex items-center justify-between mb-3">
        <!-- Rating Display -->
        <div class="flex items-center space-x-1 text-sm text-gray-600">
          <span v-if="directory.average_rating" class="flex items-center">
            <span class="text-yellow-500">★</span>
            <span class="ml-1 font-medium">{{
              directory.average_rating.toFixed(1)
            }}</span>
            <span class="text-gray-400 ml-1"
              >({{ directory.rating_count || 0 }})</span
            >
          </span>
          <span v-else class="text-gray-400">No ratings yet</span>
        </div>

        <FavoriteButton
          v-if="directory.id"
          :directoryId="directory.id"
          variant="icon-only"
          :isDisabled="isPendingSubmission"
          :disabledReason="'Cannot favorite pending submissions'"
          :initialFavorited="userFavoriteIds.includes(directory.id)"
        />
      </div>

      <a
        :href="`/directory/${directory.slug}`"
        class="inline-flex items-center justify-center w-full text-center text-sm font-medium text-primary hover:text-primary-dark active:text-primary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg py-3 sm:py-2 min-h-[48px] sm:min-h-[44px] touch-manipulation"
      >
        View Details →
      </a>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import FavoriteButton from "./FavoriteButton.vue";

const props = defineProps({
  directory: {
    type: Object,
    required: true,
  },
  selectable: {
    type: Boolean,
    default: false,
  },
  isSelected: {
    type: Boolean,
    default: false,
  },
  userFavoriteIds: {
    type: Array,
    default: () => [],
  },
  isPendingSubmission: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["toggle-select"]);

const drBadgeClass = computed(() => {
  const dr = props.directory.domain_rating;
  if (!dr) return "badge-gray";

  if (dr >= 80) return "badge-green";
  if (dr >= 70) return "badge-blue";
  if (dr >= 60) return "badge-orange";
  return "badge-gray";
});

const pricingBadgeClass = computed(() => {
  const pricing = props.directory.pricing_type;

  if (pricing === "free") return "badge-green";
  if (pricing === "paid") return "badge-orange";
  if (pricing === "freemium") return "badge-blue";
  return "badge-gray";
});

const pricingLabel = computed(() => {
  const pricing = props.directory.pricing_type;

  if (pricing === "free") return "💰 Free";
  if (pricing === "paid" && props.directory.pricing_amount) {
    return `💰 $${props.directory.pricing_amount}`;
  }
  if (pricing === "paid") return "💰 Paid";
  if (pricing === "freemium") return "💰 Freemium";
  return "";
});

const displayCategories = computed(() => {
  const cats = props.directory.categories || [];
  return cats.slice(0, 3);
});

const handleImageError = (e) => {
  e.target.style.display = "none";
};
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.touch-manipulation {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
</style>
