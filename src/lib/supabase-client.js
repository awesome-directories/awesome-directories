import { createClient } from "@supabase/supabase-js";

/**
 * Client-side Supabase client for runtime interactions
 * This file is meant to be imported in browser-side code
 */

// Get environment variables from window (injected by Astro)
const supabaseUrl =
  import.meta.env.PUBLIC_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey =
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Missing Supabase environment variables. Please check your configuration.\n" +
      "Required: PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY",
  );
}

// Use placeholder values during build if env vars are missing
// These will be replaced with actual values in the browser at runtime
const buildUrl = supabaseUrl || "https://placeholder.supabase.co";
const buildKey = supabaseAnonKey || "placeholder-key";

export const supabase = createClient(buildUrl, buildKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
  },
});

/**
 * Get the current user session
 */
export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error("Error getting session:", error);
    return null;
  }
  return data.session;
}

/**
 * Get the current user
 */
export async function getUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error("Error getting user:", error);
    return null;
  }
  return data.user;
}

/**
 * Sign in with OAuth provider
 */
export async function signInWithOAuth(provider) {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/`,
    },
  });
  if (error) {
    console.error(`Error signing in with ${provider}:`, error);
    return { error };
  }
  return { data };
}

/**
 * Sign out
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Error signing out:", error);
    return { error };
  }
  return { error: null };
}
