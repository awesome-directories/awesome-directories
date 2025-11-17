<template>
  <div>
    <!-- Add New Submission Section -->
    <div class="card p-6 mb-8">
      <h2 class="text-xl font-bold text-gray-900 mb-4">
        Track New Submission
      </h2>
      <p class="text-sm text-gray-600 mb-4">
        Add a directory to track your submission progress
      </p>

      <form @submit.prevent="handleAddSubmission" class="space-y-4">
        <div>
          <label
            for="directory-select"
            class="block text-sm font-medium text-gray-700 mb-2"
          >
            Select Directory
          </label>
          <select
            id="directory-select"
            v-model="newSubmission.directoryId"
            required
            class="input"
          >
            <option value="">Choose a directory...</option>
            <option
              v-for="dir in availableDirectories"
              :key="dir.id"
              :value="dir.id"
            >
              {{ dir.name }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <div class="space-y-2">
            <label
              v-for="status in statusOptions"
              :key="status.value"
              class="flex items-center space-x-2 cursor-pointer"
            >
              <input
                v-model="newSubmission.status"
                type="radio"
                :value="status.value"
                required
                class="border-gray-300 text-primary focus:ring-primary"
              />
              <span class="text-sm text-gray-700">{{ status.label }}</span>
            </label>
          </div>
        </div>

        <div>
          <label
            for="notes"
            class="block text-sm font-medium text-gray-700 mb-2"
          >
            Notes (Optional)
          </label>
          <textarea
            id="notes"
            v-model="newSubmission.notes"
            rows="3"
            placeholder="Add any notes about this submission..."
            class="input"
          ></textarea>
        </div>

        <button
          type="submit"
          :disabled="isAdding"
          class="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isAdding ? "Adding..." : "Track Submission" }}
        </button>
      </form>
    </div>

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
      <h2 class="text-2xl font-bold text-gray-900 mb-2">
        Error Loading Submissions
      </h2>
      <p class="text-gray-700 mb-4">{{ error }}</p>
      <button @click="loadSubmissions" class="btn-primary">Try Again</button>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="submissions.length === 0"
      class="card p-8 text-center"
    >
      <div class="text-6xl mb-4">📊</div>
      <h2 class="text-2xl font-bold text-gray-900 mb-2">
        No Submissions Tracked Yet
      </h2>
      <p class="text-gray-600 mb-6">
        Start tracking your directory submissions to stay organized and never
        submit twice.
      </p>
      <p class="text-sm text-gray-500">
        Use the form above to add your first tracked submission.
      </p>
    </div>

    <!-- Submissions List -->
    <div v-else class="space-y-4">
      <!-- Count and Filter -->
      <div class="flex items-center justify-between mb-6">
        <div class="text-gray-600">
          {{ filteredSubmissions.length }} {{ filteredSubmissions.length === 1 ? 'submission' : 'submissions' }}
        </div>

        <!-- Status Filter -->
        <select
          v-model="statusFilter"
          class="input w-auto text-sm"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="submitted">Submitted</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <!-- Submissions Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="submission in filteredSubmissions"
          :key="submission.id"
          class="card p-6"
        >
          <!-- Header -->
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <h3 class="text-lg font-bold text-gray-900 mb-1">
                {{ submission.directory.name }}
              </h3>
              <a
                v-if="submission.directory.submission_url"
                :href="submission.directory.submission_url"
                target="_blank"
                rel="noopener noreferrer"
                class="text-sm text-primary hover:text-primary-dark"
              >
                Submit Here →
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

          <!-- Metadata -->
          <div class="mb-4 space-y-2 text-sm">
            <div class="flex items-center justify-between">
              <span class="text-gray-500">Submitted:</span>
              <span class="text-gray-900 font-medium">
                {{ formatDate(submission.submitted_at) }}
              </span>
            </div>
            <div
              v-if="submission.directory.avg_approval_days"
              class="flex items-center justify-between"
            >
              <span class="text-gray-500">Avg. Approval:</span>
              <span class="text-gray-900 font-medium">
                {{ submission.directory.avg_approval_days }} days
              </span>
            </div>
          </div>

          <!-- Notes -->
          <div v-if="submission.notes" class="mb-4">
            <div class="text-xs text-gray-500 mb-1">Notes:</div>
            <div class="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
              {{ submission.notes }}
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-2">
            <button
              @click="openEditModal(submission)"
              class="btn-secondary text-sm flex-1"
            >
              Edit
            </button>
            <button
              @click="deleteSubmission(submission.id)"
              :disabled="deletingId === submission.id"
              class="btn-secondary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ deletingId === submission.id ? "Deleting..." : "Delete" }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <div
      v-if="editingSubmission"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="closeEditModal"
    >
      <div class="card p-6 max-w-lg w-full">
        <h3 class="text-xl font-bold text-gray-900 mb-4">
          Edit Submission
        </h3>

        <form @submit.prevent="handleUpdateSubmission" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <div class="space-y-2">
              <label
                v-for="status in statusOptions"
                :key="status.value"
                class="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  v-model="editingSubmission.status"
                  type="radio"
                  :value="status.value"
                  class="border-gray-300 text-primary focus:ring-primary"
                />
                <span class="text-sm text-gray-700">{{ status.label }}</span>
              </label>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              v-model="editingSubmission.notes"
              rows="4"
              class="input"
              placeholder="Add notes about this submission..."
            ></textarea>
          </div>

          <div class="flex gap-2">
            <button
              type="submit"
              :disabled="isUpdating"
              class="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isUpdating ? "Saving..." : "Save Changes" }}
            </button>
            <button
              type="button"
              @click="closeEditModal"
              class="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import {
  getSubmissions,
  trackSubmission,
  deleteSubmission as deleteSubmissionAPI,
} from "@/lib/api-client";

