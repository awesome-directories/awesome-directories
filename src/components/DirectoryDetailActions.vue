<template>
  <div class="bg-white rounded-lg shadow-sm p-6">
    <h2 class="text-lg font-bold text-gray-900 mb-4">Your Actions</h2>

    <div class="space-y-3">
      <!-- Favorite Button -->
      <FavoriteButton
        v-if="directoryId"
        :directoryId="directoryId"
        variant="large"
        showLabel
        :isDisabled="isPendingSubmission"
        :disabledReason="'Cannot favorite pending submissions'"
      />
    </div>
  </div>
</template>

<script setup>
import FavoriteButton from "./FavoriteButton.vue";

const props = defineProps({
  directoryId: {
    type: String,
    required: true,
  },
  isPendingSubmission: {
    type: Boolean,
    default: false,
  },
});
</script>
