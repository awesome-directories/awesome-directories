import type { APIRoute } from "astro";
import {
  supabaseAdmin,
  getAuthenticatedUser,
  getClientIP,
  hashIP,
  jsonResponse,
  errorResponse,
} from "@/lib/auth-helpers";

/**
 * POST /api/vote
 * Vote (or unvote) on a directory
 *
 * Body: { directoryId: string }
 * Returns: { voted: boolean, helpfulCount: number }
 */
export const POST: APIRoute = async (context) => {
  try {
    const body = await context.request.json();
    const { directoryId } = body;

    if (!directoryId) {
      return errorResponse("Missing directoryId", 400);
    }

    // Get client IP and hash it for privacy
    const clientIP = getClientIP(context);
    const ipHash = await hashIP(clientIP);

    // Get authenticated user (optional - can vote without auth)
    const user = await getAuthenticatedUser(context);
    const userId = user?.id || null;

    // Check if user already voted
    const { data: existingVote, error: voteCheckError } = await supabaseAdmin
      .from("directory_votes")
      .select("id")
      .eq("directory_id", directoryId)
      .eq("ip_hash", ipHash)
      .maybeSingle();

    if (voteCheckError) {
      console.error("Error checking existing vote:", voteCheckError);
      return errorResponse("Failed to check vote status", 500);
    }

    let voted = false;

    if (existingVote) {
      // User already voted - remove the vote (toggle off)
      const { error: deleteError } = await supabaseAdmin
        .from("directory_votes")
        .delete()
        .eq("id", existingVote.id);

      if (deleteError) {
        console.error("Error deleting vote:", deleteError);
        return errorResponse("Failed to remove vote", 500);
      }

      voted = false;
    } else {
      // User hasn't voted - add the vote
      const { error: insertError } = await supabaseAdmin
        .from("directory_votes")
        .insert({
          directory_id: directoryId,
          ip_hash: ipHash,
          user_id: userId,
        });

      if (insertError) {
        console.error("Error inserting vote:", insertError);
        return errorResponse("Failed to add vote", 500);
      }

      voted = true;
    }

    // Get updated helpful count
    const { data: directory, error: dirError } = await supabaseAdmin
      .from("directories")
      .select("helpful_count")
      .eq("id", directoryId)
      .single();

    if (dirError) {
      console.error("Error fetching directory:", dirError);
      // Still return success, but with unknown count
      return jsonResponse({ voted, helpfulCount: null });
    }

    return jsonResponse({
      voted,
      helpfulCount: directory.helpful_count || 0,
    });
  } catch (error) {
    console.error("Error in vote API:", error);
    return errorResponse("Internal server error", 500);
  }
};

/**
 * GET /api/vote?directoryId=xxx
 * Check if user has voted on a directory
 *
 * Returns: { voted: boolean }
 */
export const GET: APIRoute = async (context) => {
  try {
    const url = new URL(context.request.url);
    const directoryId = url.searchParams.get("directoryId");

    if (!directoryId) {
      return errorResponse("Missing directoryId", 400);
    }

    // Get client IP and hash it
    const clientIP = getClientIP(context);
    const ipHash = await hashIP(clientIP);

    // Check if vote exists
    const { data: existingVote, error } = await supabaseAdmin
      .from("directory_votes")
      .select("id")
      .eq("directory_id", directoryId)
      .eq("ip_hash", ipHash)
      .maybeSingle();

    if (error) {
      console.error("Error checking vote:", error);
      return errorResponse("Failed to check vote status", 500);
    }

    return jsonResponse({ voted: !!existingVote });
  } catch (error) {
    console.error("Error in vote check API:", error);
    return errorResponse("Internal server error", 500);
  }
};
