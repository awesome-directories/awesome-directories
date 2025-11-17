<template>
  <button
    @click="handleFavorite"
    :disabled="isLoading"
    class="btn-secondary"
    :class="{
      'bg-yellow-500 hover:bg-yellow-600 text-white': isFavorited,
      'cursor-not-allowed opacity-50': isLoading,
    }"
    :title="isAuthenticated ? (isFavorited ? 'Remove from favorites' : 'Add to favorites') : 'Sign in to favorite'"
  >
    <span v-if="isLoading">⏳</span>
    <span v-else-if="isFavorited">⭐ Favorited</span>
    <span v-else>☆ Add to Favorites</span>
  </button>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useStore } from "@nanostores/vue";
import { $user, $session } from "@/stores/auth";
import { addFavorite, removeFavorite } from "@/lib/api-client";
import { supabase } from "@/lib/supabase-client";

const props = defineProps({
  directoryId: {
    type: String,
    required: true,
  },
});

const user = useStore($user);
const session = useStore($session);

const isFavorited = ref(false);
const isLoading = ref(false);
const isAuthenticated = computed(() => !!user.value);

// Initialize auth state
onMounted(async () => {
  // Get current session
  const { data: { session: currentSession } } = await supabase.auth.getSession();

  if (currentSession) {
    $session.set(currentSession);
    $user.set(currentSession.user);

    // Check if already favorited
    await checkFavoriteStatus();
  }

  // Listen for auth changes
  supabase.auth.onAuthStateChange((event, newSession) => {
    $session.set(newSession);
    $user.set(newSession?.user ?? null);

    if (newSession) {
      checkFavoriteStatus();
    } else {
      isFavorited.value = false;
    }
  });
});

const checkFavoriteStatus = async () => {
  if (!isAuthenticated.value) return;

  try {
    const { data, error } = await supabase
      .from("user_favorites")
      .select("id")
      .eq("user_id", user.value.id)
      .eq("directory_id", props.directoryId)
      .maybeSingle();

    if (!error && data) {
      isFavorited.value = true;
    }
  } catch (error) {
    console.error("Error checking favorite status:", error);
  }
};

const handleFavorite = async () => {
  if (!isAuthenticated.value) {
    // Show sign in prompt
    alert("Please sign in to add favorites");
    // TODO: Open auth modal
    return;
  }

  if (isLoading.value) return;

  isLoading.value = true;

  try {
    if (isFavorited.value) {
      // Remove from favorites
      const { error } = await removeFavorite(props.directoryId);

      if (error) {
        console.error("Error removing favorite:", error);
        alert("Failed to remove favorite. Please try again.");
        return;
      }

      isFavorited.value = false;
    } else {
      // Add to favorites
      const { error } = await addFavorite(props.directoryId);

      if (error) {
        console.error("Error adding favorite:", error);
        alert("Failed to add favorite. Please try again.");
        return;
      }

      isFavorited.value = true;
    }

    // Track analytics if Pirsch is available
    if (window.pirsch) {
      window.pirsch(isFavorited.value ? "Directory Favorited" : "Directory Unfavorited", {
        directory: props.directoryId,
      });
    }
  } catch (error) {
    console.error("Exception during favorite operation:", error);
    alert("An error occurred. Please try again.");
  } finally {
    isLoading.value = false;
  }
};
</script>
