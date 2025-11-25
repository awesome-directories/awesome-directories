<template>
  <div class="space-y-4">
    <!-- User Actions Card -->
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

        <!-- Add to Project Button -->
        <button
          @click="handleAddToProject"
          :disabled="isPendingSubmission || !user"
          class="w-full inline-flex items-center justify-center px-6 py-3 text-base font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-300"
          :title="!user ? 'Sign in to track submissions' : 'Add to your project'"
        >
          <span class="text-xl mr-2">📋</span>
          <span>Track Submission</span>
        </button>
      </div>
    </div>

    <!-- Rating Card -->
    <div class="bg-white rounded-lg shadow-sm p-6">
      <h2 class="text-lg font-bold text-gray-900 mb-4">Rate this Directory</h2>

      <!-- Current Rating Display -->
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center space-x-2">
          <div class="flex">
            <span
              v-for="star in 5"
              :key="star"
              class="text-2xl"
              :class="star <= Math.floor(averageRating + 0.5) ? 'text-yellow-400' : 'text-gray-300'"
            >
              ★
            </span>
          </div>
          <span class="text-lg font-semibold text-gray-900">
            {{ averageRating ? averageRating.toFixed(1) : '—' }}
          </span>
        </div>
        <span class="text-sm text-gray-500">
          {{ ratingCount }} {{ ratingCount === 1 ? 'rating' : 'ratings' }}
        </span>
      </div>

      <!-- User Rating Input -->
      <div v-if="user && !isPendingSubmission" class="mb-4">
        <p class="text-sm text-gray-600 mb-2">Your rating:</p>
        <div class="flex items-center space-x-1">
          <button
            v-for="star in 5"
            :key="star"
            @click="handleRating(star)"
            @mouseenter="hoverRating = star"
            @mouseleave="hoverRating = 0"
            :disabled="isSubmittingRating"
            class="text-3xl transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 rounded disabled:opacity-50"
            :class="
              (hoverRating || userRating) >= star
                ? 'text-yellow-400'
                : 'text-gray-300'
            "
            :aria-label="`Rate ${star} star${star > 1 ? 's' : ''}`"
          >
            ★
          </button>
          <span v-if="userRating" class="ml-2 text-sm text-gray-500">
            ({{ userRating }}/5)
          </span>
        </div>
      </div>

      <!-- Sign in prompt -->
      <div v-else-if="!user" class="text-center py-2">
        <p class="text-sm text-gray-600 mb-2">Sign in to rate this directory</p>
        <button
          @click="handleSignIn"
          class="text-sm font-medium text-primary hover:text-primary-dark"
        >
          Sign In →
        </button>
      </div>
    </div>

    <!-- Reviews Section -->
    <div class="bg-white rounded-lg shadow-sm p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-bold text-gray-900">
          Reviews
          <span v-if="reviewCount > 0" class="text-gray-500 font-normal text-base">
            ({{ reviewCount }})
          </span>
        </h2>
      </div>

      <!-- Write Review Button -->
      <div v-if="user && !isPendingSubmission" class="mb-4">
        <button
          @click="showReviewForm = !showReviewForm"
          class="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
        >
          <span class="mr-2">✍️</span>
          {{ showReviewForm ? 'Cancel' : 'Write a Review' }}
        </button>

        <!-- Review Form -->
        <div v-if="showReviewForm" class="mt-4">
          <textarea
            v-model="newReview"
            rows="4"
            placeholder="Share your experience with this directory..."
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-sm"
            :disabled="isSubmittingReview"
          ></textarea>
          <div class="flex justify-end mt-2">
            <button
              @click="submitReview"
              :disabled="!newReview.trim() || isSubmittingReview"
              class="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isSubmittingReview ? 'Submitting...' : 'Submit Review' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Reviews List -->
      <div v-if="reviews.length > 0" class="space-y-4">
        <div
          v-for="review in reviews"
          :key="review.id"
          class="border-t border-gray-100 pt-4 first:border-t-0 first:pt-0"
        >
          <div class="flex items-start space-x-3">
            <div class="flex-shrink-0">
              <img
                v-if="review.user_avatar"
                :src="review.user_avatar"
                :alt="review.user_name"
                class="w-8 h-8 rounded-full"
              />
              <div
                v-else
                class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm font-medium"
              >
                {{ (review.user_name || 'U').charAt(0).toUpperCase() }}
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center space-x-2 mb-1">
                <span class="font-medium text-gray-900 text-sm">
                  {{ review.user_name || 'Anonymous' }}
                </span>
                <span v-if="review.rating" class="flex items-center text-sm">
                  <span class="text-yellow-400">★</span>
                  <span class="ml-0.5 text-gray-600">{{ review.rating }}</span>
                </span>
                <span class="text-xs text-gray-400">
                  {{ formatDate(review.created_at) }}
                </span>
              </div>
              <p class="text-gray-700 text-sm">{{ review.comment }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-4">
        <p class="text-gray-500 text-sm">No reviews yet. Be the first to share your experience!</p>
      </div>

      <!-- Load More -->
      <button
        v-if="hasMoreReviews"
        @click="loadMoreReviews"
        class="w-full mt-4 py-2 text-sm font-medium text-primary hover:text-primary-dark"
      >
        Load more reviews
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useStore } from "@nanostores/vue";
import { $user } from "@/stores/auth";
import { supabase } from "@/lib/supabase-client";
import { showAuthModal } from "@/utils/auth";
import FavoriteButton from "./FavoriteButton.vue";
import log from "@/lib/logger";

