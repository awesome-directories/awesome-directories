import type { APIRoute } from "astro";
import {
  supabaseAdmin,
  jsonResponse,
  errorResponse,
} from "@/lib/auth-helpers";

/**
 * POST /api/track-view
 * Increment view count for a directory
 * This is called when a user views a directory detail page
 *
 * Body: { directoryId: string }
 * Returns: { viewCount: number }
 */
export const POST: APIRoute = async (context) => {
  try {
    const body = await context.request.json();
    const { directoryId } = body;

    if (!directoryId) {
      return errorResponse("Missing directoryId", 400);
    }

    // Increment view count
    const { data, error } = await supabaseAdmin
      .from("directories")
      .update({
        view_count: supabaseAdmin.rpc("increment", { x: 1 }),
      })
      .eq("id", directoryId)
      .select("view_count")
      .single();

    if (error) {
      // Try alternative approach using RPC function
      const { data: rpcData, error: rpcError } = await supabaseAdmin.rpc(
        "increment_view_count",
        { directory_id: directoryId }
      );

      if (rpcError) {
        // Fallback: fetch current count and increment manually
        const { data: current, error: fetchError } = await supabaseAdmin
          .from("directories")
          .select("view_count")
          .eq("id", directoryId)
          .single();

        if (fetchError) {
          console.error("Error fetching directory:", fetchError);
          return errorResponse("Failed to track view", 500);
        }

        const newCount = (current.view_count || 0) + 1;

        const { error: updateError } = await supabaseAdmin
          .from("directories")
          .update({ view_count: newCount })
          .eq("id", directoryId);

        if (updateError) {
          console.error("Error updating view count:", updateError);
          return errorResponse("Failed to track view", 500);
        }

        return jsonResponse({ viewCount: newCount });
      }

      return jsonResponse({ viewCount: rpcData });
    }

    return jsonResponse({
      viewCount: data.view_count || 0,
    });
  } catch (error) {
    console.error("Error in track-view API:", error);
    return errorResponse("Internal server error", 500);
  }
};
