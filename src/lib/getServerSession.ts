import { createClient } from "@supabase/supabase-js";
import type { AstroCookies } from "astro";

/**
 * Server-side session management for Astro pages
 * Reads auth session from cookies for SSR
 */

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

/**
 * Get user session from Astro cookies
 * Useful for SSR pages that need to check authentication state
 *
 * @param cookies - Astro cookies object
 * @returns Session object if authenticated, null otherwise
 */
export async function getServerSession(cookies: AstroCookies) {
  // Supabase stores the session in cookies with these keys
  const accessToken = cookies.get("sb-access-token")?.value;
  const refreshToken = cookies.get("sb-refresh-token")?.value;

  if (!accessToken) {
    return null;
  }

  try {
    // Create a Supabase client for this request
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    });

    // Verify the access token
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return null;
    }

    return {
      user,
      accessToken,
      refreshToken,
    };
  } catch (error) {
    console.error("Error getting server session:", error);
    return null;
  }
}

/**
 * Check if user is authenticated (server-side)
 *
 * @param cookies - Astro cookies object
 * @returns Boolean indicating authentication status
 */
export async function isAuthenticated(cookies: AstroCookies): Promise<boolean> {
  const session = await getServerSession(cookies);
  return session !== null;
}
