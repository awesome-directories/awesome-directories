<template>
  <div class="review-form">
    <div class="mb-4">
      <!-- Star Rating (only for top-level reviews, not replies) -->
      <div v-if="!isReply" class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Your Rating <span class="text-red-500">*</span>
        </label>
        <StarRating
          v-model="rating"
          :interactive="true"
          :show-value="true"
          size="large"
        />
        <p v-if="showRatingError" class="text-xs text-red-500 mt-1">
          Please select a rating
        </p>
      </div>

      <!-- Review Content -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          {{ isReply ? 'Your Reply' : 'Your Review' }}
          <span class="text-red-500">*</span>
        </label>
        <textarea
          v-model="content"
          :placeholder="isReply ? 'Share your thoughts...' : 'Share your experience with this directory...'"
          rows="4"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
          :class="{ 'border-red-500': showContentError }"
        ></textarea>
        <div class="flex justify-between items-center mt-1">
          <p v-if="showContentError" class="text-xs text-red-500">
            {{ isReply ? 'Reply' : 'Review' }} cannot be empty
          </p>
          <p class="text-xs text-gray-400 ml-auto">
            {{ content.length }} / 1000 characters
          </p>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex items-center justify-end space-x-2">
      <button
        v-if="!hideCancel"
        @click="handleCancel"
        type="button"
        class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
      >
        Cancel
      </button>
      <button
        @click="handleSubmit"
        :disabled="isSubmitting"
        type="button"
        class="btn-primary px-4 py-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ isSubmitting ? 'Submitting...' : submitButtonText }}
      </button>
    </div>

    <!-- Error Message -->
    <div v-if="errorMessage" class="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
      <p class="text-sm text-red-600">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import StarRating from './StarRating.vue'

const props = defineProps({
  // Existing review data (for editing)
  existingReview: {
    type: Object,
    default: null
  },
  // Is this a reply to another review?
  isReply: {
    type: Boolean,
    default: false
  },
  // Custom submit button text
  submitButtonText: {
    type: String,
    default: null
  },
  // Hide cancel button
  hideCancel: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['submit', 'cancel'])

const rating = ref(props.existingReview?.rating || 0)
const content = ref(props.existingReview?.content || '')
const isSubmitting = ref(false)
const errorMessage = ref('')
const showRatingError = ref(false)
const showContentError = ref(false)

// Watch for changes to existingReview prop (for edit mode)
watch(() => props.existingReview, (newValue) => {
  if (newValue) {
    rating.value = newValue.rating || 0
    content.value = newValue.content || ''
  }
}, { immediate: true })

const computedSubmitButtonText = computed(() => {
  if (props.submitButtonText) return props.submitButtonText
  if (props.existingReview) return 'Update'
  if (props.isReply) return 'Post Reply'
  return 'Post Review'
})

const validateForm = () => {
  let isValid = true
  showRatingError.value = false
  showContentError.value = false
  errorMessage.value = ''

  // Validate rating (only for top-level reviews)
  if (!props.isReply && rating.value === 0) {
    showRatingError.value = true
    isValid = false
  }

  // Validate content
  if (!content.value.trim()) {
    showContentError.value = true
    isValid = false
  }

  // Check length
  if (content.value.length > 1000) {
    errorMessage.value = 'Content cannot exceed 1000 characters'
    isValid = false
  }

  return isValid
}

const handleSubmit = async () => {
  if (!validateForm()) return

  isSubmitting.value = true
  errorMessage.value = ''

  try {
    const formData = {
      content: content.value.trim(),
      rating: props.isReply ? null : rating.value
    }

    emit('submit', formData)

    // Reset form if not editing
    if (!props.existingReview) {
      rating.value = 0
      content.value = ''
    }
  } catch (error) {
    errorMessage.value = error.message || 'Failed to submit. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}

const handleCancel = () => {
  // Reset form
  if (props.existingReview) {
    rating.value = props.existingReview.rating || 0
    content.value = props.existingReview.content || ''
  } else {
    rating.value = 0
    content.value = ''
  }

  showRatingError.value = false
  showContentError.value = false
  errorMessage.value = ''

  emit('cancel')
}

// Expose reset method for parent components
defineExpose({
  reset: () => {
    rating.value = 0
    content.value = ''
    isSubmitting.value = false
    errorMessage.value = ''
    showRatingError.value = false
    showContentError.value = false
  }
})
</script>

<style scoped>
textarea:focus {
  outline: none;
}
</style>
