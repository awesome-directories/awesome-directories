import { ref } from "vue";
import { supabase } from "@/lib/supabase-client";
import { getUserId } from "@/utils/auth";
import log from "@/lib/logger";

/**
 * Composable for directory-related operations (favorites)
 */
export function useDirectory() {
  const isLoading = ref(false);
  const error = ref(null);

  /**
   * Add directory to favorites
   * @param {string} directoryId - Directory UUID
   * @param {Object} user - Current user object
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async function addToFavorites(directoryId, user) {
    isLoading.value = true;
    error.value = null;

    try {
      const userId = getUserId(user);

      if (!userId) {
        throw new Error("User must be authenticated to add favorites");
      }

      const { error: insertError } = await supabase
        .from("user_favorites")
        .insert({
          user_id: userId,
          directory_id: directoryId,
        });

      if (insertError) {
        // Check if it's a duplicate error
        if (insertError.code === "23505") {
          return { success: false, error: "Already in favorites" };
        }
        throw insertError;
      }

      log.info(`Directory ${directoryId} added to favorites`);
      return { success: true };
    } catch (err) {
      log.error("Failed to add to favorites:", err);
      error.value = err.message;
      return { success: false, error: err.message };
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Remove directory from favorites
   * @param {string} directoryId - Directory UUID
   * @param {Object} user - Current user object
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async function removeFromFavorites(directoryId, user) {
    isLoading.value = true;
    error.value = null;

    try {
      const userId = getUserId(user);

      if (!userId) {
        throw new Error("User must be authenticated");
      }

      const { error: deleteError } = await supabase
        .from("user_favorites")
        .delete()
        .eq("user_id", userId)
        .eq("directory_id", directoryId);

      if (deleteError) throw deleteError;

      log.info(`Directory ${directoryId} removed from favorites`);
      return { success: true };
    } catch (err) {
      log.error("Failed to remove from favorites:", err);
      error.value = err.message;
      return { success: false, error: err.message };
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Check if directory is in user's favorites
   * @param {string} directoryId - Directory UUID
   * @param {Object} user - Current user object
   * @returns {Promise<boolean>}
   */
  async function isFavorite(directoryId, user) {
    try {
      const userId = getUserId(user);
      if (!userId) return false;

      const { data } = await supabase
        .from("user_favorites")
        .select("id")
        .eq("user_id", userId)
        .eq("directory_id", directoryId)
        .maybeSingle();

      return !!data;
    } catch (err) {
      log.error("Failed to check favorite status:", err);
      return false;
    }
  }

  /**
   * Get user's favorite directory IDs
   * @param {Object} user - Current user object
   * @returns {Promise<string[]>}
   */
  async function getUserFavoriteIds(user) {
    try {
      const userId = getUserId(user);
      if (!userId) return [];

      const { data, error: fetchError } = await supabase
        .from("user_favorites")
        .select("directory_id")
        .eq("user_id", userId);

      if (fetchError) throw fetchError;

      return data.map((f) => f.directory_id);
    } catch (err) {
      log.error("Failed to fetch favorite IDs:", err);
      return [];
    }
  }

  return {
    isLoading,
    error,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    getUserFavoriteIds,
  };
}
