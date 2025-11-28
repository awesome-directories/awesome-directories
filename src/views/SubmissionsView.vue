<template>
  <div class="min-h-screen bg-gray-50 py-12">
    <div class="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 class="text-4xl font-bold text-gray-900 mb-4">My Submissions</h1>
      <p class="text-gray-600 mb-8">
        Track which directories you've submitted to
      </p>

      <div v-if="loading" class="text-center py-12">
        <div
          class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"
        ></div>
      </div>

      <div v-else-if="submissions.length === 0" class="card p-12 text-center">
        <div class="text-6xl mb-4">✅</div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">
          No submissions tracked yet
        </h2>
        <p class="text-gray-600 mb-6">
          Start tracking your directory submissions to stay organized
        </p>
        <router-link to="/" class="btn-primary">
          Browse Directories
        </router-link>
      </div>

      <div v-else>
        <div class="mb-6 card p-4">
          <div class="flex items-center justify-between">
            <div class="text-lg font-semibold text-gray-900">
              Progress: {{ submittedCount }}/{{ submissions.length }} submitted
              ({{ progressPercentage }}%)
            </div>
            <div class="w-48 bg-gray-200 rounded-full h-3">
              <div
                class="bg-primary rounded-full h-3 transition-all duration-500"
                :style="{ width: progressPercentage + '%' }"
              ></div>
            </div>
          </div>
        </div>

        <div class="space-y-4">
          <div
            v-for="submission in submissions"
            :key="submission.id"
            class="card p-6"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <router-link
                  :to="`/directory/${submission.directories.slug}`"
                  class="text-xl font-bold text-gray-900 hover:text-primary"
                >
                  {{ submission.directories.name }}
                </router-link>

                <div class="flex items-center space-x-3 mt-2">
                  <span
                    v-if="submission.directories.domain_rating"
                    class="badge-green"
                  >
                    DR: {{ submission.directories.domain_rating }}
                  </span>
                  <span
                    :class="{
                      'badge-green': submission.status === 'approved',
                      'badge-blue': submission.status === 'submitted',
                      'badge-orange': submission.status === 'pending',
                      'badge-gray': submission.status === 'rejected',
                    }"
                  >
                    {{ submission.status.toUpperCase() }}
                  </span>
                </div>

                <p v-if="submission.notes" class="text-sm text-gray-600 mt-2">
                  {{ submission.notes }}
                </p>

                <p class="text-xs text-gray-500 mt-2">
                  Submitted {{ formatDate(submission.submitted_at) }}
                </p>
              </div>

              <a
                :href="
                  submission.directories.submission_url ||
                  submission.directories.url
                "
                target="_blank"
                rel="noopener"
                class="btn-secondary text-sm ml-4"
              >
                Visit Directory
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/composables/useAuth";

const { user } = useAuth();
const submissions = ref([]);
const loading = ref(true);

const submittedCount = computed(
  () =>
    submissions.value.filter(
      (s) => s.status === "submitted" || s.status === "approved",
    ).length,
);

const progressPercentage = computed(() => {
  if (submissions.value.length === 0) return 0;
  return Math.round((submittedCount.value / submissions.value.length) * 100);
});

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString();
};

const loadSubmissions = async () => {
  if (!user.value) return;

  try {
    const { data, error } = await supabase
      .from("user_submissions")
      .select("*, directories(*)")
      .eq("user_id", user.value.id)
      .order("submitted_at", { ascending: false });

    if (error) throw error;

    submissions.value = data || [];
  } catch (err) {
    console.error("Error loading submissions:", err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadSubmissions();
});
</script>
