<template>
  <div class="review-section">
    <!-- Section Header -->
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-2">Reviews & Ratings</h2>

      <!-- Overall Rating Summary -->
      <div v-if="stats.reviewCount > 0" class="flex items-center space-x-4 mb-4 p-4 bg-gray-50 rounded-lg">
        <div class="text-center">
          <div class="text-4xl font-bold text-gray-900">{{ stats.averageRating.toFixed(1) }}</div>
          <StarRating
            :model-value="stats.averageRating"
            size="small"
            class="mt-1"
          />
          <div class="text-sm text-gray-500 mt-1">{{ stats.reviewCount }} review{{ stats.reviewCount !== 1 ? 's' : '' }}</div>
        </div>
      </div>
      <div v-else class="text-gray-500 mb-4">
        No reviews yet. Be the first to review!
      </div>
    </div>

    <!-- Write Review Section (authenticated users only) -->
    <div v-if="isAuthenticated" class="mb-8 p-6 bg-white border border-gray-200 rounded-lg">
      <h3 class="text-lg font-semibold mb-4">Write a Review</h3>
      <ReviewForm
        @submit="handleCreateReview"
        ref="reviewFormRef"
      />
    </div>

    <!-- Sign in prompt for unauthenticated users -->
    <div v-else class="mb-8 p-6 bg-gray-50 border border-gray-200 rounded-lg text-center">
      <p class="text-gray-600 mb-3">Sign in to write a review</p>
      <button
        @click="$emit('show-auth-modal')"
        class="btn-primary px-6 py-2 text-sm font-medium"
      >
        Sign In
      </button>
    </div>

    <!-- Sort Options -->
    <div v-if="reviews.length > 0" class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold">{{ reviews.length }} Review{{ reviews.length !== 1 ? 's' : '' }}</h3>
      <select
        v-model="sortBy"
        @change="loadReviews"
        class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
      >
        <option value="helpfulness">Most Helpful</option>
        <option value="recent">Most Recent</option>
        <option value="rating">Highest Rated</option>
      </select>
    </div>

    <!-- Loading State -->
    <div v-if="loading && reviews.length === 0" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <p class="text-gray-500 mt-2">Loading reviews...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="p-4 bg-red-50 border border-red-200 rounded-lg">
      <p class="text-red-600">{{ error }}</p>
      <button
        @click="loadReviews"
        class="mt-2 text-sm text-red-700 hover:text-red-900 underline"
      >
        Try again
      </button>
    </div>

    <!-- Reviews List -->
    <div v-else-if="reviews.length > 0" class="space-y-6">
      <ReviewItem
        v-for="review in reviews"
        :key="review.id"
        :review="review"
        :current-user-id="currentUserId"
        :ip-hash="ipHash"
        @vote="handleVote"
        @delete="handleDelete"
        @update="handleUpdate"
        @reply="handleReply"
        @flag="handleFlag"
      />
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-8 text-gray-500">
      <p>No reviews yet. Be the first to share your experience!</p>
    </div>

    <!-- Success Message -->
    <div
      v-if="successMessage"
      class="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in"
    >
      {{ successMessage }}
    </div>

    <!-- Error Toast -->
    <div
      v-if="errorToast"
      class="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in"
    >
      {{ errorToast }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useReviews } from '@/composables/useReviews'
import StarRating from './StarRating.vue'
import ReviewForm from './ReviewForm.vue'
import ReviewItem from './ReviewItem.vue'

const props = defineProps({
  directoryId: {
    type: String,
    required: true
  }
})

defineEmits(['show-auth-modal'])

const { user, isAuthenticated } = useAuth()
const {
  reviews,
  loading,
  error,
  fetchReviews,
  createReview,
  updateReview,
  deleteReview,
  voteReview,
  removeVote,
  flagReview,
  getReviewStats,
  generateIpHash
} = useReviews()

const reviewFormRef = ref(null)
const sortBy = ref('helpfulness')
const stats = ref({ averageRating: 0, reviewCount: 0 })
const ipHash = ref(null)
const successMessage = ref('')
const errorToast = ref('')

const currentUserId = computed(() => user.value?.id || null)

const loadReviews = async () => {
  await fetchReviews(props.directoryId, sortBy.value)
  stats.value = await getReviewStats(props.directoryId)
}

const showSuccessMessage = (message) => {
  successMessage.value = message
  setTimeout(() => {
    successMessage.value = ''
  }, 3000)
}

const showErrorToast = (message) => {
  errorToast.value = message
  setTimeout(() => {
    errorToast.value = ''
  }, 3000)
}

const handleCreateReview = async (formData) => {
  if (!currentUserId.value) {
    showErrorToast('You must be signed in to write a review')
    return
  }

  const result = await createReview(
    props.directoryId,
    currentUserId.value,
    formData.content,
    formData.rating
  )

  if (result) {
    showSuccessMessage('Review posted successfully!')
    reviewFormRef.value?.reset()
    await loadReviews()
  } else {
    showErrorToast('Failed to post review. Please try again.')
  }
}

const handleUpdate = async (data) => {
  if (!currentUserId.value) return

  const result = await updateReview(
    data.reviewId,
    currentUserId.value,
    data.content,
    data.rating
  )

  if (result) {
    showSuccessMessage('Review updated successfully!')
    await loadReviews()
  } else {
    showErrorToast('Failed to update review. Please try again.')
  }
}

const handleDelete = async (reviewId) => {
  if (!currentUserId.value) return

  const result = await deleteReview(reviewId, currentUserId.value)

  if (result) {
    showSuccessMessage('Review deleted successfully!')
    await loadReviews()
  } else {
    showErrorToast('Failed to delete review. Please try again.')
  }
}

const handleReply = async (data) => {
  if (!currentUserId.value) {
    showErrorToast('You must be signed in to reply')
    return
  }

  const result = await createReview(
    props.directoryId,
    currentUserId.value,
    data.content,
    null, // No rating for replies
    data.parentId
  )

  if (result) {
    showSuccessMessage('Reply posted successfully!')
    await loadReviews()
  } else {
    showErrorToast('Failed to post reply. Please try again.')
  }
}

const handleVote = async (data) => {
  const userId = currentUserId.value
  const hash = ipHash.value

  // If user is changing their vote, remove the old one first
  if (data.currentVote && data.currentVote !== data.voteType) {
    await removeVote(data.reviewId, userId, hash)
  }

  // If clicking the same vote type, remove it
  if (data.currentVote === data.voteType) {
    const result = await removeVote(data.reviewId, userId, hash)
    if (result) {
      await loadReviews()
    }
    return
  }

  // Add new vote
  const result = await voteReview(data.reviewId, userId, data.voteType, hash)

  if (result) {
    await loadReviews()
  } else {
    showErrorToast('Failed to vote. Please try again.')
  }
}

const handleFlag = async (data) => {
  const userId = currentUserId.value
  const hash = ipHash.value

  if (!userId && !hash) {
    showErrorToast('Unable to flag review')
    return
  }

  const result = await flagReview(data.reviewId, userId, data.reason, hash)

  if (result) {
    showSuccessMessage('Review flagged successfully!')
    await loadReviews()
  } else {
    showErrorToast('Failed to flag review. You may have already flagged this review.')
  }
}

// Initialize
onMounted(async () => {
  // Generate IP hash for anonymous users
  if (!currentUserId.value) {
    ipHash.value = await generateIpHash()
  }

  await loadReviews()
})

// Watch for directoryId changes
watch(() => props.directoryId, async () => {
  await loadReviews()
})
</script>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
