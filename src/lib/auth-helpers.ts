import { createClient } from "@supabase/supabase-js";
import type { APIContext } from "astro";

/**
 * Auth helpers for API routes
 * Verifies JWT tokens from Supabase Auth
 */

let supabaseAdminInstance: ReturnType<typeof createClient> | null = null;

/**
 * Get or create Supabase admin client for API routes
 * Lazy initialization to avoid build-time errors when env vars are not available
 */
function getSupabaseAdmin() {
  if (supabaseAdminInstance) {
    return supabaseAdminInstance;
  }

  const supabaseUrl =
    import.meta.env.PUBLIC_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey =
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY ||
    import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables. Required: PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  supabaseAdminInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });

  return supabaseAdminInstance;
}

/**
 * Export supabaseAdmin using a getter to ensure lazy initialization
 * This prevents build-time errors when environment variables are not available
 */
export const supabaseAdmin = new Proxy({} as ReturnType<typeof createClient>, {
  get(_target, prop) {
    const client = getSupabaseAdmin();
    return (client as any)[prop];
  },
});

/**
 * Get authenticated user from API request
 * Extracts JWT from Authorization header and verifies it
 *
 * @param context - Astro API context
 * @returns User object if authenticated, null otherwise
 */
export async function getAuthenticatedUser(context: APIContext) {
  const authHeader = context.request.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    const supabaseAdmin = getSupabaseAdmin();
    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      console.error("Error verifying token:", error);
      return null;
    }

    return user;
  } catch (error) {
    console.error("Exception verifying token:", error);
    return null;
  }
}

/**
 * Require authentication for an API route
 * Returns user if authenticated, or error response if not
 *
 * @param context - Astro API context
 * @returns Object with user or error response
 */
export async function requireAuth(context: APIContext): Promise<
  | { user: any; error: null }
  | { user: null; error: Response }
> {
  const user = await getAuthenticatedUser(context);

  if (!user) {
    return {
      user: null,
      error: new Response(
        JSON.stringify({
          error: "Unauthorized",
          message: "You must be logged in to perform this action",
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        }
      ),
    };
  }

  return { user, error: null };
}

/**
 * Get client IP address for rate limiting and vote tracking
 * Handles proxies and load balancers
 *
 * @param context - Astro API context
 * @returns IP address or 'unknown'
 */
export function getClientIP(context: APIContext): string {
  const forwarded = context.request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIp = context.request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  return context.clientAddress || "unknown";
}

/**
 * Hash IP address for privacy-preserving vote tracking
 *
 * @param ip - IP address
 * @returns Hashed IP
 */
export async function hashIP(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hashHex;
}

/**
 * Create JSON response helper
 *
 * @param data - Response data
 * @param status - HTTP status code
 * @returns Response object
 */
export function jsonResponse(data: any, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

/**
 * Create error response helper
 *
 * @param message - Error message
 * @param status - HTTP status code
 * @returns Response object
 */
export function errorResponse(message: string, status: number = 400): Response {
  return jsonResponse({ error: message }, status);
}
