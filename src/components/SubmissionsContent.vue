<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Auth Required Message -->
    <div v-if="!user" class="bg-white rounded-lg shadow-sm p-8 text-center">
      <div class="text-5xl mb-4">🔒</div>
      <h2 class="text-2xl font-bold text-gray-900 mb-2">
        Sign in to Track Submissions
      </h2>
      <p class="text-gray-600 mb-6">
        Create projects and track your directory submissions across multiple products.
      </p>
      <button @click="handleSignIn" class="btn-primary">Sign In</button>
    </div>

    <!-- Loading State -->
    <div v-else-if="isLoading" class="text-center py-12">
      <div
        class="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"
      ></div>
      <p class="mt-4 text-gray-600">Loading your projects...</p>
    </div>

    <!-- Main Content -->
    <div v-else>
      <!-- Header with Project Selector -->
      <div class="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 mb-1">Submission Tracker</h1>
          <p class="text-gray-600 text-sm">Track where you've submitted your products</p>
        </div>

        <div class="flex items-center gap-3">
          <!-- Project Selector -->
          <div class="relative" v-if="projects.length > 0">
            <select
              v-model="selectedProjectId"
              @change="onProjectChange"
              class="appearance-none pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm font-medium bg-white focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer"
            >
              <option v-for="project in projects" :key="project.id" :value="project.id">
                {{ project.name }}
              </option>
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <!-- Create Project Button -->
          <button
            @click="showCreateProject = true"
            class="inline-flex items-center px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors"
          >
            <span class="mr-2">+</span> New Project
          </button>
        </div>
      </div>

      <!-- No Projects State -->
      <div v-if="projects.length === 0" class="bg-white rounded-lg shadow-sm p-8 text-center">
        <div class="text-5xl mb-4">📋</div>
        <h2 class="text-xl font-bold text-gray-900 mb-2">Create Your First Project</h2>
        <p class="text-gray-600 mb-6">
          Start tracking your directory submissions by creating a project for your product.
        </p>
        <button @click="showCreateProject = true" class="btn-primary">
          Create Project
        </button>
      </div>

      <!-- Project Content -->
      <div v-else>
        <!-- Project Stats -->
        <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          <div class="bg-white rounded-lg shadow-sm p-4 text-center">
            <div class="text-2xl font-bold text-gray-900">{{ submissionStats.total }}</div>
            <div class="text-xs text-gray-500 mt-1">Total Tracked</div>
          </div>
          <div class="bg-white rounded-lg shadow-sm p-4 text-center">
            <div class="text-2xl font-bold text-yellow-600">{{ submissionStats.in_progress }}</div>
            <div class="text-xs text-gray-500 mt-1">In Progress</div>
          </div>
          <div class="bg-white rounded-lg shadow-sm p-4 text-center">
            <div class="text-2xl font-bold text-blue-600">{{ submissionStats.submitted }}</div>
            <div class="text-xs text-gray-500 mt-1">Submitted</div>
          </div>
          <div class="bg-white rounded-lg shadow-sm p-4 text-center">
            <div class="text-2xl font-bold text-green-600">{{ submissionStats.approved }}</div>
            <div class="text-xs text-gray-500 mt-1">Approved</div>
          </div>
          <div class="bg-white rounded-lg shadow-sm p-4 text-center">
            <div class="text-2xl font-bold text-red-600">{{ submissionStats.rejected }}</div>
            <div class="text-xs text-gray-500 mt-1">Rejected</div>
          </div>
          <div class="bg-white rounded-lg shadow-sm p-4 text-center">
            <div class="text-2xl font-bold text-purple-600">{{ submissionStats.featured }}</div>
            <div class="text-xs text-gray-500 mt-1">Featured</div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="flex items-center gap-4 mb-6 border-b border-gray-200">
          <button
            @click="activeTab = 'submissions'"
            :class="[
              'px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px',
              activeTab === 'submissions'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            ]"
          >
            Submissions
          </button>
          <button
            @click="activeTab = 'pending'"
            :class="[
              'px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px',
              activeTab === 'pending'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            ]"
          >
            My Directory Submissions
            <span v-if="pendingDirectories.length > 0" class="ml-1 px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded-full">
              {{ pendingDirectories.length }}
            </span>
          </button>
          <button
            @click="activeTab = 'settings'"
            :class="[
              'px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px',
              activeTab === 'settings'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            ]"
          >
            Project Settings
          </button>
        </div>

        <!-- Submissions Tab -->
        <div v-if="activeTab === 'submissions'">
          <!-- Filter Bar -->
          <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
            <div class="flex items-center gap-2">
              <label for="status-filter" class="text-sm text-gray-600">Status:</label>
              <select
                id="status-filter"
                v-model="statusFilter"
                class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">All</option>
                <option value="not_started">Not Started</option>
                <option value="in_progress">In Progress</option>
                <option value="submitted">Submitted</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="featured">Featured</option>
              </select>
            </div>

            <button
              @click="showAddSubmission = true"
              class="text-sm font-medium text-primary hover:text-primary-dark"
            >
              + Track New Directory
            </button>

            <div class="flex-1"></div>

            <button
              @click="handleExport"
              class="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              📥 Export CSV
            </button>
          </div>

          <!-- Submissions List -->
          <div v-if="filteredSubmissions.length > 0" class="space-y-3">
            <div
              v-for="submission in filteredSubmissions"
              :key="submission.id"
              class="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
            >
              <div class="flex items-start justify-between gap-4">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-3 mb-2">
                    <h3 class="font-semibold text-gray-900">
                      {{ getDirectoryName(submission.directory_id) }}
                    </h3>
                    <select
                      :value="submission.status"
                      @change="updateStatus(submission.id, $event.target.value)"
                      :class="getStatusSelectClass(submission.status)"
                      class="text-xs font-semibold px-2 py-1 rounded-full border-0 cursor-pointer focus:ring-2 focus:ring-primary"
                    >
                      <option value="not_started">Not Started</option>
                      <option value="in_progress">In Progress</option>
                      <option value="submitted">Submitted</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="featured">Featured</option>
                    </select>
                  </div>

                  <!-- Submission Link -->
                  <div class="flex items-center gap-2 mb-2">
                    <input
                      type="url"
                      :value="submission.submission_link || ''"
                      @blur="updateSubmissionLink(submission.id, $event.target.value)"
                      placeholder="Add your submission link (e.g., producthunt.com/products/yourapp)"
                      class="flex-1 text-sm px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <a
                      v-if="submission.submission_link"
                      :href="submission.submission_link"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="text-primary hover:text-primary-dark"
                      title="Open submission link"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>

                  <!-- Notes -->
                  <div v-if="submission.notes" class="text-sm text-gray-600 mb-2">
                    {{ submission.notes }}
                  </div>

                  <!-- Meta -->
                  <div class="flex items-center gap-4 text-xs text-gray-500">
                    <span v-if="submission.submitted_at">
                      Submitted: {{ formatDate(submission.submitted_at) }}
                    </span>
                    <span>
                      Added: {{ formatDate(submission.created_at) }}
                    </span>
                  </div>
                </div>

                <button
                  @click="deleteSubmission(submission.id)"
                  class="text-gray-400 hover:text-red-600 transition-colors"
                  title="Remove tracking"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="bg-gray-50 rounded-lg p-8 text-center">
            <p class="text-gray-600 mb-4">No submissions tracked yet for this project.</p>
            <button
              @click="showAddSubmission = true"
              class="text-sm font-medium text-primary hover:text-primary-dark"
            >
              + Track Your First Submission
            </button>
          </div>
        </div>

        <!-- Pending Directory Submissions Tab -->
        <div v-if="activeTab === 'pending'">
          <div v-if="pendingDirectories.length > 0" class="space-y-4">
            <div
              v-for="submission in pendingDirectories"
              :key="submission.id"
              class="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div class="flex items-start justify-between gap-4 mb-4">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-3 mb-2">
                    <h3 class="font-bold text-xl text-gray-900">
                      {{ submission.name }}
                    </h3>
                    <span :class="getPendingStatusBadgeClass(submission.status)">
                      {{ getPendingStatusLabel(submission.status) }}
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

          <div v-else class="bg-gray-50 rounded-lg p-8 text-center">
            <p class="text-gray-600 mb-4">You haven't submitted any directories for review yet.</p>
            <a href="/submit" class="btn-primary inline-block">
              Submit a Directory
            </a>
          </div>
        </div>

        <!-- Project Settings Tab -->
        <div v-if="activeTab === 'settings'" class="bg-white rounded-lg shadow-sm p-6">
          <h3 class="text-lg font-bold text-gray-900 mb-6">Project Settings</h3>

          <div class="space-y-4 max-w-md">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
              <input
                v-model="editingProject.name"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
              <input
                v-model="editingProject.url"
                type="url"
                placeholder="https://yourproduct.com"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                v-model="editingProject.description"
                rows="3"
                placeholder="Brief description of your product"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              ></textarea>
            </div>

            <div class="flex items-center gap-3 pt-4">
              <button
                @click="saveProjectSettings"
                :disabled="isSaving"
                class="px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                {{ isSaving ? 'Saving...' : 'Save Changes' }}
              </button>

              <button
                @click="confirmDeleteProject"
                class="px-4 py-2 text-red-600 font-medium hover:text-red-700 transition-colors"
              >
                Delete Project
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Project Modal -->
    <div
      v-if="showCreateProject"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        class="fixed inset-0 bg-gray-900 bg-opacity-75"
        @click="showCreateProject = false"
      ></div>

      <div class="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 class="text-lg font-bold text-gray-900 mb-4">Create New Project</h3>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Project Name *</label>
            <input
              v-model="newProject.name"
              type="text"
              placeholder="My Awesome SaaS"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
            <input
              v-model="newProject.url"
              type="url"
              placeholder="https://yourproduct.com"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              v-model="newProject.description"
              rows="2"
              placeholder="Brief description"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            ></textarea>
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-6">
          <button
            @click="showCreateProject = false"
            class="px-4 py-2 text-gray-700 font-medium hover:text-gray-900"
          >
            Cancel
          </button>
          <button
            @click="createProject"
            :disabled="!newProject.name || isCreating"
            class="px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {{ isCreating ? 'Creating...' : 'Create Project' }}
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
import { useProjects } from "@/composables/useProjects";
import { supabase } from "@/lib/supabase-client";
import { showAuthModal } from "@/utils/auth";
import Papa from "papaparse";
import log from "@/lib/logger";

