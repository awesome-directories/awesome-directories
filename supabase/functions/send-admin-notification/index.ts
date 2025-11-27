/**
 * Supabase Edge Function for sending admin notifications via Resend
 * This function notifies admins when new directories are submitted
 * Can be called via:
 * 1. Database webhook on pending_directories table (INSERT events)
 * 2. Direct API call
 */

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { sendEmail } from "../_shared/email.ts";
import { adminNewSubmissionTemplate } from "../_shared/email-templates.ts";

const FUNCTION_SECRET = Deno.env.get("FUNCTION_SECRET");
const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") || "admin@awesome-directories.com";

interface AdminNotificationPayload {
  directory_name: string;
  directory_url: string;
  submitter_email: string;
  description?: string;
  categories?: string[];
}

interface WebhookPayload {
  type: string;
  table: string;
  record: {
    id: string;
    name: string;
    url: string;
    user_email: string;
    description?: string;
    categories?: string[];
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
    let payload: AdminNotificationPayload;

    // Handle webhook payload from pending_directories table
    if (body.type === "INSERT" && body.table === "pending_directories") {
      const webhook = body as WebhookPayload;
      const record = webhook.record;

      // Only notify for new pending submissions
      if (record.status !== "pending") {
        return new Response(
          JSON.stringify({ message: "Not a pending submission" }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      payload = {
        directory_name: record.name,
        directory_url: record.url,
        submitter_email: record.user_email,
        description: record.description,
        categories: record.categories,
      };
    } else {
      // Direct API call
      payload = body as AdminNotificationPayload;
    }

    // Validate payload
    if (!payload.directory_name || !payload.directory_url) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: directory_name, directory_url" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Generate email content
    const { html, preheader } = adminNewSubmissionTemplate({
      directoryName: payload.directory_name,
      directoryUrl: payload.directory_url,
      submitterEmail: payload.submitter_email,
      description: payload.description,
      categories: payload.categories,
    });

    // Send email to admin via Resend
    const result = await sendEmail({
      to: ADMIN_EMAIL,
      subject: `New Directory Submission: ${payload.directory_name}`,
      html,
      preheader,
    });

    if (!result.success) {
      console.error("Failed to send admin notification:", result.error);
      return new Response(
        JSON.stringify({ error: "Failed to send email", details: result.error }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Admin notification sent successfully:", result.id);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Admin notification sent",
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
