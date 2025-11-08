<template>
  <div class="min-h-screen bg-gray-50 py-12">
    <div class="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 class="text-4xl font-bold text-gray-900 mb-8">My Favorites</h1>

      <div v-if="loading" class="text-center py-12">
        <div
          class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"
        ></div>
      </div>

      <div v-else-if="favorites.length === 0" class="card p-12 text-center">
        <div class="text-6xl mb-4">❤️</div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">No favorites yet</h2>
        <p class="text-gray-600 mb-6">
          Start adding directories to your favorites by clicking the heart icon
          on directory cards
        </p>
        <router-link to="/" class="btn-primary">
          Browse Directories
        </router-link>
      </div>

      <div v-else>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DirectoryCard
            v-for="directory in favorites"
            :key="directory.id"
            :directory="directory"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { supabase } from "../lib/supabase";
import { useAuth } from "../composables/useAuth";
import DirectoryCard from "../components/DirectoryCard.vue";

const { user } = useAuth();
const favorites = ref([]);
const loading = ref(true);

const loadFavorites = async () => {
  if (!user.value) return;

  try {
    const { data, error } = await supabase
      .from("user_favorites")
      .select("directory_id, directories(*)")
      .eq("user_id", user.value.id);

    if (error) throw error;

    favorites.value = data.map((f) => f.directories).filter(Boolean);
  } catch (err) {
    console.error("Error loading favorites:", err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadFavorites();

  if (window.pirsch) {
    window.pirsch("Favorites Page View");
  }
});
</script>