const submissions = ref([]);
const availableDirectories = ref([]);
const loading = ref(true);
const error = ref("");
const isAdding = ref(false);
const isUpdating = ref(false);
const deletingId = ref(null);
const statusFilter = ref("all");
const editingSubmission = ref(null);

const statusOptions = [
  { value: "pending", label: "⏳ Pending - Planning to submit" },
  { value: "submitted", label: "📤 Submitted - Waiting for review" },
  { value: "approved", label: "✅ Approved - Successfully listed" },
  { value: "rejected", label: "❌ Rejected - Not approved" },
];

const newSubmission = ref({
  directoryId: "",
  status: "pending",
  notes: "",
});

const filteredSubmissions = computed(() => {
  if (statusFilter.value === "all") {
    return submissions.value;
  }
  return submissions.value.filter((s) => s.status === statusFilter.value);
});

onMounted(async () => {
  await Promise.all([loadSubmissions(), loadDirectories()]);
});

const loadSubmissions = async () => {
  loading.value = true;
  error.value = "";

  try {
    const { data, error: fetchError } = await getSubmissions();

    if (fetchError) {
      error.value =
        fetchError.message || fetchError.error || "Failed to load submissions";
      return;
    }

    if (data) {
      submissions.value = data.submissions || [];
    }
  } catch (err) {
    console.error("Error loading submissions:", err);
    error.value = "An unexpected error occurred while loading submissions";
  } finally {
    loading.value = false;
  }
};

const loadDirectories = async () => {
  try {
    // Load directories from the static JSON file
    const response = await fetch("/data/directories.json");
    const data = await response.json();
    availableDirectories.value = data || [];
  } catch (err) {
    console.error("Error loading directories:", err);
  }
};

const handleAddSubmission = async () => {
  isAdding.value = true;

  try {
    const { data, error: addError } = await trackSubmission({
      directoryId: newSubmission.value.directoryId,
      status: newSubmission.value.status,
      notes: newSubmission.value.notes || null,
    });

    if (addError) {
      alert(
        addError.message || addError.error || "Failed to track submission"
      );
      return;
    }

    // Refresh submissions list
    await loadSubmissions();

    // Reset form
    newSubmission.value = {
      directoryId: "",
      status: "pending",
      notes: "",
    };

    // Track in analytics
    if (window.pirsch) {
      window.pirsch("Submission Tracked");
    }
  } catch (err) {
    console.error("Error adding submission:", err);
    alert("An unexpected error occurred while tracking submission");
  } finally {
    isAdding.value = false;
  }
};

const handleUpdateSubmission = async () => {
  if (!editingSubmission.value) return;

  isUpdating.value = true;

  try {
    const { error: updateError } = await trackSubmission({
      directoryId: editingSubmission.value.directory_id,
      status: editingSubmission.value.status,
      notes: editingSubmission.value.notes || null,
    });

    if (updateError) {
      alert(
        updateError.message || updateError.error || "Failed to update submission"
      );
      return;
    }

    // Refresh submissions list
    await loadSubmissions();

    closeEditModal();

    // Track in analytics
    if (window.pirsch) {
      window.pirsch("Submission Updated");
    }
  } catch (err) {
    console.error("Error updating submission:", err);
    alert("An unexpected error occurred while updating submission");
  } finally {
    isUpdating.value = false;
  }
};

const deleteSubmission = async (id) => {
  const submission = submissions.value.find((s) => s.id === id);
  if (!confirm(`Remove tracking for ${submission?.directory?.name}?`)) {
    return;
  }

  deletingId.value = id;

  try {
    const { error: deleteError } = await deleteSubmissionAPI(
      submission.directory_id
    );

    if (deleteError) {
      alert(
        deleteError.message || deleteError.error || "Failed to delete submission"
      );
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

const openEditModal = (submission) => {
  editingSubmission.value = {
    ...submission,
    directory_id: submission.directory.id,
  };
};

const closeEditModal = () => {
  editingSubmission.value = null;
};

const getStatusBadgeClass = (status) => {
  switch (status) {
    case "pending":
      return "badge-blue";
    case "submitted":
      return "badge-orange";
    case "approved":
      return "badge-green";
    case "rejected":
      return "badge-gray";
    default:
      return "badge-gray";
  }
};

const getStatusLabel = (status) => {
  switch (status) {
    case "pending":
      return "⏳ Pending";
    case "submitted":
      return "📤 Submitted";
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
