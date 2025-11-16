import type { APIRoute } from "astro";
import {
  supabaseAdmin,
  requireAuth,
  jsonResponse,
  errorResponse,
} from "@/lib/auth-helpers";

/**
 * POST /api/favorites
 * Add a directory to user's favorites
 *
 * Body: { directoryId: string }
 * Returns: { favorited: true }
 */
export const POST: APIRoute = async (context) => {
  try {
    // Require authentication
    const { user, error: authError } = await requireAuth(context);
    if (authError) {
      return authError;
    }

    const body = await context.request.json();
    const { directoryId } = body;

    if (!directoryId) {
      return errorResponse("Missing directoryId", 400);
    }

    // Check if already favorited
    const { data: existing, error: checkError } = await supabaseAdmin
      .from("user_favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("directory_id", directoryId)
      .maybeSingle();

    if (checkError) {
      console.error("Error checking favorite:", checkError);
      return errorResponse("Failed to check favorite status", 500);
    }

    if (existing) {
      return errorResponse("Directory already in favorites", 409);
    }

    // Add to favorites
    const { error: insertError } = await supabaseAdmin
      .from("user_favorites")
      .insert({
        user_id: user.id,
        directory_id: directoryId,
      });

    if (insertError) {
      console.error("Error adding favorite:", insertError);
      return errorResponse("Failed to add favorite", 500);
    }

    return jsonResponse({ favorited: true }, 201);
  } catch (error) {
    console.error("Error in favorites POST API:", error);
    return errorResponse("Internal server error", 500);
  }
};

/**
 * DELETE /api/favorites
 * Remove a directory from user's favorites
 *
 * Body: { directoryId: string }
 * Returns: { favorited: false }
 */
export const DELETE: APIRoute = async (context) => {
  try {
    // Require authentication
    const { user, error: authError } = await requireAuth(context);
    if (authError) {
      return authError;
    }

    const body = await context.request.json();
    const { directoryId } = body;

    if (!directoryId) {
      return errorResponse("Missing directoryId", 400);
    }

    // Remove from favorites
    const { error: deleteError } = await supabaseAdmin
      .from("user_favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("directory_id", directoryId);

    if (deleteError) {
      console.error("Error removing favorite:", deleteError);
      return errorResponse("Failed to remove favorite", 500);
    }

    return jsonResponse({ favorited: false });
  } catch (error) {
    console.error("Error in favorites DELETE API:", error);
    return errorResponse("Internal server error", 500);
  }
};

/**
 * GET /api/favorites
 * Get user's favorite directories
 *
 * Returns: { favorites: Directory[] }
 */
export const GET: APIRoute = async (context) => {
  try {
    // Require authentication
    const { user, error: authError } = await requireAuth(context);
    if (authError) {
      return authError;
    }

    // Get user's favorites with directory details
    const { data: favorites, error } = await supabaseAdmin
      .from("user_favorites")
      .select(
        `
        id,
        created_at,
        directory:directories (
          id,
          slug,
          name,
          description,
          url,
          logo_url,
          domain_rating,
          is_dofollow,
          categories,
          pricing_type,
          pricing_amount,
          traffic_estimate,
          avg_approval_days,
          submission_url,
          helpful_count,
          view_count
        )
      `
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching favorites:", error);
      return errorResponse("Failed to fetch favorites", 500);
    }

    return jsonResponse({ favorites: favorites || [] });
  } catch (error) {
    console.error("Error in favorites GET API:", error);
    return errorResponse("Internal server error", 500);
  }
};
