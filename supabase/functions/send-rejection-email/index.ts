/**
 * Supabase Edge Function for sending directory rejection emails via Resend
 * This function is triggered when a pending_directories status changes to 'rejected'
 * Can be called via:
 * 1. Database webhook on pending_directories table
 * 2. Direct API call from admin dashboard
 */

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { sendEmail } from "../_shared/email.ts";
import { rejectionEmailTemplate } from "../_shared/email-templates.ts";
import { requireServiceRole } from "../_shared/auth.ts";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

interface RejectionPayload {
  user_email: string;
  directory_name: string;
  directory_url: string;
  admin_notes?: string;
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
    admin_notes?: string;
    rejection_notification_sent?: boolean;
  };
  old_record?: {
    status: string;
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
    let payload: RejectionPayload;
    let recordId: string | null = null;

    // Handle both direct API calls and webhook payloads
    if (body.type === "UPDATE" && body.table === "pending_directories") {
      // Database webhook payload
      const webhook = body as WebhookPayload;
      const record = webhook.record;
      const oldRecord = webhook.old_record;

      // Only send email if status changed to rejected and notification not already sent
      if (
        record.status !== "rejected" ||
        oldRecord?.status === "rejected" ||
        record.rejection_notification_sent
      ) {
        return new Response(
          JSON.stringify({ message: "No notification needed" }),
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
        admin_notes: record.admin_notes,
      };
      recordId = record.id;
    } else {
      // Direct API call
      payload = body as RejectionPayload;
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
    const { html, preheader } = rejectionEmailTemplate({
      directoryName: payload.directory_name,
      directoryUrl: payload.directory_url,
      adminNotes: payload.admin_notes,
    });

    // Send email via Resend
    const result = await sendEmail({
      to: payload.user_email,
      subject: `Update on your directory submission "${payload.directory_name}"`,
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

    // Update rejection_notification_sent flag if we have a record ID
    if (recordId && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      await supabase
        .from("pending_directories")
        .update({
          rejection_notification_sent: true,
          rejection_notification_sent_at: new Date().toISOString(),
        })
        .eq("id", recordId);
    }

    console.log("Rejection email sent successfully:", result.id);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Rejection email sent",
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
