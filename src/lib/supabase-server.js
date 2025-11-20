import { SUPABASE_URL, SUPABASE_ANON_KEY } from "../config.js";
import { createClient } from "@supabase/supabase-js";
import log from "./logger.js";

/**
 * Server-side Supabase client for build-time operations
 * This file is used during SSG (Static Site Generation)
 */

const supabaseUrl = SUPABASE_URL;
const supabaseAnonKey = SUPABASE_ANON_KEY;

// Create a client only if we have valid credentials
// During build without credentials, return a mock client
let supabase;

if (supabaseUrl && supabaseAnonKey && supabaseUrl !== 'https://dummy-project.supabase.co') {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    });
    log.info('Supabase server client initialized successfully');
  } catch (error) {
    log.error('Failed to initialize Supabase server client:', error);
    supabase = null;
  }
} else {
  log.warn('Supabase credentials not provided or using dummy values. Running in offline mode.');
  supabase = null;
}

export { supabase };
