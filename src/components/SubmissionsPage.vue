<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4">
      <!-- Header -->
      <div class="mb-8">
        <nav class="mb-4 text-sm">
          <a href="/" class="text-primary hover:text-primary-dark">← Back to home</a>
        </nav>
        <h1 class="text-4xl font-bold text-gray-900 mb-2">My Submissions</h1>
        <p class="text-lg text-gray-600">Track the status of your directory submissions</p>
      </div>

      <!-- Auth Check -->
      <div v-if="!user" class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <div class="text-5xl mb-4">🔒</div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Sign in Required</h2>
        <p class="text-gray-600 mb-6">
          Please sign in to view your submissions
        </p>
        <button @click="openAuthModal" class="btn-primary">
          Sign In
        </button>
      </div>

      <!-- Loading State -->
      <div v-else-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p class="text-gray-600 mt-4">Loading your submissions...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="submissions.length === 0" class="bg-white rounded-lg shadow-md p-12 text-center">
        <div class="text-6xl mb-4">📝</div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">No submissions yet</h2>
        <p class="text-gray-600 mb-6">
          You haven't submitted any directories for review. Know a great directory? Share it with the community!
        </p>
        <a href="/submit" class="inline-block bg-primary text-white font-semibold px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors">
          Submit a Directory
        </a>
      </div>

      <!-- Submissions List -->
      <div v-else>
        <div class="mb-6 flex items-center justify-between">
          <p class="text-gray-600">{{ submissions.length }} {{ submissions.length === 1 ? 'submission' : 'submissions' }}</p>

          <!-- Status Filter -->
          <div class="flex gap-2">
            <button
              @click="filterStatus = 'all'"
              :class="filterStatus === 'all' ? 'bg-primary text-white' : 'bg-white text-gray-700'"
              class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              All
            </button>
            <button
              @click="filterStatus = 'pending'"
              :class="filterStatus === 'pending' ? 'bg-primary text-white' : 'bg-white text-gray-700'"
              class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Pending
            </button>
            <button
              @click="filterStatus = 'approved'"
              :class="filterStatus === 'approved' ? 'bg-primary text-white' : 'bg-white text-gray-700'"
              class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Approved
            </button>
            <button
              @click="filterStatus = 'rejected'"
              :class="filterStatus === 'rejected' ? 'bg-primary text-white' : 'bg-white text-gray-700'"
              class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Rejected
            </button>
          </div>
        </div>

        <div class="space-y-4">
          <div
            v-for="submission in filteredSubmissions"
            :key="submission.id"
            class="bg-white rounded-lg shadow-md p-6"
          >
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-start gap-4 flex-1">
                <!-- Logo -->
                <div v-if="submission.logo_url" class="flex-shrink-0">
                  <img
                    :src="submission.logo_url"
                    :alt="submission.name"
                    class="w-16 h-16 rounded-lg object-cover bg-gray-100"
                    @error="handleImageError"
                  />
                </div>
                <div v-else class="w-16 h-16 rounded-lg bg-primary bg-opacity-10 flex items-center justify-center text-3xl flex-shrink-0">
                  📂
                </div>

                <!-- Info -->
                <div class="flex-1 min-w-0">
                  <h3 class="text-xl font-bold text-gray-900 mb-1">{{ submission.name }}</h3>
                  <a
                    :href="submission.url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-sm text-primary hover:text-primary-dark break-all"
                  >
                    {{ submission.url }}
                  </a>
                  <p class="text-sm text-gray-600 mt-2">{{ submission.description }}</p>
                </div>
              </div>

              <!-- Status Badge -->
              <span :class="getStatusBadgeClass(submission.status)" class="px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap">
                {{ getStatusLabel(submission.status) }}
              </span>
            </div>

            <!-- Metadata Grid -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 pt-4 border-t border-gray-100">
              <div>
                <div class="text-xs text-gray-500">Pricing</div>
                <div class="font-medium text-gray-900">
                  {{ submission.pricing_type }}
                  {{ submission.pricing_amount ? `($${submission.pricing_amount})` : '' }}
                </div>
              </div>
              <div>
                <div class="text-xs text-gray-500">Traffic</div>
                <div class="font-medium text-gray-900">
                  {{ submission.traffic_estimate || 'Unknown' }}
                </div>
              </div>
              <div>
                <div class="text-xs text-gray-500">Domain Rating</div>
                <div class="font-medium text-gray-900">
                  {{ submission.domain_rating || 'N/A' }}
                </div>
              </div>
              <div>
                <div class="text-xs text-gray-500">Submitted</div>
                <div class="font-medium text-gray-900">
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
                  class="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                >
                  {{ category }}
                </span>
              </div>
            </div>

            <!-- Admin Notes -->
            <div v-if="submission.admin_notes" class="bg-gray-50 rounded-lg p-4">
              <div class="text-xs text-gray-500 mb-1">Admin Notes</div>
              <p class="text-sm text-gray-700">{{ submission.admin_notes }}</p>
            </div>

            <!-- Actions -->
            <div v-if="submission.status === 'pending'" class="flex items-center gap-3 pt-4 border-t border-gray-100 mt-4">
              <button
                @click="editSubmission(submission)"
                class="text-sm text-primary hover:text-primary-dark font-medium"
              >
                ✏️ Edit
              </button>
              <button
                @click="deleteSubmission(submission.id)"
                class="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { supabase } from '@/lib/supabase-client.js';
