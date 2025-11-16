<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4">
      <!-- Header -->
      <div class="mb-8">
        <nav class="mb-4 text-sm">
          <a href="/" class="text-primary hover:text-primary-dark">← Back to home</a>
        </nav>
        <h1 class="text-4xl font-bold text-gray-900 mb-2">My Favorites</h1>
        <p class="text-lg text-gray-600">Directories you've saved for quick access</p>
      </div>

      <!-- Auth Check -->
      <div v-if="!user" class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <div class="text-5xl mb-4">🔒</div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Sign in Required</h2>
        <p class="text-gray-600 mb-6">
          Please sign in to view your favorite directories
        </p>
        <button @click="openAuthModal" class="btn-primary">
          Sign In
        </button>
      </div>

      <!-- Loading State -->
      <div v-else-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p class="text-gray-600 mt-4">Loading your favorites...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="favorites.length === 0" class="bg-white rounded-lg shadow-md p-12 text-center">
        <div class="text-6xl mb-4">❤️</div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">No favorites yet</h2>
        <p class="text-gray-600 mb-6">
          Start adding directories to your favorites to keep track of the ones you want to submit to
        </p>
        <a href="/" class="inline-block bg-primary text-white font-semibold px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors">
          Browse Directories
        </a>
      </div>

      <!-- Favorites Grid -->
      <div v-else>
        <div class="mb-4 flex items-center justify-between">
          <p class="text-gray-600">{{ favorites.length }} {{ favorites.length === 1 ? 'directory' : 'directories' }} saved</p>
          <button
            v-if="favorites.length > 0"
            @click="openChecklistModal"
            class="bg-primary text-white font-semibold px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors text-sm"
          >
            📋 Export Favorites
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="directory in favorites" :key="directory.id" class="relative">
            <div class="card p-5 h-full flex flex-col">
              <!-- Remove from Favorites Button -->
              <button
                @click="removeFavorite(directory.id)"
                class="absolute top-4 right-4 text-red-500 hover:text-red-700 transition-colors"
                title="Remove from favorites"
              >
                ❤️
              </button>

              <!-- Logo/Icon -->
              <div class="flex items-start space-x-4 mb-4">
                <div class="flex-shrink-0">
                  <div
                    v-if="directory.logo_url"
                    class="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center"
                  >
                    <img
                      :src="directory.logo_url"
                      :alt="directory.name"
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
                    {{ directory.name }}
                  </h3>

                  <div class="flex items-center flex-wrap gap-2">
                    <span
                      v-if="directory.domain_rating"
                      :class="getDRBadgeClass(directory.domain_rating)"
                      class="badge text-xs font-semibold"
                    >
                      ⭐ DR: {{ directory.domain_rating }}
                    </span>

                    <span v-if="directory.is_dofollow" class="badge-green text-xs">
                      🔗 Dofollow
                    </span>
                  </div>
                </div>
              </div>

              <!-- Description -->
              <p class="text-sm text-gray-600 mb-4 flex-grow line-clamp-3">
                {{ directory.description || "No description available." }}
              </p>

              <!-- Tags and Pricing -->
              <div class="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="category in displayCategories(directory)"
                    :key="category"
                    class="badge-gray text-xs"
                  >
                    {{ category }}
                  </span>
                </div>

                <span
                  v-if="directory.pricing_type"
                  :class="getPricingBadgeClass(directory.pricing_type)"
                  class="badge text-xs font-medium"
                >
                  {{ getPricingLabel(directory) }}
                </span>
              </div>

              <!-- Footer -->
              <div class="flex items-center justify-between pt-4 border-t border-gray-100">
                <span class="text-sm text-gray-600">
                  👍 {{ directory.helpful_count || 0 }} helpful
                </span>

                <a
                  :href="`/directory/${directory.slug}`"
                  class="text-sm font-medium text-primary hover:text-primary-dark transition-colors"
                >
                  View Details →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { supabase } from '@/lib/supabase-client.js';
import { userStore } from '@/stores/auth.js';

const user = ref(null);
const favorites = ref([]);
const loading = ref(true);

// Subscribe to user store
userStore.subscribe(u => {
  user.value = u;
  if (u) {
    loadFavorites();
  } else {
    loading.value = false;
  }
});

const loadFavorites = async () => {
  if (!user.value) {
    loading.value = false;
    return;
  }

  try {
    loading.value = true;

    const { data, error } = await supabase
      .from('user_favorites')
      .select(`
        directory_id,
        directories (*)
      `)
      .eq('user_id', user.value.id);

    if (error) throw error;

    favorites.value = data.map(f => f.directories).filter(Boolean);
  } catch (err) {
    console.error('Error loading favorites:', err);
  } finally {
    loading.value = false;
  }
};

const removeFavorite = async (directoryId) => {
  if (!user.value) return;

  try {
    const { error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('user_id', user.value.id)
      .eq('directory_id', directoryId);

    if (error) throw error;

    // Remove from local state
    favorites.value = favorites.value.filter(d => d.id !== directoryId);
  } catch (err) {
    console.error('Error removing favorite:', err);
    alert('Failed to remove favorite. Please try again.');
  }
};

const openAuthModal = () => {
  window.dispatchEvent(new CustomEvent('open-auth-modal'));
};

const openChecklistModal = () => {
  window.dispatchEvent(new CustomEvent('open-checklist-modal', {
    detail: { directories: favorites.value }
  }));
};

// Utility functions
const getDRBadgeClass = (dr) => {
  if (!dr) return 'badge-gray';
  if (dr >= 80) return 'badge-green';
  if (dr >= 70) return 'badge-blue';
  if (dr >= 60) return 'badge-orange';
  return 'badge-gray';
};

const getPricingBadgeClass = (pricing) => {
  if (pricing === 'free') return 'badge-green';
  if (pricing === 'paid') return 'badge-orange';
  if (pricing === 'freemium') return 'badge-blue';
  return 'badge-gray';
};

const getPricingLabel = (directory) => {
  const pricing = directory.pricing_type;
  if (pricing === 'free') return '💰 Free';
  if (pricing === 'paid' && directory.pricing_amount) {
    return `💰 $${directory.pricing_amount}`;
  }
  if (pricing === 'paid') return '💰 Paid';
  if (pricing === 'freemium') return '💰 Freemium';
  return '';
};

const displayCategories = (directory) => {
  const cats = directory.categories || [];
  return cats.slice(0, 3);
};

const handleImageError = (e) => {
  e.target.style.display = 'none';
};

onMounted(() => {
  // Get initial user state
  user.value = userStore.get();
  if (user.value) {
    loadFavorites();
  } else {
    loading.value = false;
  }
});
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
