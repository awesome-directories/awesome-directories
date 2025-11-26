/**
 * Supabase Edge Function for sending welcome emails to new users via Sender.net
 * This function is triggered when a new user signs up (INSERT on auth.users via webhook)
 * Can be called via:
 * 1. Database webhook on auth.users table (INSERT events)
 * 2. Supabase Auth webhook
 * 3. Direct API call
 */

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { sendEmail } from "../_shared/email.ts";
import { welcomeEmailTemplate } from "../_shared/email-templates.ts";

const FUNCTION_SECRET = Deno.env.get("FUNCTION_SECRET");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

interface WelcomePayload {
  user_email: string;
  user_name?: string;
  user_id?: string;
}

interface AuthWebhookPayload {
  type: string;
  table: string;
  record: {
    id: string;
    email: string;
    raw_user_meta_data?: {
      full_name?: string;
      name?: string;
      user_name?: string;
    };
  };
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Verify authorization
    const authHeader = req.headers.get("Authorization");
    const apiKey = req.headers.get("apikey");
    const isAuthValid = FUNCTION_SECRET
      ? authHeader === `Bearer ${FUNCTION_SECRET}` || !!apiKey
      : !!apiKey;

    if (!isAuthValid) {
      console.error("Authorization failed");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    let payload: WelcomePayload;
    let userId: string | null = null;

    // Handle webhook payload from auth.users table
    if (body.type === "INSERT" && (body.table === "users" || body.schema === "auth")) {
      const webhook = body as AuthWebhookPayload;
      const record = webhook.record;

      // Extract user name from metadata
      const meta = record.raw_user_meta_data || {};
      const userName = meta.full_name || meta.name || meta.user_name;

      payload = {
        user_email: record.email,
        user_name: userName,
        user_id: record.id,
      };
      userId = record.id;
    } else {
      // Direct API call
      payload = body as WelcomePayload;
      userId = payload.user_id || null;
    }

    // Validate payload
    if (!payload.user_email) {
      return new Response(
        JSON.stringify({ error: "Missing required field: user_email" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check if welcome email was already sent (to prevent duplicates)
    if (userId && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const { data: existingLog } = await supabase
        .from("email_logs")
        .select("id")
        .eq("user_id", userId)
        .eq("email_type", "welcome")
        .single();

      if (existingLog) {
        return new Response(
          JSON.stringify({ message: "Welcome email already sent" }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    // Generate email content
    const { html, preheader } = welcomeEmailTemplate({
      userName: payload.user_name,
    });

    // Send email via Sender.net
    const result = await sendEmail({
      to: payload.user_email,
      subject: "Welcome to Awesome Directories!",
      html,
      preheader,
    });

    if (!result.success) {
      console.error("Failed to send email:", result.error);
      return new Response(
        JSON.stringify({ error: "Failed to send email", details: result.error }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Log the email send to prevent duplicates
    if (userId && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      await supabase.from("email_logs").insert({
        user_id: userId,
        email_type: "welcome",
        email_to: payload.user_email,
        sender_email_id: result.id,
        status: "sent",
      });
    }

    console.log("Welcome email sent successfully:", result.id);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Welcome email sent",
        email_id: result.id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
