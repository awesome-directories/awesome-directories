import type { APIRoute } from "astro";
import {
  supabaseAdmin,
  requireAuth,
  jsonResponse,
  errorResponse,
} from "@/lib/auth-helpers";

/**
 * POST /api/directories/submit
 * Submit a new directory for review
 *
 * Body: {
 *   name: string,
 *   description: string,
 *   url: string,
 *   logoUrl?: string,
 *   categories?: string[],
 *   pricingType: 'free' | 'paid' | 'freemium',
 *   pricingAmount?: number,
 *   submissionUrl?: string,
 *   trafficEstimate?: 'high' | 'medium' | 'low',
 *   avgApprovalDays?: number,
 *   domainRating?: number,
 *   isDofollow?: boolean
 * }
 * Returns: { pendingDirectory: PendingDirectory }
 */
export const POST: APIRoute = async (context) => {
  try {
    // Require authentication
    const { user, error: authError } = await requireAuth(context);
    if (authError) {
      return authError;
    }

    const body = await context.request.json();
    const {
      name,
      description,
      url,
      logoUrl,
      categories = [],
      pricingType,
      pricingAmount,
      submissionUrl,
      trafficEstimate,
      avgApprovalDays,
      domainRating,
      isDofollow = false,
    } = body;

    // Validate required fields
    if (!name || !description || !url || !pricingType) {
      return errorResponse(
        "Missing required fields: name, description, url, pricingType",
        400
      );
    }

    // Validate pricing type
    const validPricingTypes = ["free", "paid", "freemium"];
    if (!validPricingTypes.includes(pricingType)) {
      return errorResponse(
        `Invalid pricingType. Must be one of: ${validPricingTypes.join(", ")}`,
        400
      );
    }

    // Validate traffic estimate if provided
    if (trafficEstimate) {
      const validTraffic = ["high", "medium", "low"];
      if (!validTraffic.includes(trafficEstimate)) {
        return errorResponse(
          `Invalid trafficEstimate. Must be one of: ${validTraffic.join(", ")}`,
          400
        );
      }
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (e) {
      return errorResponse("Invalid URL format", 400);
    }

    // Check if user already submitted this URL
    const { data: existing, error: checkError } = await supabaseAdmin
      .from("pending_directories")
      .select("id, status")
      .eq("user_id", user.id)
      .eq("url", url)
      .maybeSingle();

    if (checkError) {
      console.error("Error checking existing submission:", checkError);
      return errorResponse("Failed to check submission status", 500);
    }

    if (existing) {
      return errorResponse(
        `You have already submitted this directory (Status: ${existing.status})`,
        409
      );
    }

    // Create pending directory submission
    const { data: created, error: insertError } = await supabaseAdmin
      .from("pending_directories")
      .insert({
        user_id: user.id,
        user_email: user.email || "",
        name,
        description,
        url,
        logo_url: logoUrl || null,
        categories,
        pricing_type: pricingType,
        pricing_amount: pricingAmount || null,
        submission_url: submissionUrl || null,
        traffic_estimate: trafficEstimate || null,
        avg_approval_days: avgApprovalDays || null,
        domain_rating: domainRating || null,
        is_dofollow: isDofollow,
        status: "pending",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating pending directory:", insertError);
      return errorResponse("Failed to submit directory", 500);
    }

    return jsonResponse({ pendingDirectory: created }, 201);
  } catch (error) {
    console.error("Error in directories submit API:", error);
    return errorResponse("Internal server error", 500);
  }
};

/**
 * GET /api/directories/submit
 * Get user's pending directory submissions
 *
 * Returns: { pendingDirectories: PendingDirectory[] }
 */
export const GET: APIRoute = async (context) => {
  try {
    // Require authentication
    const { user, error: authError } = await requireAuth(context);
    if (authError) {
      return authError;
    }

    // Get user's pending directory submissions
    const { data: pendingDirectories, error } = await supabaseAdmin
      .from("pending_directories")
      .select("*")
      .eq("user_id", user.id)
      .order("submitted_at", { ascending: false });

    if (error) {
      console.error("Error fetching pending directories:", error);
      return errorResponse("Failed to fetch pending directories", 500);
    }

    return jsonResponse({ pendingDirectories: pendingDirectories || [] });
  } catch (error) {
    console.error("Error in directories GET API:", error);
    return errorResponse("Internal server error", 500);
  }
};

/**
 * DELETE /api/directories/submit
 * Delete a pending directory submission (only if status is 'pending')
 *
 * Body: { id: string }
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
    const { id } = body;

    if (!id) {
      return errorResponse("Missing id", 400);
    }

    // Check if submission exists and belongs to user
    const { data: existing, error: checkError } = await supabaseAdmin
      .from("pending_directories")
      .select("id, status, user_id")
      .eq("id", id)
      .single();

    if (checkError) {
      console.error("Error checking pending directory:", checkError);
      return errorResponse("Pending directory not found", 404);
    }

    if (existing.user_id !== user.id) {
      return errorResponse("Unauthorized", 403);
    }

    if (existing.status !== "pending") {
      return errorResponse(
        "Cannot delete submission that has already been reviewed",
        400
      );
    }

    // Delete pending directory
    const { error: deleteError } = await supabaseAdmin
      .from("pending_directories")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Error deleting pending directory:", deleteError);
      return errorResponse("Failed to delete pending directory", 500);
    }

    return jsonResponse({ deleted: true });
  } catch (error) {
    console.error("Error in directories DELETE API:", error);
    return errorResponse("Internal server error", 500);
  }
};
