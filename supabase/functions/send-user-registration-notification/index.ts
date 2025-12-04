/**
 * Supabase Edge Function for notifying admins about new user registrations via Resend
 * This function notifies admins when new users sign up
 * Can be called via:
 * 1. Database webhook on auth.users table (INSERT events)
 * 2. Supabase Auth webhook
 * 3. Direct API call
 */

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { sendEmail } from "../_shared/email.ts";
import { adminUserRegistrationTemplate } from "../_shared/email-templates.ts";

const FUNCTION_SECRET = Deno.env.get("FUNCTION_SECRET");
const ADMIN_EMAIL =
  Deno.env.get("ADMIN_EMAIL") || "admin@awesome-directories.com";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

interface UserRegistrationPayload {
  user_email: string;
  user_name?: string;
  user_id?: string;
  auth_provider?: string;
}

interface AuthWebhookPayload {
  type: string;
  table: string;
  schema?: string;
  record: {
    id: string;
    email: string;
    created_at: string;
    raw_app_meta_data?: {
      provider?: string;
    };
    raw_user_meta_data?: {
      full_name?: string;
      name?: string;
      user_name?: string;
      avatar_url?: string;
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
    const body = await req.json();
    let payload: UserRegistrationPayload;
    let userId: string | null = null;
    let registeredAt: string = new Date().toISOString();

    // Handle webhook payload from auth.users table
    if (
      body.type === "INSERT" &&
      (body.table === "users" || body.schema === "auth")
    ) {
      const webhook = body as AuthWebhookPayload;
      const record = webhook.record;

      // Extract user name from metadata
      const userMeta = record.raw_user_meta_data || {};
      const appMeta = record.raw_app_meta_data || {};
      const userName = userMeta.full_name || userMeta.name || userMeta.user_name;

      payload = {
        user_email: record.email,
        user_name: userName,
        user_id: record.id,
        auth_provider: appMeta.provider,
      };
      userId = record.id;
      registeredAt = record.created_at || registeredAt;
    } else {
      // Direct API call
      payload = body as UserRegistrationPayload;
      userId = payload.user_id || null;
    }

    // Validate payload
    if (!payload.user_email) {
      return new Response(
        JSON.stringify({ error: "Missing required field: user_email" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Check if notification was already sent (to prevent duplicates)
    if (userId && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const { data: existingLog } = await supabase
        .from("email_logs")
        .select("id")
        .eq("user_id", userId)
        .eq("email_type", "admin_user_registration")
        .single();

      if (existingLog) {
        return new Response(
          JSON.stringify({
            message: "Admin notification already sent for this user",
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
    }

    // Format the registration date for display
    const formattedDate = new Date(registeredAt).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    // Generate email content
    const { html, preheader } = adminUserRegistrationTemplate({
      userEmail: payload.user_email,
      userName: payload.user_name,
      authProvider: payload.auth_provider,
      registeredAt: formattedDate,
    });

    // Send email to admin via Resend
    const result = await sendEmail({
      to: ADMIN_EMAIL,
      subject: `New User Registration: ${payload.user_email}`,
      html,
      preheader,
    });

    if (!result.success) {
      console.error("Failed to send admin notification:", result.error);
      return new Response(
        JSON.stringify({
          error: "Failed to send email",
          details: result.error,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Log the email send to prevent duplicates
    if (userId && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      await supabase.from("email_logs").insert({
        user_id: userId,
        email_type: "admin_user_registration",
        email_to: ADMIN_EMAIL,
        email_subject: `New User Registration: ${payload.user_email}`,
        sender_email_id: result.id,
        status: "sent",
      });
    }

    console.log("Admin user registration notification sent successfully:", result.id);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Admin notification sent",
        email_id: result.id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
