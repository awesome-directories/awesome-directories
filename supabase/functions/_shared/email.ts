/**
 * Shared email utilities for Supabase Edge Functions
 * Uses Resend API for transactional emails
 */

import { Resend } from "npm:resend@4.0.0";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL =
  "Awesome Directories <noreply@notification.awesome-directories.com>";
const REPLY_TO_EMAIL =
  Deno.env.get("REPLY_TO_EMAIL") || "support@awesome-directories.com";
const SITE_URL = Deno.env.get("SITE_URL") || "https://awesome-directories.com";

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  preheader?: string;
  title?: string;
}

export interface SendResult {
  success: boolean;
  id?: string;
  error?: string;
}

/**
 * Send an email via Resend API
 */
export async function sendEmail(options: EmailOptions): Promise<SendResult> {
  if (!RESEND_API_KEY) {
    console.error("RESEND_API_KEY not configured");
    return { success: false, error: "Email service not configured" };
  }

  try {
    const resend = new Resend(RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [options.to],
      subject: options.subject,
      html: options.html,
      reply_to: REPLY_TO_EMAIL,
    });

    if (error) {
      console.error("Resend API error:", error);
      return { success: false, error: error.message };
    }

    console.log("Email sent successfully:", data?.id);
    return { success: true, id: data?.id };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Escape HTML special characters to prevent XSS
 */
export function escapeHtml(text: string): string {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Get the site URL
 */
export function getSiteUrl(): string {
  return SITE_URL;
}

/**
 * Base email template wrapper
 * Production-ready HTML email template compatible with major email clients
 */
export function wrapEmailTemplate(
  content: string,
  previewText?: string,
): string {
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no">
  <title>Awesome Directories</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    body { margin: 0; padding: 0; width: 100% !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
    a { text-decoration: none; }
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; padding: 16px !important; }
      .content { padding: 24px 16px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  ${previewText ? `<!--[if !mso]><!--><div style="display: none; max-height: 0; overflow: hidden;">${escapeHtml(previewText)}</div><!--<![endif]-->` : ""}

  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f4f5;">
    <tr>
      <td style="padding: 32px 16px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 520px; margin: 0 auto;" class="container">
          <!-- Header -->
          <tr>
            <td style="padding: 24px; text-align: center; background-color: #18181b; border-radius: 12px 12px 0 0;">
              <a href="${SITE_URL}" style="font-size: 20px; font-weight: 700; color: #ffffff; text-decoration: none;">
                Awesome Directories
              </a>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 32px 24px; background-color: #ffffff;" class="content">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px; background-color: #fafafa; border-radius: 0 0 12px 12px; border-top: 1px solid #e4e4e7;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="text-align: center;">
                    <p style="margin: 0 0 8px; font-size: 13px; color: #71717a;">
                      Discover 300+ directories for your next launch
                    </p>
                    <p style="margin: 0; font-size: 12px; color: #a1a1aa;">
                      <a href="${SITE_URL}" style="color: #71717a;">awesome-directories.com</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- Unsubscribe -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 520px; margin: 16px auto 0;">
          <tr>
            <td style="text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #a1a1aa;">
                You're receiving this because you have an account on Awesome Directories.
                <br>
                <a href="${SITE_URL}/email-preferences" style="color: #71717a;">Manage email preferences</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

/**
 * Generate a status badge HTML
 */
export function statusBadge(
  status: "approved" | "rejected" | "pending" | "submitted",
): string {
  const styles: Record<string, { bg: string; text: string; label: string }> = {
    approved: { bg: "#dcfce7", text: "#166534", label: "Approved" },
    rejected: { bg: "#fee2e2", text: "#991b1b", label: "Rejected" },
    pending: { bg: "#fef3c7", text: "#92400e", label: "Pending" },
    submitted: { bg: "#dbeafe", text: "#1e40af", label: "Submitted" },
  };

  const style = styles[status] || styles.pending;
  return `<span style="display: inline-block; padding: 6px 12px; background-color: ${style.bg}; color: ${style.text}; font-size: 12px; font-weight: 600; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.5px;">${style.label}</span>`;
}

/**
 * Generate a CTA button HTML
 */
export function ctaButton(
  text: string,
  url: string,
  color: string = "#2563eb",
): string {
  return `<a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: ${color}; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 8px; text-align: center;">${escapeHtml(text)}</a>`;
}
