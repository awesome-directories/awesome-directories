<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Auth Required Message -->
    <div v-if="!user" class="bg-white rounded-lg shadow-sm p-8 text-center">
      <div class="text-5xl mb-4">🔒</div>
      <h2 class="text-2xl font-bold text-gray-900 mb-2">
        Sign in to View Submissions
      </h2>
      <p class="text-gray-600 mb-6">
        You need to be signed in to view and manage your directory submissions.
      </p>
      <button @click="handleSignIn" class="btn-primary">Sign In</button>
    </div>

    <!-- Loading State -->
    <div v-else-if="isLoading" class="text-center py-12">
      <div
        class="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"
      ></div>
      <p class="mt-4 text-gray-600">Loading your submissions...</p>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="submissions.length === 0"
      class="bg-white rounded-lg shadow-sm p-8 text-center"
    >
      <div class="text-5xl mb-4">📭</div>
      <h2 class="text-2xl font-bold text-gray-900 mb-2">No Submissions Yet</h2>
      <p class="text-gray-600 mb-6">
        You haven't submitted any directories for review yet.
      </p>
      <a href="/submit" class="btn-primary inline-block">
        Submit a Directory
      </a>
    </div>

    <!-- Submissions List -->
    <div v-else>
      <div class="mb-6 flex items-center justify-between flex-wrap gap-4">
        <p class="text-gray-700">
          You have
          <span class="font-semibold">{{ submissions.length }}</span>
          {{ submissions.length === 1 ? "submission" : "submissions" }}
        </p>

        <!-- Filter by Status -->
        <div class="flex items-center gap-2">
          <label for="status-filter" class="text-sm text-gray-600"
            >Filter:</label
          >
          <select
            id="status-filter"
            v-model="statusFilter"
            class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div class="space-y-4">
        <div
          v-for="submission in filteredSubmissions"
          :key="submission.id"
          class="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
        >
          <div class="flex items-start justify-between gap-4 mb-4">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-3 mb-2">
                <h3 class="font-bold text-xl text-gray-900">
                  {{ submission.name }}
                </h3>
                <span :class="getStatusBadgeClass(submission.status)">
                  {{ getStatusLabel(submission.status) }}
                </span>
              </div>

              <a
                :href="submission.url"
                target="_blank"
                rel="noopener noreferrer"
                class="text-sm text-primary hover:underline"
              >
                {{ submission.url }}
              </a>
            </div>

            <!-- Actions -->
            <div class="flex gap-2">
              <button
                v-if="submission.status === 'pending'"
                @click="handleEdit(submission)"
                class="text-sm text-gray-600 hover:text-primary transition-colors"
                title="Edit submission"
              >
                ✏️
              </button>
              <button
                v-if="submission.status === 'pending'"
                @click="handleDelete(submission.id)"
                class="text-sm text-gray-600 hover:text-red-600 transition-colors"
                title="Delete submission"
              >
                🗑️
              </button>
            </div>
          </div>

          <!-- Description -->
          <p class="text-gray-700 mb-4">{{ submission.description }}</p>

          <!-- Meta Information -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            <div>
              <p class="text-xs text-gray-500 mb-1">Pricing</p>
              <p class="text-sm font-medium text-gray-900">
                {{ submission.pricing_type || "N/A" }}
              </p>
            </div>

            <div>
              <p class="text-xs text-gray-500 mb-1">Link Type</p>
              <p class="text-sm font-medium text-gray-900">
                {{ submission.is_dofollow ? "Dofollow" : "Nofollow" }}
              </p>
            </div>

            <div>
              <p class="text-xs text-gray-500 mb-1">Submitted</p>
              <p class="text-sm font-medium text-gray-900">
                {{ formatDate(submission.submitted_at) }}
              </p>
            </div>

            <div v-if="submission.reviewed_at">
              <p class="text-xs text-gray-500 mb-1">Reviewed</p>
              <p class="text-sm font-medium text-gray-900">
                {{ formatDate(submission.reviewed_at) }}
              </p>
            </div>
          </div>

          <!-- Categories -->
          <div
            v-if="submission.categories && submission.categories.length > 0"
            class="flex flex-wrap gap-2 mb-4"
          >
            <span
              v-for="category in submission.categories"
              :key="category"
              class="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700"
            >
              {{ category }}
            </span>
          </div>

          <!-- Admin Notes -->
          <div
            v-if="submission.admin_notes"
            class="bg-blue-50 border border-blue-200 rounded-lg p-4"
          >
            <p class="text-sm font-semibold text-blue-900 mb-1">
              Reviewer Notes:
            </p>
            <p class="text-sm text-blue-800">{{ submission.admin_notes }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useStore } from "@nanostores/vue";
import { $user } from "@/stores/auth";
import { supabase } from "@/lib/supabase-client";
import { showAuthModal } from "@/utils/auth";
import log from "@/lib/logger";

const user = useStore($user);
const submissions = ref([]);
const isLoading = ref(true);
const statusFilter = ref("all");

const filteredSubmissions = computed(() => {
  if (statusFilter.value === "all") {
    return submissions.value;
  }
  return submissions.value.filter((s) => s.status === statusFilter.value);
});

onMounted(async () => {
  if (user.value) {
    await loadSubmissions();
  } else {
    isLoading.value = false;
  }
});

async function loadSubmissions() {
  try {
    isLoading.value = true;

    const { data, error } = await supabase
      .from("pending_directories")
      .select("*")
      .eq("user_id", user.value.id)
      .order("submitted_at", { ascending: false });

    if (error) throw error;

    submissions.value = data || [];
    log.info(`Loaded ${submissions.value.length} submissions`);
  } catch (error) {
    log.error("Failed to load submissions:", error);
  } finally {
    isLoading.value = false;
  }
}

function handleSignIn() {
  showAuthModal();
}

function getStatusBadgeClass(status) {
  const baseClass =
    "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold";

  switch (status) {
    case "pending":
      return `${baseClass} bg-yellow-100 text-yellow-800 border border-yellow-300`;
    case "approved":
      return `${baseClass} bg-green-100 text-green-800 border border-green-300`;
    case "rejected":
      return `${baseClass} bg-red-100 text-red-800 border border-red-300`;
    default:
      return `${baseClass} bg-gray-100 text-gray-800`;
  }
}

function getStatusLabel(status) {
  switch (status) {
    case "pending":
      return "⏳ Pending Review";
    case "approved":
      return "✅ Approved";
    case "rejected":
      return "❌ Rejected";
    default:
      return status;
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function handleEdit(submission) {
  // TODO: Implement edit functionality
  alert("Edit functionality coming soon!");
}

async function handleDelete(submissionId) {
  if (
    !confirm(
      "Are you sure you want to delete this submission? This action cannot be undone.",
    )
  ) {
    return;
  }

  try {
    const { error } = await supabase
      .from("pending_directories")
      .delete()
      .eq("id", submissionId)
      .eq("user_id", user.value.id); // Security: ensure user owns the submission

    if (error) throw error;

    // Remove from local state
    submissions.value = submissions.value.filter((s) => s.id !== submissionId);

    log.info(`Deleted submission: ${submissionId}`);
  } catch (error) {
    log.error("Failed to delete submission:", error);
    alert("Failed to delete submission. Please try again.");
  }
}
</script>

<style scoped>
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
