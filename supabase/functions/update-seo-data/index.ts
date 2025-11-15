import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { updateAhrefsMetrics } from "./ahrefs.ts";

serve(async function handleRequest(req) {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);

  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    var supabaseUrl = Deno.env.get("SUPABASE_URL");
    var supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    var apifyToken = Deno.env.get("APIFY_API_TOKEN");
    var functionSecret = Deno.env.get("FUNCTION_SECRET");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase credentials");
    }

    if (!apifyToken) {
      throw new Error("Missing APIFY_API_TOKEN environment variable");
    }

    if (functionSecret) {
      var authHeader = req.headers.get("authorization");
      if (authHeader !== `Bearer ${functionSecret}`) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    var supabase = createClient(supabaseUrl, supabaseServiceKey);

    var batchSize = 10;
    var limitDirectories = null;

    if (req.method === "POST") {
      try {
        var body = await req.json();
        if (body.batchSize) {
          batchSize = body.batchSize;
        }
        if (body.limit) {
          limitDirectories = body.limit;
        }
      } catch {
      }
    }

    var result = await updateAhrefsMetrics(supabase, apifyToken, batchSize, limitDirectories);

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in update-seo-data function:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