import { userStore } from '@/stores/auth.js';

const user = ref(null);
const submissions = ref([]);
const loading = ref(true);
const filterStatus = ref('all');

// Subscribe to user store
userStore.subscribe(u => {
  user.value = u;
  if (u) {
    loadSubmissions();
  } else {
    loading.value = false;
  }
});

const filteredSubmissions = computed(() => {
  if (filterStatus.value === 'all') {
    return submissions.value;
  }
  return submissions.value.filter(s => s.status === filterStatus.value);
});

const loadSubmissions = async () => {
  if (!user.value) {
    loading.value = false;
    return;
  }

  try {
    loading.value = true;

    const { data, error } = await supabase
      .from('pending_directories')
      .select('*')
      .eq('user_id', user.value.id)
      .order('submitted_at', { ascending: false });

    if (error) throw error;

    submissions.value = data || [];
  } catch (err) {
    console.error('Error loading submissions:', err);
  } finally {
    loading.value = false;
  }
};

const deleteSubmission = async (id) => {
  if (!confirm('Are you sure you want to delete this submission?')) return;

  try {
    const { error } = await supabase
      .from('pending_directories')
      .delete()
      .eq('id', id);

    if (error) throw error;

    submissions.value = submissions.value.filter(s => s.id !== id);
  } catch (err) {
    console.error('Error deleting submission:', err);
    alert('Failed to delete submission. Please try again.');
  }
};

const editSubmission = (submission) => {
  // Redirect to submit page with query params to pre-fill form
  window.location.href = `/submit?edit=${submission.id}`;
};

const openAuthModal = () => {
  window.dispatchEvent(new CustomEvent('open-auth-modal'));
};

// Utility functions
const getStatusBadgeClass = (status) => {
  if (status === 'pending') return 'bg-yellow-100 text-yellow-700';
  if (status === 'approved') return 'bg-green-100 text-green-700';
  if (status === 'rejected') return 'bg-red-100 text-red-700';
  return 'bg-gray-100 text-gray-700';
};

const getStatusLabel = (status) => {
  if (status === 'pending') return '⏳ Pending Review';
  if (status === 'approved') return '✅ Approved';
  if (status === 'rejected') return '❌ Rejected';
  return status;
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const handleImageError = (e) => {
  e.target.style.display = 'none';
};

onMounted(() => {
  user.value = userStore.get();
  if (user.value) {
    loadSubmissions();
  } else {
    loading.value = false;
  }
});
</script>
