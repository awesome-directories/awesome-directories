import { createClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client for build-time data fetching
 * Uses import.meta.env which is available during build
 */
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

/**
 * If Supabase credentials are missing, supabase will be null.
 * Downstream code should check for this and handle gracefully.
 */
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false,
        },
      })
    : null;
