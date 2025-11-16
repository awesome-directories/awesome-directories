<template>
  <div class="card p-5 h-full flex flex-col relative">
    <!-- Checkbox for selection -->
    <input
      v-if="selectable"
      type="checkbox"
      :checked="isSelected"
      @change="$emit('toggle-select', directory)"
      class="absolute top-4 right-4 w-5 h-5 text-primary focus:ring-primary border-gray-300 rounded cursor-pointer"
    />

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
    <div
      class="flex items-center justify-between pt-4 border-t border-gray-100"
    >
      <div>
        <button
          v-if="directory?.helpful_count > 0"
          @click="handleHelpfulClick"
          :disabled="hasVoted"
          class="flex items-center space-x-1 text-sm text-gray-600 hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          :class="{ 'text-primary': hasVoted }"
        >
          <span>{{ hasVoted ? "✓" : "👍" }}</span>
          <span>{{ directory.helpful_count || 0 }} helpful</span>
        </button>
      </div>

      <a
        :href="`/directory/${directory.slug}`"
        class="text-sm font-medium text-primary hover:text-primary-dark transition-colors"
      >
        View Details →
      </a>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

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
});

const emit = defineEmits(["toggle-select", "vote"]);

const hasVoted = ref(false);

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

const handleHelpfulClick = async () => {
  if (hasVoted.value) return;

  emit("vote", props.directory);
};
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
