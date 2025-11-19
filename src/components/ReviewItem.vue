<template>
  <div class="review-item">
    <!-- Main Review Card -->
    <div class="flex space-x-3">
      <!-- Avatar -->
      <div class="flex-shrink-0">
        <div
          v-if="review.avatar_url"
          class="w-10 h-10 rounded-full overflow-hidden bg-gray-200"
        >
          <img
            :src="review.avatar_url"
            :alt="review.display_name"
            class="w-full h-full object-cover"
          />
        </div>
        <div
          v-else
          class="w-10 h-10 rounded-full bg-primary bg-opacity-20 flex items-center justify-center text-primary font-semibold"
        >
          {{ getInitials(review.display_name) }}
        </div>
      </div>

      <!-- Review Content -->
      <div class="flex-1 min-w-0">
        <!-- Header -->
        <div class="flex items-start justify-between mb-2">
          <div>
            <h4 class="font-semibold text-gray-900">{{ review.display_name }}</h4>
            <div class="flex items-center space-x-2 text-xs text-gray-500 mt-1">
              <span>{{ formatDate(review.created_at) }}</span>
              <span v-if="review.is_edited" class="text-gray-400">(edited)</span>
            </div>
          </div>

          <!-- Star Rating (only for top-level reviews) -->
          <div v-if="review.rating">
            <StarRating
              :model-value="review.rating"
              size="small"
              :show-value="true"
            />
          </div>
        </div>

        <!-- Review Text (or Edit Form) -->
        <div v-if="!isEditing" class="mb-3">
          <p class="text-gray-700 whitespace-pre-wrap break-words">{{ review.content }}</p>
        </div>

        <!-- Edit Form -->
        <div v-else class="mb-3">
          <ReviewForm
            :existing-review="review"
            :is-reply="!!review.parent_id"
            @submit="handleUpdateReview"
            @cancel="isEditing = false"
          />
        </div>

        <!-- Action Buttons -->
        <div v-if="!isEditing" class="flex items-center space-x-4 text-sm">
          <!-- Voting -->
          <div class="flex items-center space-x-2">
            <button
              @click="handleVote('upvote')"
              :class="userVote === 'upvote' ? 'text-primary font-semibold' : 'text-gray-500 hover:text-primary'"
              class="flex items-center space-x-1 transition-colors"
            >
              <span>↑</span>
              <span>{{ review.upvotes }}</span>
            </button>

            <button
              @click="handleVote('downvote')"
              :class="userVote === 'downvote' ? 'text-red-500 font-semibold' : 'text-gray-500 hover:text-red-500'"
              class="flex items-center space-x-1 transition-colors"
            >
              <span>↓</span>
              <span>{{ review.downvotes }}</span>
            </button>
          </div>

          <!-- Reply Button (only for top-level reviews) -->
          <button
            v-if="!review.parent_id && canReply"
            @click="showReplyForm = !showReplyForm"
            class="text-gray-600 hover:text-primary transition-colors font-medium"
          >
            {{ showReplyForm ? 'Cancel Reply' : 'Reply' }}
          </button>

          <!-- Edit Button (owner only) -->
          <button
            v-if="canEdit"
            @click="isEditing = true"
            class="text-gray-600 hover:text-primary transition-colors font-medium"
          >
            Edit
          </button>

          <!-- Delete Button (owner only) -->
          <button
            v-if="canDelete"
            @click="handleDelete"
            class="text-gray-600 hover:text-red-500 transition-colors font-medium"
          >
            Delete
          </button>

          <!-- Flag Button -->
          <button
            v-if="canFlag"
            @click="showFlagModal = true"
            :class="hasFlagged ? 'text-red-500' : 'text-gray-600 hover:text-red-500'"
            class="transition-colors font-medium"
          >
            {{ hasFlagged ? 'Flagged' : 'Flag' }}
          </button>

          <!-- Flag Count (if > 0) -->
          <span v-if="review.flag_count > 0" class="text-xs text-red-500">
            {{ review.flag_count }} flag{{ review.flag_count > 1 ? 's' : '' }}
          </span>
        </div>

        <!-- Reply Form -->
        <div v-if="showReplyForm && !isEditing" class="mt-4 pl-4 border-l-2 border-gray-200">
          <ReviewForm
            :is-reply="true"
            @submit="handleSubmitReply"
            @cancel="showReplyForm = false"
          />
        </div>

        <!-- Nested Replies -->
        <div v-if="review.replies && review.replies.length > 0" class="mt-4 space-y-4 pl-4 border-l-2 border-gray-200">
          <ReviewItem
            v-for="reply in review.replies"
            :key="reply.id"
            :review="reply"
            :current-user-id="currentUserId"
            :ip-hash="ipHash"
            :can-reply="false"
            @vote="$emit('vote', $event)"
            @delete="$emit('delete', $event)"
            @update="$emit('update', $event)"
            @reply="$emit('reply', $event)"
            @flag="$emit('flag', $event)"
          />
        </div>
      </div>
    </div>

    <!-- Flag Modal -->
    <div
      v-if="showFlagModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="showFlagModal = false"
    >
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-semibold mb-4">Flag Review</h3>
        <p class="text-sm text-gray-600 mb-4">
          Please select a reason for flagging this review:
        </p>

        <div class="space-y-2 mb-6">
          <label class="flex items-center space-x-2 cursor-pointer">
            <input
              v-model="flagReason"
              type="radio"
              value="spam"
              class="text-primary focus:ring-primary"
            />
            <span class="text-sm">Spam or advertising</span>
          </label>
          <label class="flex items-center space-x-2 cursor-pointer">
            <input
              v-model="flagReason"
              type="radio"
              value="offensive"
              class="text-primary focus:ring-primary"
            />
            <span class="text-sm">Offensive or abusive</span>
          </label>
          <label class="flex items-center space-x-2 cursor-pointer">
            <input
              v-model="flagReason"
              type="radio"
              value="inappropriate"
              class="text-primary focus:ring-primary"
            />
            <span class="text-sm">Inappropriate content</span>
          </label>
          <label class="flex items-center space-x-2 cursor-pointer">
            <input
              v-model="flagReason"
              type="radio"
              value="other"
              class="text-primary focus:ring-primary"
            />
            <span class="text-sm">Other</span>
          </label>
        </div>

        <div class="flex justify-end space-x-2">
          <button
            @click="showFlagModal = false"
            class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            Cancel
          </button>
          <button
            @click="handleFlag"
            :disabled="!flagReason"
            class="btn-primary px-4 py-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit Flag
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import StarRating from './StarRating.vue'
import ReviewForm from './ReviewForm.vue'
import { getUserVote, hasUserFlagged } from '@/stores/reviews'

