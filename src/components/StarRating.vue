<template>
  <div class="flex items-center space-x-1">
    <!-- Interactive Stars (for input) -->
    <div v-if="interactive" class="flex items-center">
      <button
        v-for="star in 5"
        :key="star"
        @click="handleStarClick(star)"
        @mouseenter="hoveredStar = star"
        @mouseleave="hoveredStar = 0"
        type="button"
        class="focus:outline-none transition-transform hover:scale-110"
        :class="size === 'small' ? 'text-lg' : size === 'large' ? 'text-3xl' : 'text-2xl'"
      >
        <span
          :class="getStarClass(star)"
        >
          ★
        </span>
      </button>
    </div>

    <!-- Display-only Stars -->
    <div v-else class="flex items-center">
      <span
        v-for="star in 5"
        :key="star"
        :class="[
          getStarClass(star),
          size === 'small' ? 'text-sm' : size === 'large' ? 'text-2xl' : 'text-base'
        ]"
      >
        ★
      </span>
    </div>

    <!-- Rating Value & Count -->
    <div v-if="showValue" class="flex items-center space-x-1">
      <span
        class="font-medium text-gray-700"
        :class="size === 'small' ? 'text-xs' : size === 'large' ? 'text-lg' : 'text-sm'"
      >
        {{ displayValue }}
      </span>
      <span
        v-if="reviewCount !== null"
        class="text-gray-400"
        :class="size === 'small' ? 'text-xs' : size === 'large' ? 'text-base' : 'text-sm'"
      >
        ({{ reviewCount }})
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  // Current rating value (0-5)
  modelValue: {
    type: Number,
    default: 0,
    validator: (value) => value >= 0 && value <= 5
  },
  // Enable interactive star selection
  interactive: {
    type: Boolean,
    default: false
  },
  // Show numeric value next to stars
  showValue: {
    type: Boolean,
    default: false
  },
  // Number of reviews (shown in parentheses)
  reviewCount: {
    type: Number,
    default: null
  },
  // Size variant: 'small', 'medium', 'large'
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  // Number of decimal places to show
  precision: {
    type: Number,
    default: 1,
    validator: (value) => value >= 0 && value <= 2
  }
})

const emit = defineEmits(['update:modelValue'])

const hoveredStar = ref(0)

const displayValue = computed(() => {
  return props.modelValue.toFixed(props.precision)
})

const getStarClass = (star) => {
  const activeStars = props.interactive && hoveredStar.value > 0
    ? hoveredStar.value
    : Math.round(props.modelValue)

  if (star <= activeStars) {
    return props.interactive && hoveredStar.value > 0
      ? 'text-yellow-300' // Lighter yellow on hover
      : 'text-yellow-400' // Standard yellow for filled stars
  }

  return 'text-gray-300' // Gray for empty stars
}

const handleStarClick = (star) => {
  if (!props.interactive) return
  emit('update:modelValue', star)
}
</script>

<style scoped>
/* Ensure stars render consistently */
span {
  line-height: 1;
  display: inline-block;
}

button {
  padding: 0;
  margin: 0;
  background: none;
  border: none;
  cursor: pointer;
}
</style>