const user = useStore($user);

const {
  isLoading: projectsLoading,
  projects,
  currentProject,
  projectSubmissions,
  loadProjects,
  createProject: createProjectApi,
  updateProject,
  deleteProject: deleteProjectApi,
  loadProjectSubmissions,
  updateSubmissionStatus: updateStatusApi,
  updateSubmissionLink: updateLinkApi,
  deleteSubmission: deleteSubmissionApi,
  getSubmissionStats,
} = useProjects();

// State
const isLoading = ref(true);
const activeTab = ref("submissions");
const statusFilter = ref("all");
const selectedProjectId = ref(null);
const pendingDirectories = ref([]);
const directories = ref([]);

// Project creation
const showCreateProject = ref(false);
const isCreating = ref(false);
const newProject = ref({ name: "", url: "", description: "" });

// Project editing
const editingProject = ref({ name: "", url: "", description: "" });
const isSaving = ref(false);

// Add submission
const showAddSubmission = ref(false);

// Computed
const submissionStats = computed(() => {
  if (!selectedProjectId.value) return { total: 0, not_started: 0, in_progress: 0, submitted: 0, approved: 0, rejected: 0, featured: 0 };
  return getSubmissionStats(selectedProjectId.value);
});

const filteredSubmissions = computed(() => {
  let filtered = projectSubmissions.value;

  if (statusFilter.value !== "all") {
    filtered = filtered.filter((s) => s.status === statusFilter.value);
  }

  return filtered;
});