const props = defineProps({
  review: {
    type: Object,
    required: true
  },
  currentUserId: {
    type: String,
    default: null
  },
  ipHash: {
    type: String,
    default: null
  },
  canReply: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['vote', 'delete', 'update', 'reply', 'flag'])

const isEditing = ref(false)
const showReplyForm = ref(false)
const showFlagModal = ref(false)
const flagReason = ref('')
const userVote = ref(null)
const hasFlagged = ref(false)

const canEdit = computed(() => {
  return props.currentUserId && props.currentUserId === props.review.user_id
})

const canDelete = computed(() => {
  return props.currentUserId && props.currentUserId === props.review.user_id
})

const canFlag = computed(() => {
  // Can't flag your own review
  return props.currentUserId !== props.review.user_id
})

const getInitials = (name) => {
  if (!name || typeof name !== 'string') return '?'
  // Split and filter out empty parts (e.g., extra spaces)
  const parts = name.split(' ').filter(part => part.length > 0)
  if (parts.length >= 2) {
    const first = parts[0][0] ? parts[0][0] : ''
    const second = parts[1][0] ? parts[1][0] : ''
    const initials = (first + second).toUpperCase()
    return initials || '?'
  }
  if (parts.length === 1 && parts[0].length > 0) {
    return parts[0].substring(0, 2).toUpperCase()
  }
  return '?'
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const handleVote = (voteType) => {
  emit('vote', {
    reviewId: props.review.id,
    voteType,
    currentVote: userVote.value
  })

  // Optimistic update
  if (userVote.value === voteType) {
    userVote.value = null
  } else {
    userVote.value = voteType
  }
}

const handleDelete = () => {
  if (confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
    emit('delete', props.review.id)
  }
}

const handleUpdateReview = (formData) => {
  emit('update', {
    reviewId: props.review.id,
    ...formData
  })
  isEditing.value = false
}

const handleSubmitReply = (formData) => {
  emit('reply', {
    parentId: props.review.id,
    ...formData
  })
  showReplyForm.value = false
}

const handleFlag = () => {
  if (!flagReason.value) return

  emit('flag', {
    reviewId: props.review.id,
    reason: flagReason.value
  })

  hasFlagged.value = true
  showFlagModal.value = false
  flagReason.value = ''
}

// Load user's vote status on mount
onMounted(async () => {
  if (props.currentUserId || props.ipHash) {
    userVote.value = await getUserVote(
      props.review.id,
      props.currentUserId,
      props.ipHash
    )

    hasFlagged.value = await hasUserFlagged(
      props.review.id,
      props.currentUserId,
      props.ipHash
    )
  }
})
</script>

<style scoped>
/* Ensure text wraps properly */
.whitespace-pre-wrap {
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
