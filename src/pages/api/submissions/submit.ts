import type { APIRoute } from "astro";
import {
  supabaseAdmin,
  requireAuth,
  jsonResponse,
  errorResponse,
} from "@/lib/auth-helpers";

/**
 * POST /api/submissions/submit
 * Track user's submission to a directory
 *
 * Body: {
 *   directoryId: string,
 *   status?: 'pending' | 'submitted' | 'approved' | 'rejected',
 *   notes?: string
 * }
 * Returns: { submission: UserSubmission }
 */
export const POST: APIRoute = async (context) => {
  try {
    // Require authentication
    const { user, error: authError } = await requireAuth(context);
    if (authError) {
      return authError;
    }

    const body = await context.request.json();
    const { directoryId, status = "pending", notes = null } = body;

    if (!directoryId) {
      return errorResponse("Missing directoryId", 400);
    }

    // Validate status
    const validStatuses = ["pending", "submitted", "approved", "rejected"];
    if (!validStatuses.includes(status)) {
      return errorResponse(
        `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
        400
      );
    }

    // Check if submission already exists
    const { data: existing, error: checkError } = await supabaseAdmin
      .from("user_submissions")
      .select("id, status")
      .eq("user_id", user.id)
      .eq("directory_id", directoryId)
      .maybeSingle();

    if (checkError) {
      console.error("Error checking submission:", checkError);
      return errorResponse("Failed to check submission status", 500);
    }

    if (existing) {
      // Update existing submission
      const { data: updated, error: updateError } = await supabaseAdmin
        .from("user_submissions")
        .update({
          status,
          notes,
          submitted_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select()
        .single();

      if (updateError) {
        console.error("Error updating submission:", updateError);
        return errorResponse("Failed to update submission", 500);
      }

      return jsonResponse({ submission: updated });
    } else {
      // Create new submission
      const { data: created, error: insertError } = await supabaseAdmin
        .from("user_submissions")
        .insert({
          user_id: user.id,
          directory_id: directoryId,
          status,
          notes,
        })
        .select()
        .single();

      if (insertError) {
        console.error("Error creating submission:", insertError);
        return errorResponse("Failed to create submission", 500);
      }

      return jsonResponse({ submission: created }, 201);
    }
  } catch (error) {
    console.error("Error in submissions submit API:", error);
    return errorResponse("Internal server error", 500);
  }
};

/**
 * GET /api/submissions/submit
 * Get user's submission tracking records
 *
 * Returns: { submissions: UserSubmission[] }
 */
export const GET: APIRoute = async (context) => {
  try {
    // Require authentication
    const { user, error: authError } = await requireAuth(context);
    if (authError) {
      return authError;
    }

    // Get user's submissions with directory details
    const { data: submissions, error } = await supabaseAdmin
      .from("user_submissions")
      .select(
        `
        id,
        status,
        submitted_at,
        notes,
        directory:directories (
          id,
          slug,
          name,
          description,
          url,
          logo_url,
          submission_url,
          avg_approval_days
        )
      `
      )
      .eq("user_id", user.id)
      .order("submitted_at", { ascending: false });

    if (error) {
      console.error("Error fetching submissions:", error);
      return errorResponse("Failed to fetch submissions", 500);
    }

    return jsonResponse({ submissions: submissions || [] });
  } catch (error) {
    console.error("Error in submissions GET API:", error);
    return errorResponse("Internal server error", 500);
  }
};

/**
 * DELETE /api/submissions/submit
 * Delete a submission tracking record
 *
 * Body: { directoryId: string }
 * Returns: { deleted: true }
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

    // Delete submission
    const { error: deleteError } = await supabaseAdmin
      .from("user_submissions")
      .delete()
      .eq("user_id", user.id)
      .eq("directory_id", directoryId);

    if (deleteError) {
      console.error("Error deleting submission:", deleteError);
      return errorResponse("Failed to delete submission", 500);
    }

    return jsonResponse({ deleted: true });
  } catch (error) {
    console.error("Error in submissions DELETE API:", error);
    return errorResponse("Internal server error", 500);
  }
};
