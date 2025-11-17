import { ref } from "vue";
import { supabase } from "@/lib/supabase-client";
import { getUserId } from "@/utils/auth";
import log from "@/lib/logger";

/**
 * Composable for directory-related operations (voting, favorites, submissions)
 */
export function useDirectory() {
  const isLoading = ref(false);
  const error = ref(null);

  /**
   * Vote for a directory as helpful
   * @param {string} directoryId - Directory UUID
   * @param {Object} user - Current user object
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async function voteDirectory(directoryId, user) {
    isLoading.value = true;
    error.value = null;

    try {
      const userId = getUserId(user);

      if (!userId) {
        throw new Error("User must be authenticated to vote");
      }

      // Check if user has already voted
      const { data: existingVote } = await supabase
        .from("directory_votes")
        .select("id")
        .eq("directory_id", directoryId)
        .eq("user_id", userId)
        .maybeSingle();

      if (existingVote) {
        // User has already voted - remove vote (toggle)
        const { error: deleteError } = await supabase
          .from("directory_votes")
          .delete()
          .eq("id", existingVote.id);

        if (deleteError) throw deleteError;

        log.info(`Vote removed for directory ${directoryId}`);
        return { success: true, action: "removed" };
      }

      // Create new vote
      const { error: insertError } = await supabase
        .from("directory_votes")
        .insert({
          directory_id: directoryId,
          user_id: userId,
          ip_hash: null, // Authenticated votes use null as ip_hash
        });

      if (insertError) throw insertError;

      log.info(`Vote added for directory ${directoryId}`);
      return { success: true, action: "added" };
    } catch (err) {
      log.error("Failed to vote:", err);
      error.value = err.message;
      return { success: false, error: err.message };
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Check if user has voted for a directory
   * @param {string} directoryId - Directory UUID
   * @param {Object} user - Current user object
   * @returns {Promise<boolean>}
   */
  async function hasVoted(directoryId, user) {
    try {
      const userId = getUserId(user);
      if (!userId) return false;

      const { data } = await supabase
        .from("directory_votes")
        .select("id")
        .eq("directory_id", directoryId)
        .eq("user_id", userId)
        .maybeSingle();

      return !!data;
    } catch (err) {
      log.error("Failed to check vote status:", err);
      return false;
    }
  }

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

  /**
   * Get user's voted directory IDs
   * @param {Object} user - Current user object
   * @returns {Promise<string[]>}
   */
  async function getUserVotedIds(user) {
    try {
      const userId = getUserId(user);
      if (!userId) return [];

      const { data, error: fetchError } = await supabase
        .from("directory_votes")
        .select("directory_id")
        .eq("user_id", userId);

      if (fetchError) throw fetchError;

      return data.map((v) => v.directory_id);
    } catch (err) {
      log.error("Failed to fetch voted IDs:", err);
      return [];
    }
  }

  return {
    isLoading,
    error,
    voteDirectory,
    hasVoted,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    getUserFavoriteIds,
    getUserVotedIds,
  };
}
