/**
 * Supabase Edge Function for sending submission confirmation emails via Resend
 * This function is triggered when a new directory is submitted (INSERT on pending_directories)
 * Can be called via:
 * 1. Database webhook on pending_directories table (INSERT events)
 * 2. Direct API call
 */

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { sendEmail } from "../_shared/email.ts";
import { submissionConfirmationTemplate } from "../_shared/email-templates.ts";
import { requireServiceRole } from "../_shared/auth.ts";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

interface SubmissionPayload {
  user_email: string;
  directory_name: string;
  directory_url: string;
}

interface WebhookPayload {
  type: string;
  table: string;
  record: {
    id: string;
    user_email: string;
    name: string;
    url: string;
    status: string;
    confirmation_sent?: boolean;
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

  // Verify service_role authorization
  const authError = requireServiceRole(req, corsHeaders);
  if (authError) return authError;

  try {
    const body = await req.json();
    let payload: SubmissionPayload;
    let recordId: string | null = null;

    // Handle both direct API calls and webhook payloads
    if (body.type === "INSERT" && body.table === "pending_directories") {
      // Database webhook payload for new submission
      const webhook = body as WebhookPayload;
      const record = webhook.record;

      // Skip if confirmation already sent
      if (record.confirmation_sent) {
        return new Response(
          JSON.stringify({ message: "Confirmation already sent" }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      payload = {
        user_email: record.user_email,
        directory_name: record.name,
        directory_url: record.url,
      };
      recordId = record.id;
    } else {
      // Direct API call
      payload = body as SubmissionPayload;
    }

    // Validate payload
    if (!payload.user_email || !payload.directory_name) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: user_email, directory_name",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Generate email content
    const { html, preheader } = submissionConfirmationTemplate({
      directoryName: payload.directory_name,
      directoryUrl: payload.directory_url,
    });

    // Send email via Resend
    const result = await sendEmail({
      to: payload.user_email,
      subject: `We received your submission for "${payload.directory_name}"`,
      html,
      preheader,
    });

    if (!result.success) {
      console.error("Failed to send email:", result.error);
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

    // Update confirmation_sent flag if we have a record ID
    if (recordId && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      await supabase
        .from("pending_directories")
        .update({
          confirmation_sent: true,
          confirmation_sent_at: new Date().toISOString(),
        })
        .eq("id", recordId);
    }

    console.log("Submission confirmation email sent successfully:", result.id);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Confirmation email sent",
        email_id: result.id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
