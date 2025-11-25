// Supabase Edge Function for sending directory approval emails via Resend
// This function is triggered when a pending_directories status changes to 'approved'
// Can be called via:
// 1. Database webhook on pending_directories table
// 2. Direct API call from admin dashboard

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FUNCTION_SECRET = Deno.env.get("FUNCTION_SECRET");
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "Awesome Directories <notifications@awesome-directories.com>";
const SITE_URL = "https://awesome-directories.com";

interface ApprovalPayload {
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
    notification_sent: boolean;
  };
  old_record?: {
    status: string;
  };
}

serve(async (req: Request) => {
  // CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

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
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured");
      return new Response(JSON.stringify({ error: "Email service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();

    let payload: ApprovalPayload;

    // Handle both direct API calls and webhook payloads
    if (body.type === "UPDATE" && body.table === "pending_directories") {
      // Database webhook payload
      const webhook = body as WebhookPayload;
      const record = webhook.record;
      const oldRecord = webhook.old_record;

      // Only send email if status changed to approved and notification not already sent
      if (
        record.status !== "approved" ||
        oldRecord?.status === "approved" ||
        record.notification_sent
      ) {
        return new Response(JSON.stringify({ message: "No notification needed" }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      payload = {
        user_email: record.user_email,
        directory_name: record.name,
        directory_url: record.url,
        admin_notes: record.admin_notes,
      };
    } else {
      // Direct API call
      payload = body as ApprovalPayload;
    }

    // Validate payload
    if (!payload.user_email || !payload.directory_name) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate email HTML
    const emailHtml = generateApprovalEmail(payload);

    // Send email via Resend
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: payload.user_email,
        subject: `Your directory submission "${payload.directory_name}" has been approved!`,
        html: emailHtml,
      }),
    });

    if (!resendResponse.ok) {
      const error = await resendResponse.text();
      console.error("Resend API error:", error);
      return new Response(JSON.stringify({ error: "Failed to send email" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resendData = await resendResponse.json();
    console.log("Email sent successfully:", resendData.id);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Approval email sent",
        email_id: resendData.id,
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

/**
 * Generate a clean, minimal approval email HTML
 * Designed to be small, professional, and avoid spam filters
 */
function generateApprovalEmail(payload: ApprovalPayload): string {
  const { directory_name, admin_notes } = payload;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Directory Approved</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f9fafb;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 24px; text-align: center; border-bottom: 1px solid #e5e7eb;">
              <div style="font-size: 24px; font-weight: 700; color: #111827;">
                Awesome Directories
              </div>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <div style="display: inline-block; padding: 12px 16px; background-color: #d1fae5; border-radius: 9999px;">
                  <span style="font-size: 14px; font-weight: 600; color: #065f46;">Approved</span>
                </div>
              </div>

              <h1 style="margin: 0 0 16px; font-size: 20px; font-weight: 600; color: #111827; text-align: center;">
                Your submission has been approved!
              </h1>

              <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.6; color: #4b5563; text-align: center;">
                Great news! Your directory submission <strong style="color: #111827;">${escapeHtml(directory_name)}</strong> has been reviewed and approved.
              </p>

              ${admin_notes ? `
              <div style="margin: 0 0 24px; padding: 16px; background-color: #f3f4f6; border-radius: 6px;">
                <p style="margin: 0 0 4px; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase;">Reviewer Notes</p>
                <p style="margin: 0; font-size: 14px; color: #374151;">${escapeHtml(admin_notes)}</p>
              </div>
              ` : ''}

              <div style="text-align: center;">
                <a href="${SITE_URL}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 6px;">
                  View on Awesome Directories
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0 0 8px; font-size: 13px; color: #6b7280;">
                Thank you for contributing to our community!
              </p>
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                <a href="${SITE_URL}" style="color: #6b7280; text-decoration: none;">awesome-directories.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();
}

/**
 * Escape HTML special characters to prevent XSS
 */
function escapeHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
