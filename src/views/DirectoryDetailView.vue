<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Breadcrumb -->
      <nav class="mb-6">
        <router-link to="/" class="text-primary hover:text-primary-dark">
          ← Back to All Directories
        </router-link>
      </nav>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div
          class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"
        ></div>
      </div>

      <!-- Directory Details -->
      <div v-else-if="directory" class="space-y-8">
        <!-- Hero Card -->
        <div class="card p-8">
          <div class="flex items-start space-x-6 mb-6">
            <div
              class="flex-shrink-0 w-24 h-24 rounded-xl bg-gray-100 flex items-center justify-center text-4xl"
            >
              📂
            </div>

            <div class="flex-1">
              <h1 class="text-3xl font-bold text-gray-900 mb-2">
                {{ directory.name }}
              </h1>

              <div class="flex items-center flex-wrap gap-3 mb-4">
                <span
                  v-if="directory.domain_rating"
                  class="badge-green font-semibold"
                >
                  ⭐ DR: {{ directory.domain_rating }}
                </span>

                <span v-if="directory.is_dofollow" class="badge-green">
                  🔗 Dofollow
                </span>

                <span v-if="directory.pricing_type" class="badge-blue">
                  💰 {{ directory.pricing_type }}
                </span>
              </div>

              <a
                :href="directory.url"
                target="_blank"
                rel="noopener"
                class="text-primary hover:text-primary-dark break-all"
              >
                {{ directory.url }}
              </a>
            </div>
          </div>

          <!-- CTAs -->
          <div class="flex flex-wrap gap-4">
            <a
              :href="directory.submission_url || directory.url"
              target="_blank"
              rel="noopener"
              class="btn-primary"
            >
              Submit to {{ directory.name }} →
            </a>
          </div>
        </div>

        <!-- Description -->
        <div v-if="directory.description" class="card p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-4">About</h2>
          <p class="text-gray-700 leading-relaxed">
            {{ directory.description }}
          </p>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="card p-4 text-center">
            <div class="text-2xl font-bold text-primary mb-1">
              {{ directory.domain_rating || "N/A" }}
            </div>
            <div class="text-sm text-gray-600">Domain Rating</div>
          </div>

          <div class="card p-4 text-center">
            <div class="text-2xl font-bold text-primary mb-1">
              {{ directory.is_dofollow ? "✅" : "❌" }}
            </div>
            <div class="text-sm text-gray-600">Dofollow</div>
          </div>

          <div class="card p-4 text-center">
            <div class="text-2xl font-bold text-primary mb-1">
              {{ directory.pricing_type || "N/A" }}
            </div>
            <div class="text-sm text-gray-600">Pricing</div>
          </div>

          <div class="card p-4 text-center">
            <div class="text-2xl font-bold text-primary mb-1">
              {{ directory.average_rating ? directory.average_rating.toFixed(1) : "N/A" }}
            </div>
            <div class="text-sm text-gray-600">
              Avg Rating ({{ directory.review_count || 0 }})
            </div>
          </div>
        </div>

        <!-- Reviews Section -->
        <div class="card p-6">
          <ReviewSection
            v-if="directory.id"
            :directory-id="directory.id"
            @show-auth-modal="showAuthModal = true"
          />
        </div>
      </div>

      <!-- Error State -->
      <div v-else class="text-center py-12">
        <p class="text-red-600 mb-4">Directory not found</p>
        <router-link to="/" class="btn-primary">Back to Home</router-link>
      </div>
    </div>

    <!-- Auth Modal -->
    <AuthModal v-if="showAuthModal" @close="showAuthModal = false" />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useDirectories } from "@/composables/useDirectories";
import ReviewSection from "@/components/ReviewSection.vue";
import AuthModal from "@/components/AuthModal.vue";

const route = useRoute();
const { getDirectoryBySlug } = useDirectories();

const directory = ref(null);
const loading = ref(true);
const showAuthModal = ref(false);

const loadDirectory = async () => {
  try {
    directory.value = await getDirectoryBySlug(route.params.slug);
  } catch (error) {
    console.error("Error loading directory:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadDirectory();
});
</script>
