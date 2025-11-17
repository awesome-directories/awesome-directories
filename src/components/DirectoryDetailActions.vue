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

      <!-- Vote Button -->
      <button
        @click="handleVote"
        :disabled="isVoting || isPendingSubmission"
        class="w-full inline-flex items-center justify-center px-6 py-3 text-base font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        :class="
          hasVoted
            ? 'bg-primary text-white hover:bg-primary-dark'
            : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-300'
        "
        :title="
          isPendingSubmission
            ? 'Cannot vote on pending submissions'
            : hasVoted
              ? 'Remove vote'
              : 'Mark as helpful'
        "
      >
        <span class="text-xl mr-2">{{ hasVoted ? "✓" : "👍" }}</span>
        <span>{{ hasVoted ? "Marked Helpful" : "Mark as Helpful" }}</span>
      </button>

      <!-- Helpful Count Display -->
      <div
        v-if="helpfulCount > 0"
        class="text-center text-sm text-gray-600 pt-2"
      >
        <strong>{{ helpfulCount }}</strong>
        {{ helpfulCount === 1 ? "person" : "people" }} found this helpful
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useStore } from "@nanostores/vue";
import { $user } from "@/stores/auth";
import { useDirectory } from "@/composables/useDirectory";
import { requireAuth } from "@/utils/auth";
import FavoriteButton from "./FavoriteButton.vue";

const props = defineProps({
  directoryId: {
    type: String,
    required: true,
  },
  helpfulCount: {
    type: Number,
    default: 0,
  },
  isPendingSubmission: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["vote-updated"]);

const user = useStore($user);
const { voteDirectory, hasVoted: checkVoted } = useDirectory();

const hasVoted = ref(false);
const isVoting = ref(false);

// Check if user has voted on mount
onMounted(async () => {
  if (user.value && props.directoryId) {
    hasVoted.value = await checkVoted(props.directoryId, user.value);
  }
});

const handleVote = async () => {
  // Require authentication
  if (!requireAuth(user.value)) {
    return;
  }

  if (isVoting.value || props.isPendingSubmission) return;

  try {
    isVoting.value = true;

    const result = await voteDirectory(props.directoryId, user.value);

    if (result.success) {
      // Toggle vote state
      hasVoted.value = result.action === "added";

      // Emit event to parent
      emit("vote-updated", {
        directoryId: props.directoryId,
        action: result.action,
      });
    }
  } catch (error) {
    console.error("Failed to vote:", error);
  } finally {
    isVoting.value = false;
  }
};
</script>
