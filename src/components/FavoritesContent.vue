<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Auth Required Message -->
    <div v-if="!user" class="bg-white rounded-lg shadow-sm p-8 text-center">
      <div class="text-5xl mb-4">🔒</div>
      <h2 class="text-2xl font-bold text-gray-900 mb-2">
        Sign in to View Favorites
      </h2>
      <p class="text-gray-600 mb-6">
        You need to be signed in to view and manage your favorite directories.
      </p>
      <button @click="handleSignIn" class="btn-primary">Sign In</button>
    </div>

    <!-- Loading State -->
    <div v-else-if="isLoading" class="text-center py-12">
      <div
        class="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"
      ></div>
      <p class="mt-4 text-gray-600">Loading your favorites...</p>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="favorites.length === 0"
      class="bg-white rounded-lg shadow-sm p-8 text-center"
    >
      <div class="text-5xl mb-4">💔</div>
      <h2 class="text-2xl font-bold text-gray-900 mb-2">No Favorites Yet</h2>
      <p class="text-gray-600 mb-6">
        Start exploring directories and add them to your favorites!
      </p>
      <a href="/" class="btn-primary inline-block"> Browse Directories </a>
    </div>

    <!-- Favorites List -->
    <div v-else>
      <div class="mb-6 flex items-center justify-between">
        <p class="text-gray-700">
          You have
          <span class="font-semibold">{{ favorites.length }}</span>
          {{ favorites.length === 1 ? "favorite" : "favorites" }}
        </p>

        <button
          v-if="favorites.length > 0"
          @click="handleExportFavorites"
          class="text-sm font-medium text-primary hover:text-primary-dark transition-colors"
        >
          📥 Export to CSV
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="favorite in favorites"
          :key="favorite.id"
          class="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow relative"
        >
          <!-- Remove Button -->
          <button
            @click="handleRemoveFavorite(favorite.directory_id)"
            class="absolute top-4 right-4 text-gray-400 hover:text-red-600 transition-colors"
            title="Remove from favorites"
          >
            <span class="text-xl">❌</span>
          </button>

          <!-- Directory Info -->
          <div class="flex items-start gap-4 mb-4">
            <div
              v-if="favorite.directory?.logo_url"
              class="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0"
            >
              <img
                :src="favorite.directory.logo_url"
                :alt="favorite.directory.name"
                class="w-full h-full object-cover"
              />
            </div>
            <div
              v-else
              class="w-16 h-16 rounded-lg bg-primary bg-opacity-10 flex items-center justify-center text-3xl flex-shrink-0"
            >
              📂
            </div>

            <div class="flex-1 min-w-0">
              <h3 class="font-bold text-lg text-gray-900 mb-1">
                <a
                  :href="`/directory/${favorite.directory?.slug}`"
                  class="hover:text-primary transition-colors"
                >
                  {{ favorite.directory?.name || "Unknown Directory" }}
                </a>
              </h3>

              <div
                v-if="favorite.directory?.domain_rating"
                class="flex items-center gap-2"
              >
                <span
                  class="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 font-semibold"
                >
                  ⭐ DR: {{ favorite.directory.domain_rating }}
                </span>
              </div>
            </div>
          </div>

          <!-- Description -->
          <p
            v-if="favorite.directory?.description"
            class="text-sm text-gray-600 mb-4 line-clamp-2"
          >
            {{ favorite.directory.description }}
          </p>

          <!-- View Button -->
          <a
            :href="`/directory/${favorite.directory?.slug}`"
            class="inline-block w-full text-center text-sm font-medium text-primary hover:text-primary-dark transition-colors py-2 px-4 border border-primary rounded-lg hover:bg-primary hover:text-white"
          >
            View Details →
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useStore } from "@nanostores/vue";
import { $user } from "@/stores/auth";
import { supabase } from "@/lib/supabase-client";
import { showAuthModal } from "@/utils/auth";
import log from "@/lib/logger";

const user = useStore($user);
const favorites = ref([]);
const isLoading = ref(true);

onMounted(async () => {
  if (user.value) {
    await loadFavorites();
  } else {
    isLoading.value = false;
  }
});

async function loadFavorites() {
  try {
    isLoading.value = true;

    const { data, error } = await supabase
      .from("user_favorites")
      .select(
        `
        id,
        directory_id,
        created_at,
        directory:directories (
          id,
          slug,
          name,
          description,
          logo_url,
          domain_rating,
          is_dofollow,
          pricing_type,
          pricing_amount,
          categories
        )
      `,
      )
      .eq("user_id", user.value.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    favorites.value = data || [];
    log.info(`Loaded ${favorites.value.length} favorites`);
  } catch (error) {
    log.error("Failed to load favorites:", error);
  } finally {
    isLoading.value = false;
  }
}

function handleSignIn() {
  showAuthModal();
}

async function handleRemoveFavorite(directoryId) {
  if (!confirm("Remove this directory from your favorites?")) {
    return;
  }

  try {
    const { error } = await supabase
      .from("user_favorites")
      .delete()
      .eq("user_id", user.value.id)
      .eq("directory_id", directoryId);

    if (error) throw error;

    // Remove from local state
    favorites.value = favorites.value.filter(
      (f) => f.directory_id !== directoryId,
    );

    log.info(`Removed favorite: ${directoryId}`);
  } catch (error) {
    log.error("Failed to remove favorite:", error);
    alert("Failed to remove favorite. Please try again.");
  }
}

function handleExportFavorites() {
  // Generate CSV
  const headers = ["Name", "URL", "Domain Rating", "Pricing", "Categories"];
  const rows = favorites.value.map((f) => {
    const dir = f.directory;
    return [
      dir?.name || "",
      dir?.slug ? `https://awesome-directories.com/directory/${dir.slug}` : "",
      dir?.domain_rating || "",
      dir?.pricing_type || "",
      dir?.categories?.join("; ") || "",
    ];
  });

  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
    ),
  ].join("\n");

  // Download
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `awesome-directories-favorites-${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);

  log.info("Exported favorites to CSV");
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