const props = defineProps({
  directoryId: {
    type: String,
    required: true,
  },
  averageRating: {
    type: Number,
    default: null,
  },
  ratingCount: {
    type: Number,
    default: 0,
  },
  reviewCount: {
    type: Number,
    default: 0,
  },
  isPendingSubmission: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["rating-updated", "review-added", "add-to-project"]);

const user = useStore($user);

// Rating state
const userRating = ref(0);
const hoverRating = ref(0);
const isSubmittingRating = ref(false);

// Review state
const reviews = ref([]);
const newReview = ref("");
const showReviewForm = ref(false);
const isSubmittingReview = ref(false);
const reviewsPage = ref(0);
const hasMoreReviews = ref(false);
const reviewsPerPage = 5;

onMounted(async () => {
  await loadUserRating();
  await loadReviews();
});

async function loadUserRating() {
  if (!user.value || !props.directoryId) return;

  try {
    const { data } = await supabase
      .from("directory_ratings")
      .select("rating")
      .eq("directory_id", props.directoryId)
      .eq("user_id", user.value.id)
      .maybeSingle();

    if (data) {
      userRating.value = data.rating;
    }
  } catch (error) {
    log.error("Failed to load user rating:", error);
  }
}

async function loadReviews() {
  if (!props.directoryId) return;

  try {
    const { data, error } = await supabase
      .from("directory_reviews")
      .select(`
        id,
        comment,
        created_at,
        user_id
      `)
      .eq("directory_id", props.directoryId)
      .not("comment", "is", null)
      .order("created_at", { ascending: false })
      .range(0, reviewsPerPage - 1);

    if (error) throw error;

    // Fetch user info and ratings separately
    const reviewsWithDetails = await Promise.all(
      (data || []).map(async (review) => {
        // Get user's rating for this directory
        const { data: ratingData } = await supabase
          .from("directory_ratings")
          .select("rating")
          .eq("directory_id", props.directoryId)
          .eq("user_id", review.user_id)
          .maybeSingle();

        return {
          ...review,
          rating: ratingData?.rating || null,
          user_name: "User", // Will be populated from auth metadata if available
          user_avatar: null,
        };
      })
    );

    reviews.value = reviewsWithDetails;
    hasMoreReviews.value = (data || []).length >= reviewsPerPage;
  } catch (error) {
    log.error("Failed to load reviews:", error);
  }
}

async function loadMoreReviews() {
  reviewsPage.value++;
  const offset = reviewsPage.value * reviewsPerPage;

  try {
    const { data, error } = await supabase
      .from("directory_reviews")
      .select(`
        id,
        comment,
        created_at,
        user_id
      `)
      .eq("directory_id", props.directoryId)
      .not("comment", "is", null)
      .order("created_at", { ascending: false })
      .range(offset, offset + reviewsPerPage - 1);

    if (error) throw error;

    const newReviewsWithDetails = await Promise.all(
      (data || []).map(async (review) => {
        const { data: ratingData } = await supabase
          .from("directory_ratings")
          .select("rating")
          .eq("directory_id", props.directoryId)
          .eq("user_id", review.user_id)
          .maybeSingle();

        return {
          ...review,
          rating: ratingData?.rating || null,
          user_name: "User",
          user_avatar: null,
        };
      })
    );

    reviews.value = [...reviews.value, ...newReviewsWithDetails];
    hasMoreReviews.value = (data || []).length >= reviewsPerPage;
  } catch (error) {
    log.error("Failed to load more reviews:", error);
  }
}

async function handleRating(stars) {
  if (!user.value || isSubmittingRating.value) return;

  try {
    isSubmittingRating.value = true;

    const { error } = await supabase
      .from("directory_ratings")
      .upsert({
        directory_id: props.directoryId,
        user_id: user.value.id,
        rating: stars,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "user_id,directory_id",
      });

    if (error) throw error;

    userRating.value = stars;
    emit("rating-updated", { directoryId: props.directoryId, rating: stars });
    log.info(`Rated directory ${props.directoryId} with ${stars} stars`);
  } catch (error) {
    log.error("Failed to submit rating:", error);
    alert("Failed to submit rating. Please try again.");
  } finally {
    isSubmittingRating.value = false;
  }
}

async function submitReview() {
  if (!user.value || !newReview.value.trim() || isSubmittingReview.value) return;

  try {
    isSubmittingReview.value = true;

    const { data, error } = await supabase
      .from("directory_reviews")
      .insert({
        directory_id: props.directoryId,
        user_id: user.value.id,
        comment: newReview.value.trim(),
      })
      .select()
      .single();

    if (error) throw error;

    // Add to local reviews list
    const newReviewObj = {
      ...data,
      rating: userRating.value || null,
      user_name: user.value.user_metadata?.full_name || user.value.email?.split("@")[0] || "You",
      user_avatar: user.value.user_metadata?.avatar_url || null,
    };

    reviews.value = [newReviewObj, ...reviews.value];
    newReview.value = "";
    showReviewForm.value = false;
    emit("review-added", { directoryId: props.directoryId });
    log.info(`Added review to directory ${props.directoryId}`);
  } catch (error) {
    log.error("Failed to submit review:", error);
    alert("Failed to submit review. Please try again.");
  } finally {
    isSubmittingReview.value = false;
  }
}

function handleSignIn() {
  showAuthModal();
}

function handleAddToProject() {
  if (!user.value) {
    showAuthModal();
    return;
  }
  emit("add-to-project", { directoryId: props.directoryId });
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short" });
}
</script>
