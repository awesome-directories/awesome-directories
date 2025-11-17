<template>
  <div>
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div
        class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"
      ></div>
      <p class="text-gray-600 mt-4">Loading your submissions...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="card p-8 text-center bg-red-50 border-red-200">
      <div class="text-6xl mb-4">⚠️</div>
      <h2 class="text-2xl font-bold text-gray-900 mb-2">Error Loading Submissions</h2>
      <p class="text-gray-700 mb-4">{{ error }}</p>
      <button @click="loadSubmissions" class="btn-primary">
        Try Again
      </button>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="submissions.length === 0"
      class="card p-8 text-center"
    >
      <div class="text-6xl mb-4">📝</div>
      <h2 class="text-2xl font-bold text-gray-900 mb-2">
        No Submissions Yet
      </h2>
      <p class="text-gray-600 mb-6">
        You haven't submitted any directories for review yet.
      </p>
      <a href="/submit" class="btn-primary">
        Submit Your First Directory
      </a>
    </div>

    <!-- Submissions List -->
    <div v-else class="space-y-4">
      <div
        v-for="submission in submissions"
        :key="submission.id"
        class="card p-6"
      >
        <div class="flex items-start justify-between mb-4">
          <div class="flex-1">
            <h3 class="text-xl font-bold text-gray-900 mb-2">
              {{ submission.name }}
            </h3>
            <a
              :href="submission.url"
              target="_blank"
              rel="noopener noreferrer"
              class="text-sm text-primary hover:text-primary-dark break-all"
            >
              {{ submission.url }}
            </a>
          </div>

          <!-- Status Badge -->
          <span
            :class="getStatusBadgeClass(submission.status)"
            class="badge text-xs font-semibold ml-4 flex-shrink-0"
          >
            {{ getStatusLabel(submission.status) }}
          </span>
        </div>

        <p class="text-gray-700 mb-4">{{ submission.description }}</p>

        <!-- Metadata Grid -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <div class="text-xs text-gray-500">Pricing</div>
            <div class="text-sm font-medium text-gray-900 capitalize">
              {{ submission.pricing_type }}
            </div>
          </div>

          <div v-if="submission.domain_rating">
            <div class="text-xs text-gray-500">Domain Rating</div>
            <div class="text-sm font-medium text-gray-900">
              {{ submission.domain_rating }}
            </div>
          </div>

          <div>
            <div class="text-xs text-gray-500">Dofollow</div>
            <div class="text-sm font-medium text-gray-900">
              {{ submission.is_dofollow ? "Yes" : "No" }}
            </div>
          </div>

          <div>
            <div class="text-xs text-gray-500">Submitted</div>
            <div class="text-sm font-medium text-gray-900">
              {{ formatDate(submission.submitted_at) }}
            </div>
          </div>
        </div>

        <!-- Categories -->
        <div v-if="submission.categories && submission.categories.length > 0" class="mb-4">
          <div class="text-xs text-gray-500 mb-2">Categories</div>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="category in submission.categories"
              :key="category"
              class="badge-gray text-xs"
            >
              {{ category }}
            </span>
          </div>
        </div>

        <!-- Admin Notes -->
        <div
          v-if="submission.admin_notes"
          class="p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
        >
          <div class="text-sm font-semibold text-gray-900 mb-1">
            Admin Notes:
          </div>
          <div class="text-sm text-gray-700">{{ submission.admin_notes }}</div>
        </div>

        <!-- Actions -->
        <div v-if="submission.status === 'pending'" class="mt-4 flex gap-2">
          <button
            @click="deleteSubmission(submission.id)"
            :disabled="deletingId === submission.id"
            class="btn-secondary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ deletingId === submission.id ? "Deleting..." : "Delete Submission" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { getPendingDirectories, deletePendingDirectory } from "@/lib/api-client";

const submissions = ref([]);
const loading = ref(true);
const error = ref("");
const deletingId = ref(null);

onMounted(() => {
  loadSubmissions();
});

const loadSubmissions = async () => {
  loading.value = true;
  error.value = "";

  try {
    const { data, error: fetchError } = await getPendingDirectories();

    if (fetchError) {
      error.value = fetchError.message || fetchError.error || "Failed to load submissions";
      return;
    }

    if (data) {
      submissions.value = data.pendingDirectories || [];
    }
  } catch (err) {
    console.error("Error loading submissions:", err);
    error.value = "An unexpected error occurred while loading submissions";
  } finally {
    loading.value = false;
  }
};

const deleteSubmission = async (id) => {
  if (!confirm("Are you sure you want to delete this submission?")) {
    return;
  }

  deletingId.value = id;

  try {
    const { error: deleteError } = await deletePendingDirectory(id);

    if (deleteError) {
      alert(deleteError.message || deleteError.error || "Failed to delete submission");
      return;
    }

    // Remove from local list
    submissions.value = submissions.value.filter((s) => s.id !== id);

    // Track deletion in analytics
    if (window.pirsch) {
      window.pirsch("Submission Deleted");
    }
  } catch (err) {
    console.error("Error deleting submission:", err);
    alert("An unexpected error occurred while deleting submission");
  } finally {
    deletingId.value = null;
  }
};

const getStatusBadgeClass = (status) => {
  switch (status) {
    case "pending":
      return "badge-blue";
    case "approved":
      return "badge-green";
    case "rejected":
      return "badge-orange";
    default:
      return "badge-gray";
  }
};

const getStatusLabel = (status) => {
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
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};
</script>
