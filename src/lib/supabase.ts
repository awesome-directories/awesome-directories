import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Missing Supabase environment variables. Please check your .env file.\n" +
      "Required: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY",
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

export type Directory = {
  id: string;
  name: string;
  slug: string;
  url: string;
  description: string;
  categories: string[];
  domain_rating: number | null;
  is_dofollow: boolean;
  pricing_type: string;
  is_active: boolean;
  helpful_count: number;
  view_count: number;
  created_at: string;
  updated_at: string;
  submission_url?: string;
  logo_url?: string;
  notes?: string;
};
