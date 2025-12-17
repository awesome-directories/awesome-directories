/**
 * Shared authentication utilities for Supabase Edge Functions
 * Verifies that requests are made with service_role credentials
 */

export interface AuthResult {
  authorized: boolean;
  error?: string;
  role?: string;
}

/**
 * Verify that the request is made with a service_role JWT
 *
 * This ensures the Edge Function can only be called by:
 * - Supabase database webhooks (which use service_role)
 * - Server-side code using the service_role key
 * - Admin/backend services
 *
 * NOT by:
 * - Frontend code using anon key
 * - Unauthenticated requests
 *
 * @param req The incoming request object
 * @returns AuthResult with authorization status
 */
export function verifyServiceRole(req: Request): AuthResult {
  const authHeader = req.headers.get("Authorization");

  if (!authHeader) {
    return {
      authorized: false,
      error: "Missing authorization header",
    };
  }

  // Extract the token (remove "Bearer " prefix)
  const token = authHeader.replace("Bearer ", "");

  if (!token || token === authHeader) {
    return {
      authorized: false,
      error: "Invalid authorization header format",
    };
  }

  try {
    // JWT structure: header.payload.signature
    const parts = token.split(".");

    if (parts.length !== 3) {
      return {
        authorized: false,
        error: "Invalid JWT format",
      };
    }

    // Decode the payload (middle segment)
    // Note: We only decode, not verify signature here because
    // Supabase's infrastructure already validates JWT signatures
    const payloadBase64 = parts[1];

    // Handle base64url encoding (replace - with + and _ with /)
    const normalizedBase64 = payloadBase64
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    // Add padding to make the length a multiple of 4
    const padding = "=".repeat((4 - (normalizedBase64.length % 4)) % 4);
    const payloadJson = atob(normalizedBase64 + padding);
    const payload = JSON.parse(payloadJson);

    // Check for service_role
    if (payload.role !== "service_role") {
      return {
        authorized: false,
        error: "Forbidden: service_role required",
      };
    }

    return {
      authorized: true,
      role: payload.role,
    };
  } catch (error) {
    console.error("JWT decode error:", error);
    return {
      authorized: false,
      error: "Failed to decode authorization token",
    };
  }
}

/**
 * Create a 401/403 response for unauthorized requests
 */
export function unauthorizedResponse(
  error: string,
  status: 401 | 403 = 401,
  corsHeaders: Record<string, string> = {},
): Response {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/**
 * Verify service role and return early response if not authorized
 * Returns null if authorized, or a Response object if not
 *
 * Usage:
 * ```
 * const authError = requireServiceRole(req, corsHeaders);
 * if (authError) return authError;
 * // ... rest of the function
 * ```
 */
export function requireServiceRole(
  req: Request,
  corsHeaders: Record<string, string> = {},
): Response | null {
  const auth = verifyServiceRole(req);

  if (!auth.authorized) {
    const status = auth.error?.includes("Missing") ? 401 : 403;
    return unauthorizedResponse(
      auth.error || "Unauthorized",
      status,
      corsHeaders,
    );
  }

  return null;
}