// Lifecycle
onMounted(async () => {
  if (user.value) {
    await loadData();
  }
  isLoading.value = false;
});

watch(user, async (newUser) => {
  if (newUser) {
    await loadData();
  }
});

// Methods
async function loadData() {
  try {
    isLoading.value = true;

    // Load projects
    await loadProjects(user.value);

    if (projects.value.length > 0) {
      selectedProjectId.value = projects.value[0].id;
      editingProject.value = { ...projects.value[0] };
      await loadProjectSubmissions(selectedProjectId.value);
    }

    // Load pending directory submissions
    await loadPendingDirectories();

    // Load directories for name lookup
    await loadDirectories();
  } catch (error) {
    log.error("Failed to load data:", error);
  } finally {
    isLoading.value = false;
  }
}

async function loadPendingDirectories() {
  try {
    const { data, error } = await supabase
      .from("pending_directories")
      .select("*")
      .eq("user_id", user.value.id)
      .order("submitted_at", { ascending: false });

    if (error) throw error;
    pendingDirectories.value = data || [];
  } catch (error) {
    log.error("Failed to load pending directories:", error);
  }
}

async function loadDirectories() {
  try {
    const response = await fetch("/data/directories.json");
    directories.value = await response.json();
  } catch (error) {
    log.error("Failed to load directories:", error);
  }
}

