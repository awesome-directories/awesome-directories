<template>
  <div>
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div
        class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"
      ></div>
      <p class="text-gray-600 mt-4">Loading your favorites...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="card p-8 text-center bg-red-50 border-red-200">
      <div class="text-6xl mb-4">⚠️</div>
      <h2 class="text-2xl font-bold text-gray-900 mb-2">
        Error Loading Favorites
      </h2>
      <p class="text-gray-700 mb-4">{{ error }}</p>
      <button @click="loadFavorites" class="btn-primary">Try Again</button>
    </div>

    <!-- Empty State -->
    <div v-else-if="favorites.length === 0" class="card p-8 text-center">
      <div class="text-6xl mb-4">⭐</div>
      <h2 class="text-2xl font-bold text-gray-900 mb-2">No Favorites Yet</h2>
      <p class="text-gray-600 mb-6">
        Start building your collection of go-to directories for launching your
        products.
      </p>
      <a href="/" class="btn-primary"> Browse Directories </a>
    </div>

    <!-- Favorites Grid -->
    <div v-else>
      <!-- Count -->
      <div class="mb-6 text-gray-600">
        {{ favorites.length }} {{ favorites.length === 1 ? 'directory' : 'directories' }} saved
      </div>

      <!-- Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="favorite in favorites"
          :key="favorite.id"
          class="card p-5 flex flex-col relative"
        >
          <!-- Directory Card Content -->
          <div class="flex items-start space-x-4 mb-4">
            <div class="flex-shrink-0">
              <div
                v-if="favorite.directory.logo_url"
                class="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center"
              >
                <img
                  :src="favorite.directory.logo_url"
                  :alt="favorite.directory.name"
                  class="w-full h-full object-cover"
                  @error="handleImageError"
                />
              </div>
              <div
                v-else
                class="w-12 h-12 rounded-lg bg-primary bg-opacity-10 flex items-center justify-center text-2xl"
              >
                📂
              </div>
            </div>

            <div class="flex-1 min-w-0">
              <h3 class="font-bold text-lg text-gray-900 mb-1 truncate">
                {{ favorite.directory.name }}
              </h3>

              <div class="flex items-center flex-wrap gap-2">
                <!-- DR Badge -->
                <span
                  v-if="favorite.directory.domain_rating"
                  :class="getDRBadgeClass(favorite.directory.domain_rating)"
                  class="badge text-xs font-semibold"
                >
                  ⭐ DR: {{ favorite.directory.domain_rating }}
                </span>

                <!-- Dofollow Badge -->
                <span
                  v-if="favorite.directory.is_dofollow"
                  class="badge-green text-xs"
                >
                  🔗 Dofollow
                </span>
              </div>
            </div>
          </div>

          <!-- Description -->
          <p class="text-sm text-gray-600 mb-4 flex-grow line-clamp-3">
            {{ favorite.directory.description || "No description available." }}
          </p>

          <!-- Categories and Pricing -->
          <div class="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div class="flex flex-wrap gap-1">
              <span
                v-for="category in getDisplayCategories(favorite.directory.categories)"
                :key="category"
                class="badge-gray text-xs"
              >
                {{ category }}
              </span>
            </div>

            <span
              v-if="favorite.directory.pricing_type"
              :class="getPricingBadgeClass(favorite.directory.pricing_type)"
              class="badge text-xs font-medium"
            >
              {{ getPricingLabel(favorite.directory) }}
            </span>
          </div>

          <!-- Footer -->
          <div
            class="flex items-center justify-between pt-4 border-t border-gray-100"
          >
            <div class="flex items-center space-x-4 text-sm text-gray-600">
              <span v-if="favorite.directory.helpful_count > 0">
                👍 {{ favorite.directory.helpful_count }}
              </span>
              <span v-if="favorite.directory.view_count > 0">
                👁️ {{ favorite.directory.view_count }}
              </span>
            </div>

            <a
              :href="`/directory/${favorite.directory.slug}`"
              class="text-sm font-medium text-primary hover:text-primary-dark transition-colors"
            >
              View Details →
            </a>
          </div>

          <!-- Remove Button -->
          <div class="mt-4 pt-4 border-t border-gray-100">
            <button
              @click="removeFavorite(favorite.id, favorite.directory.id)"
              :disabled="removingId === favorite.id"
              class="w-full btn-secondary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{
                removingId === favorite.id
                  ? "Removing..."
                  : "Remove from Favorites"
              }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { getFavorites, removeFavorite as removeFavoriteAPI } from "@/lib/api-client";

const favorites = ref([]);
const loading = ref(true);
const error = ref("");
const removingId = ref(null);

onMounted(() => {
  loadFavorites();
});

const loadFavorites = async () => {
  loading.value = true;
  error.value = "";

  try {
    const { data, error: fetchError } = await getFavorites();

    if (fetchError) {
      error.value =
        fetchError.message || fetchError.error || "Failed to load favorites";
      return;
    }

    if (data) {
      favorites.value = data.favorites || [];
    }
  } catch (err) {
    console.error("Error loading favorites:", err);
    error.value = "An unexpected error occurred while loading favorites";
  } finally {
    loading.value = false;
  }
};

const removeFavorite = async (favoriteId, directoryId) => {
  if (
    !confirm(
      "Are you sure you want to remove this directory from your favorites?"
    )
  ) {
    return;
  }

  removingId.value = favoriteId;

  try {
    const { error: deleteError } = await removeFavoriteAPI(directoryId);

    if (deleteError) {
      alert(
        deleteError.message || deleteError.error || "Failed to remove favorite"
      );
      return;
    }

    // Remove from local list
    favorites.value = favorites.value.filter((f) => f.id !== favoriteId);

    // Track removal in analytics
    if (window.pirsch) {
      window.pirsch("Directory Unfavorited");
    }
  } catch (err) {
    console.error("Error removing favorite:", err);
    alert("An unexpected error occurred while removing favorite");
  } finally {
    removingId.value = null;
  }
};

const getDRBadgeClass = (dr) => {
  if (!dr) return "badge-gray";
  if (dr >= 80) return "badge-green";
  if (dr >= 70) return "badge-blue";
  if (dr >= 60) return "badge-orange";
  return "badge-gray";
};

const getPricingBadgeClass = (pricingType) => {
  if (pricingType === "free") return "badge-green";
  if (pricingType === "paid") return "badge-orange";
  if (pricingType === "freemium") return "badge-blue";
  return "badge-gray";
};

const getPricingLabel = (directory) => {
  const pricing = directory.pricing_type;

  if (pricing === "free") return "💰 Free";
  if (pricing === "paid" && directory.pricing_amount) {
    return `💰 $${directory.pricing_amount}`;
  }
  if (pricing === "paid") return "💰 Paid";
  if (pricing === "freemium") return "💰 Freemium";
  return "";
};

const getDisplayCategories = (categories) => {
  const cats = categories || [];
  return cats.slice(0, 3);
};

const handleImageError = (e) => {
  e.target.style.display = "none";
};
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
