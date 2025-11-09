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

            <button
              @click="handleHelpfulClick"
              :disabled="hasVoted"
              class="btn-secondary"
              :class="{ 'opacity-50': hasVoted }"
            >
              {{ hasVoted ? "✓ Marked Helpful" : "👍 Mark as Helpful" }}
              ({{ directory.helpful_count || 0 }})
            </button>
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
              {{ directory.helpful_count || 0 }}
            </div>
            <div class="text-sm text-gray-600">Helpful Votes</div>
          </div>
        </div>

        <!-- Giscus Comments -->
        <div class="card p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-4">
            Community Reviews & Success Stories
          </h2>
          <p class="text-gray-600 mb-6">
            Launched on {{ directory.name }}? Share your results and help other
            founders!
          </p>

          <div id="giscus-container"></div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else class="text-center py-12">
        <p class="text-red-600 mb-4">Directory not found</p>
        <router-link to="/" class="btn-primary">Back to Home</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useDirectories } from "@/composables/useDirectories";
import { supabase } from "@/lib/supabase";

const route = useRoute();
const { getDirectoryBySlug } = useDirectories();

const directory = ref(null);
const loading = ref(true);
const hasVoted = ref(false);

const loadDirectory = async () => {
  try {
    directory.value = await getDirectoryBySlug(route.params.slug);

    // Load Giscus comments
    loadGiscusComments();
  } catch (error) {
    console.error("Error loading directory:", error);
  } finally {
    loading.value = false;
  }
};

const loadGiscusComments = () => {
  const script = document.createElement("script");
  script.src = "https://giscus.app/client.js";
  script.setAttribute(
    "data-repo",
    import.meta.env.VITE_GITHUB_REPO ||
      "awesome-directories/awesome-directories",
  );
  script.setAttribute(
    "data-repo-id",
    import.meta.env.VITE_GITHUB_REPO_ID || "",
  );
  script.setAttribute(
    "data-category",
    import.meta.env.VITE_GITHUB_CATEGORY || "Announcements",
  );
  script.setAttribute(
    "data-category-id",
    import.meta.env.VITE_GITHUB_CATEGORY_ID || "",
  );
  script.setAttribute("data-mapping", "pathname");
  script.setAttribute("data-strict", "0");
  script.setAttribute("data-reactions-enabled", "1");
  script.setAttribute("data-emit-metadata", "0");
  script.setAttribute("data-input-position", "bottom");
  script.setAttribute("data-theme", "light");
  script.setAttribute("data-lang", "en");
  script.crossOrigin = "anonymous";
  script.async = true;

  const container = document.getElementById("giscus-container");
  if (container) {
    container.appendChild(script);
  }
};

const handleHelpfulClick = async () => {
  if (hasVoted.value || !directory.value) return;

  try {
    const response = await fetch("https://api.ipify.org?format=json");
    const data = await response.json();
    const ip = data.ip;

    const encoder = new TextEncoder();
    const data_encoded = encoder.encode(ip);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data_encoded);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const ipHash = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const { error } = await supabase.from("directory_votes").insert({
      directory_id: directory.value.id,
      ip_hash: ipHash,
    });

    if (!error || error.code === "23505") {
      hasVoted.value = true;
      directory.value.helpful_count = (directory.value.helpful_count || 0) + 1;

      if (window.pirsch) {
        window.pirsch("Directory Helpful Vote", {
          directory: directory.value.slug,
        });
      }
    }
  } catch (err) {
    console.error("Error voting:", err);
  }
};

onMounted(() => {
  loadDirectory();
});
</script>
