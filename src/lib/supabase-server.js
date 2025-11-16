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

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please check your .env file.\n" +
      "Required: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY or PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY",
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});