function handleSignIn() {
  showAuthModal();
}

async function onProjectChange() {
  if (selectedProjectId.value) {
    const project = projects.value.find((p) => p.id === selectedProjectId.value);
    if (project) {
      editingProject.value = { ...project };
    }
    await loadProjectSubmissions(selectedProjectId.value);
  }
}

async function createProject() {
  if (!newProject.value.name) return;

  isCreating.value = true;
  try {
    const result = await createProjectApi(user.value, newProject.value);
    if (result.success) {
      selectedProjectId.value = result.project.id;
      editingProject.value = { ...result.project };
      showCreateProject.value = false;
      newProject.value = { name: "", url: "", description: "" };
    } else {
      alert(result.error || "Failed to create project");
    }
  } catch (error) {
    log.error("Failed to create project:", error);
    alert("Failed to create project");
  } finally {
    isCreating.value = false;
  }
}

async function saveProjectSettings() {
  if (!selectedProjectId.value) return;

  isSaving.value = true;
  try {
    const result = await updateProject(selectedProjectId.value, editingProject.value);
    if (!result.success) {
      alert(result.error || "Failed to save settings");
    }
  } catch (error) {
    log.error("Failed to save project settings:", error);
    alert("Failed to save settings");
  } finally {
    isSaving.value = false;
  }
}

async function confirmDeleteProject() {
  if (!selectedProjectId.value) return;

  const project = projects.value.find((p) => p.id === selectedProjectId.value);
  if (!confirm(`Are you sure you want to delete "${project?.name}"? This will also delete all submission tracking data for this project.`)) {
    return;
  }

  try {
    const result = await deleteProjectApi(selectedProjectId.value);
    if (result.success) {
      if (projects.value.length > 0) {
        selectedProjectId.value = projects.value[0].id;
        editingProject.value = { ...projects.value[0] };
        await loadProjectSubmissions(selectedProjectId.value);
      } else {
        selectedProjectId.value = null;
      }
    } else {
      alert(result.error || "Failed to delete project");
    }
  } catch (error) {
    log.error("Failed to delete project:", error);
    alert("Failed to delete project");
  }
}

async function updateStatus(submissionId, status) {
  try {
    await updateStatusApi(submissionId, status);
  } catch (error) {
    log.error("Failed to update status:", error);
  }
}

async function updateSubmissionLink(submissionId, link) {
  try {
    await updateLinkApi(submissionId, link);
  } catch (error) {
    log.error("Failed to update link:", error);
  }
}

async function deleteSubmission(submissionId) {
  if (!confirm("Remove this directory from tracking?")) return;

  try {
    await deleteSubmissionApi(submissionId);
  } catch (error) {
    log.error("Failed to delete submission:", error);
  }
}

function getDirectoryName(directoryId) {
  const dir = directories.value.find((d) => d.id === directoryId);
  return dir?.name || "Unknown Directory";
}

function getStatusSelectClass(status) {
  switch (status) {
    case "not_started":
      return "bg-gray-100 text-gray-700";
    case "in_progress":
      return "bg-yellow-100 text-yellow-800";
    case "submitted":
      return "bg-blue-100 text-blue-800";
    case "approved":
      return "bg-green-100 text-green-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    case "featured":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

function getPendingStatusBadgeClass(status) {
  const baseClass = "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold";
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

function getPendingStatusLabel(status) {
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

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function handleExport() {
  const data = filteredSubmissions.value.map((sub) => ({
    "Directory": getDirectoryName(sub.directory_id),
    "Status": sub.status,
    "Submission Link": sub.submission_link || "",
    "Notes": sub.notes || "",
    "Submitted At": sub.submitted_at ? formatDate(sub.submitted_at) : "",
    "Created At": formatDate(sub.created_at),
  }));

  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  const project = projects.value.find((p) => p.id === selectedProjectId.value);
  const projectName = project?.name || "submissions";
  const fileName = `${projectName.toLowerCase().replace(/\s+/g, "-")}-submissions-${new Date().toISOString().split("T")[0]}.csv`;

  link.setAttribute("href", url);
  link.setAttribute("download", fileName);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
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
