<template>
  <button
    @click="handleVote"
    :disabled="isVoting || hasVoted"
    class="btn-secondary"
    :class="{ 'opacity-50': hasVoted, 'cursor-not-allowed': hasVoted || isVoting }"
  >
    <span v-if="isVoting">⏳ Voting...</span>
    <span v-else-if="hasVoted">✓ Marked Helpful</span>
    <span v-else>👍 Mark as Helpful</span>
    <span class="ml-2">({{ helpfulCount }})</span>
  </button>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { voteOnDirectory, checkVoteStatus } from "@/lib/api-client";

const props = defineProps({
  directoryId: {
    type: String,
    required: true,
  },
  initialCount: {
    type: Number,
    default: 0,
  },
});

const hasVoted = ref(false);
const helpfulCount = ref(props.initialCount);
const isVoting = ref(false);

// Check if user has already voted when component mounts
onMounted(async () => {
  try {
    const { data, error } = await checkVoteStatus(props.directoryId);
    if (!error && data) {
      hasVoted.value = data.voted;
    }
  } catch (error) {
    console.error("Error checking vote status:", error);
  }
});

const handleVote = async () => {
  if (hasVoted.value || isVoting.value) return;

  isVoting.value = true;

  try {
    const { data, error } = await voteOnDirectory(props.directoryId);

    if (error) {
      console.error("Error voting:", error);
      alert("Failed to vote. Please try again.");
      return;
    }

    if (data) {
      hasVoted.value = data.voted;
      helpfulCount.value = data.helpfulCount || helpfulCount.value;

      // Track analytics if Pirsch is available
      if (window.pirsch) {
        window.pirsch("Directory Helpful Vote", {
          directory: props.directoryId,
        });
      }
    }
  } catch (error) {
    console.error("Exception during vote:", error);
    alert("Failed to vote. Please try again.");
  } finally {
    isVoting.value = false;
  }
};
</script>
