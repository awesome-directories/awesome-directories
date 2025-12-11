<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Auth Required Message -->
    <div v-if="!user" class="bg-white rounded-lg shadow-sm p-8 text-center">
      <div class="text-5xl mb-4">🔒</div>
      <h2 class="text-2xl font-bold text-gray-900 mb-2">
        Sign in to View Your Submissions
      </h2>
      <p class="text-gray-600 mb-6">
        You need to be signed in to view directories you've submitted for
        review.
      </p>
      <button @click="handleSignIn" class="btn-primary">Sign In</button>
    </div>

    <!-- Loading State -->
    <div v-else-if="isLoading" class="text-center py-12">
      <div
        class="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"
        role="status"
        aria-label="Loading"
      ></div>
      <p class="mt-4 text-gray-600">Loading your submissions...</p>
    </div>

    <!-- Main Content -->
    <div v-else>
      <!-- Stats Summary -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div
          class="bg-white rounded-xl sm:rounded-lg shadow-sm p-3 sm:p-4 text-center"
        >
          <div class="text-xl sm:text-2xl font-bold text-gray-900">
            {{ stats.total }}
          </div>
          <div class="text-xs text-gray-500 mt-1">Total Submitted</div>
        </div>
        <div
          class="bg-white rounded-xl sm:rounded-lg shadow-sm p-3 sm:p-4 text-center"
        >
          <div class="text-xl sm:text-2xl font-bold text-yellow-600">
            {{ stats.pending }}
          </div>
          <div class="text-xs text-gray-500 mt-1">Pending Review</div>
        </div>
        <div
          class="bg-white rounded-xl sm:rounded-lg shadow-sm p-3 sm:p-4 text-center"
        >
          <div class="text-xl sm:text-2xl font-bold text-green-600">
            {{ stats.approved }}
          </div>
          <div class="text-xs text-gray-500 mt-1">Approved</div>
        </div>
        <div
          class="bg-white rounded-xl sm:rounded-lg shadow-sm p-3 sm:p-4 text-center"
        >
          <div class="text-xl sm:text-2xl font-bold text-red-600">
            {{ stats.rejected }}
          </div>
          <div class="text-xs text-gray-500 mt-1">Rejected</div>
        </div>
      </div>

      <!-- Filter Bar -->
      <div
        class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6"
      >
        <div class="flex items-center gap-2">
          <label for="status-filter" class="text-sm text-gray-600"
            >Status:</label
          >
          <select
            id="status-filter"
            v-model="statusFilter"
            class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <a
          href="/submit"
          class="inline-flex items-center px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors"
        >
          <span class="mr-2">+</span> Submit New Directory
        </a>
      </div>

      <!-- Empty State -->
      <div
        v-if="submissions.length === 0"
        class="bg-white rounded-lg shadow-sm p-8 text-center"
      >
        <div class="text-5xl mb-4">📋</div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">
          No Submissions Yet
        </h2>
        <p class="text-gray-600 mb-6">
          Help grow our directory collection by submitting directories you know
          about.
        </p>
        <a href="/submit" class="btn-primary inline-block">
          Submit Your First Directory
        </a>
      </div>

      <!-- No Results for Filter -->
      <div
        v-else-if="filteredSubmissions.length === 0"
        class="bg-white rounded-lg shadow-sm p-8 text-center"
      >
        <div class="text-5xl mb-4">🔍</div>
        <h2 class="text-xl font-bold text-gray-900 mb-2">No Results</h2>
        <p class="text-gray-600 mb-4">
          No submissions match the selected filter.
        </p>
        <button
          @click="statusFilter = 'all'"
          class="text-primary hover:text-primary-dark font-medium"
        >
          Show All Submissions
        </button>
      </div>

      <!-- Submissions List -->
      <div v-else class="space-y-4">
        <div
          v-for="submission in filteredSubmissions"
          :key="submission.id"
          class="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
        >
          <!-- Header Row -->
          <div class="flex items-start justify-between gap-4 mb-4">
            <div class="flex items-start gap-4 flex-1 min-w-0">
              <!-- Logo/Initial -->
              <div
                v-if="submission.logo_url"
                class="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0"
              >
                <img
                  :src="submission.logo_url"
                  :alt="submission.name"
                  class="w-full h-full object-cover"
                />
              </div>
              <div
                v-else
                class="w-14 h-14 rounded-lg bg-gradient-to-br from-primary/10 to-blue-100 flex items-center justify-center text-2xl font-bold text-primary flex-shrink-0"
              >
                {{ submission.name.charAt(0).toUpperCase() }}
              </div>

              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-3 mb-1 flex-wrap">
                  <h3 class="font-bold text-lg text-gray-900">
                    {{ submission.name }}
                  </h3>
                  <span :class="getStatusBadgeClass(submission.status)">
                    {{ getStatusIcon(submission.status) }}
                    {{ getStatusLabel(submission.status) }}
                  </span>
                </div>

                <a
                  :href="submission.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-sm text-primary hover:underline inline-flex items-center gap-1"
                >
                  {{ submission.url }}
                  <svg
                    class="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </div>
            </div>

            <!-- Actions -->
            <div
              v-if="submission.status === 'pending'"
              class="flex items-center gap-1 sm:gap-2 flex-shrink-0"
            >
              <button
                @click="handleEdit(submission)"
                class="min-w-[44px] min-h-[44px] sm:min-w-[40px] sm:min-h-[40px] flex items-center justify-center text-gray-400 hover:text-primary active:text-primary transition-colors rounded-lg hover:bg-gray-50 active:bg-gray-100 touch-manipulation"
                title="Edit submission"
                aria-label="Edit submission"
              >
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
              <button
                @click="handleDelete(submission)"
                class="min-w-[44px] min-h-[44px] sm:min-w-[40px] sm:min-h-[40px] flex items-center justify-center text-gray-400 hover:text-red-600 active:text-red-600 transition-colors rounded-lg hover:bg-gray-50 active:bg-gray-100 touch-manipulation"
                title="Delete submission"
                aria-label="Delete submission"
              >
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>

          <!-- Description -->
          <p class="text-gray-700 mb-4">{{ submission.description }}</p>

          <!-- Meta Tags -->
          <div class="flex flex-wrap items-center gap-2 mb-4">
            <span
              v-if="submission.pricing_type"
              class="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full"
              :class="getPricingClass(submission.pricing_type)"
            >
              {{ formatPricing(submission) }}
            </span>

            <span
              class="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full"
              :class="
                submission.is_dofollow
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-700'
              "
            >
              {{ submission.is_dofollow ? "Dofollow" : "Nofollow" }}
            </span>

            <span
              v-for="category in (submission.categories || []).slice(0, 3)"
              :key="category"
              class="inline-flex items-center px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full"
            >
              {{ category }}
            </span>
            <span
              v-if="submission.categories && submission.categories.length > 3"
              class="text-xs text-gray-500"
            >
              +{{ submission.categories.length - 3 }} more
            </span>
          </div>

          <!-- Admin Notes (if reviewed) -->
          <div
            v-if="submission.admin_notes"
            class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4"
          >
            <p class="text-sm font-semibold text-blue-900 mb-1">
              {{ submission.status === "approved" ? "✅" : "📝" }} Reviewer
              Notes:
            </p>
            <p class="text-sm text-blue-800">
              {{ submission.admin_notes }}
            </p>
          </div>

          <!-- Footer Meta -->
          <div
            class="flex flex-wrap items-center gap-4 text-xs text-gray-500 pt-4 border-t border-gray-100"
          >
            <span> Submitted: {{ formatDate(submission.submitted_at) }} </span>
            <span v-if="submission.reviewed_at">
              Reviewed: {{ formatDate(submission.reviewed_at) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <div
      v-if="showEditModal"
      class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-modal-title"
      @keydown.escape="showEditModal = false"
    >
      <div
        class="fixed inset-0 bg-gray-900/75"
        @click="showEditModal = false"
        aria-hidden="true"
      ></div>

      <div
        class="relative bg-white rounded-t-2xl sm:rounded-xl shadow-xl w-full sm:max-w-2xl p-4 sm:p-6 max-h-[95vh] sm:max-h-[90vh] overflow-y-auto safe-area-inset-bottom"
      >
        <!-- Mobile drag indicator -->
        <div class="sm:hidden flex justify-center mb-3 -mt-1">
          <div class="w-10 h-1 bg-gray-300 rounded-full"></div>
        </div>
        <h3 id="edit-modal-title" class="text-lg font-bold text-gray-900 mb-4">
          Edit Submission
        </h3>

        <div class="space-y-4">
          <!-- Name -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Directory Name *</label
            >
            <input
              v-model="editForm.name"
              type="text"
              required
              maxlength="100"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <!-- URL -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Directory URL *</label
            >
            <input
              v-model="editForm.url"
              type="url"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Description *</label
            >
            <textarea
              v-model="editForm.description"
              required
              rows="3"
              maxlength="500"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            ></textarea>
            <p class="mt-1 text-xs text-gray-500">
              {{ editForm.description?.length || 0 }}/500 characters
            </p>
          </div>

          <!-- Submission URL -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Submission URL</label
            >
            <input
              v-model="editForm.submission_url"
              type="url"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="https://example.com/submit"
            />
          </div>

          <!-- Pricing Type -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Pricing Type *</label
            >
            <select
              v-model="editForm.pricing_type"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="free">Free</option>
              <option value="paid">Paid</option>
              <option value="freemium">Freemium</option>
            </select>
          </div>

          <!-- Pricing Amount -->
          <div v-if="editForm.pricing_type === 'paid'">
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Pricing Amount (USD)</label
            >
            <input
              v-model.number="editForm.pricing_amount"
              type="number"
              min="0"
              step="1"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <!-- Is Dofollow -->
          <div>
            <label class="flex items-center">
              <input
                v-model="editForm.is_dofollow"
                type="checkbox"
                class="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <span class="ml-2 text-sm text-gray-700"
                >This directory provides dofollow links</span
              >
            </label>
          </div>
        </div>

        <!-- Error Message -->
        <div
          v-if="editError"
          class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg"
        >
          <p class="text-sm text-red-600">{{ editError }}</p>
        </div>

        <div class="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6">
          <button
            @click="showEditModal = false"
            class="px-4 py-3 sm:py-2 text-gray-700 font-medium hover:text-gray-900 active:text-gray-900 min-h-[48px] sm:min-h-[44px] touch-manipulation rounded-xl sm:rounded-lg border border-gray-300 sm:border-0"
          >
            Cancel
          </button>
          <button
            @click="saveEdit"
            :disabled="isSaving"
            class="px-6 py-3 sm:py-2 bg-primary text-white font-medium rounded-xl sm:rounded-lg hover:bg-primary-dark active:bg-primary-dark transition-colors disabled:opacity-50 min-h-[48px] sm:min-h-[44px] touch-manipulation"
          >
            {{ isSaving ? "Saving..." : "Save Changes" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useStore } from "@nanostores/vue";
import { $user } from "@/stores/auth";
import { supabase } from "@/lib/supabase-client";
import { showAuthModal } from "@/utils/auth";
import { useToast } from "@/composables/useToast";
import log from "@/lib/logger";

var { error: showError, success: showSuccess } = useToast();

const user = useStore($user);
const submissions = ref([]);
const isLoading = ref(true);
const statusFilter = ref("all");

// Edit modal state
const showEditModal = ref(false);
const editingSubmission = ref(null);
const editForm = ref({});
const editError = ref("");
const isSaving = ref(false);

// Computed
const stats = computed(() => {
  const total = submissions.value.length;
  const pending = submissions.value.filter(
    (s) => s.status === "pending",
  ).length;
  const approved = submissions.value.filter(
    (s) => s.status === "approved",
  ).length;
  const rejected = submissions.value.filter(
    (s) => s.status === "rejected",
  ).length;

  return { total, pending, approved, rejected };
});

const filteredSubmissions = computed(() => {
  if (statusFilter.value === "all") {
    return submissions.value;
  }
  return submissions.value.filter((s) => s.status === statusFilter.value);
});

// Lifecycle
onMounted(async () => {
  if (user.value) {
    await loadSubmissions();
  }
  isLoading.value = false;
});

watch(user, async (newUser) => {
  if (newUser) {
    isLoading.value = true;
    await loadSubmissions();
    isLoading.value = false;
  }
});

// Methods
async function loadSubmissions() {
  try {
    const { data, error } = await supabase
      .from("pending_directories")
      .select("*")
      .eq("user_id", user.value.id)
      .order("submitted_at", { ascending: false });

    if (error) throw error;
    submissions.value = data || [];
    log.info(`Loaded ${submissions.value.length} directory submissions`);
  } catch (error) {
    log.error("Failed to load submissions:", error);
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

function getStatusIcon(status) {
  switch (status) {
    case "pending":
      return "⏳";
    case "approved":
      return "✓";
    case "rejected":
      return "✗";
    default:
      return "";
  }
}

function getStatusLabel(status) {
  switch (status) {
    case "pending":
      return "Pending Review";
    case "approved":
      return "Approved";
    case "rejected":
      return "Rejected";
    default:
      return status;
  }
}

function getPricingClass(pricingType) {
  switch (pricingType) {
    case "free":
      return "bg-green-100 text-green-800";
    case "paid":
      return "bg-purple-100 text-purple-800";
    case "freemium":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

function formatPricing(submission) {
  if (submission.pricing_type === "paid" && submission.pricing_amount) {
    return `$${submission.pricing_amount}`;
  }
  if (!submission.pricing_type) {
    return "N/A";
  }
  return (
    submission.pricing_type.charAt(0).toUpperCase() +
    submission.pricing_type.slice(1)
  );
}

function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function handleEdit(submission) {
  editingSubmission.value = submission;
  editForm.value = {
    name: submission.name,
    url: submission.url,
    description: submission.description,
    submission_url: submission.submission_url || "",
    pricing_type: submission.pricing_type,
    pricing_amount: submission.pricing_amount,
    is_dofollow: submission.is_dofollow,
  };
  editError.value = "";
  showEditModal.value = true;
}

async function saveEdit() {
  if (!editingSubmission.value) return;

  // Validate required fields
  if (
    !editForm.value.name?.trim() ||
    !editForm.value.url?.trim() ||
    !editForm.value.description?.trim()
  ) {
    editError.value = "Please fill in all required fields.";
    return;
  }

  // Validate URL format and protocol
  try {
    const url = new URL(editForm.value.url);
    if (!url.protocol.startsWith("http")) {
      editError.value = "URL must start with http:// or https://";
      return;
    }
  } catch (e) {
    editError.value = "Please enter a valid URL";
    return;
  }
  isSaving.value = true;
  editError.value = "";

  try {
    const updateData = {
      name: editForm.value.name.trim(),
      url: editForm.value.url.trim(),
      description: editForm.value.description.trim(),
      submission_url: editForm.value.submission_url?.trim() || null,
      pricing_type: editForm.value.pricing_type,
      pricing_amount:
        editForm.value.pricing_type === "paid"
          ? editForm.value.pricing_amount
          : null,
      is_dofollow: editForm.value.is_dofollow,
    };

    const { error } = await supabase
      .from("pending_directories")
      .update(updateData)
      .eq("id", editingSubmission.value.id)
      .eq("user_id", user.value.id);

    if (error) throw error;

    // Update local state
    const index = submissions.value.findIndex(
      (s) => s.id === editingSubmission.value.id,
    );
    if (index !== -1) {
      submissions.value[index] = {
        ...submissions.value[index],
        ...updateData,
      };
    }

    showEditModal.value = false;
    log.info("Submission updated successfully");
  } catch (error) {
    log.error("Failed to update submission:", error);
    editError.value = "Failed to update submission. Please try again.";
  } finally {
    isSaving.value = false;
  }
}

async function handleDelete(submission) {
  if (
    !confirm(
      `Are you sure you want to delete "${submission.name}"? This action cannot be undone.`,
    )
  ) {
    return;
  }

  try {
    const { error } = await supabase
      .from("pending_directories")
      .delete()
      .eq("id", submission.id)
      .eq("user_id", user.value.id);

    if (error) throw error;

    // Remove from local state
    submissions.value = submissions.value.filter((s) => s.id !== submission.id);
    log.info(`Deleted submission: ${submission.name}`);
    showSuccess("Submission deleted successfully");
  } catch (error) {
    log.error("Failed to delete submission:", error);
    showError("Failed to delete submission. Please try again.");
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

.safe-area-inset-bottom {
  padding-bottom: max(1.5rem, env(safe-area-inset-bottom));
}

@media (max-width: 640px) {
  .safe-area-inset-bottom {
    padding-bottom: max(2rem, env(safe-area-inset-bottom));
  }
}
</style>
