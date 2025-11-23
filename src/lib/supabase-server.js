import { SUPABASE_URL, SUPABASE_SERVICE_KEY } from "../config.js";
import { createClient } from "@supabase/supabase-js";

var supabaseUrl = SUPABASE_URL;
var supabaseServiceKey = SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    "Missing Supabase environment variables. Please check your configuration.\n" +
      "Required: PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_KEY",
  );
}

var supabaseServer = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export default supabaseServer;
