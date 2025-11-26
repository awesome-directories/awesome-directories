/**
 * Email templates for Awesome Directories
 * All templates use the shared wrapper for consistent branding
 */

import {
  wrapEmailTemplate,
  escapeHtml,
  statusBadge,
  ctaButton,
  getSiteUrl,
} from "./email.ts";

const SITE_URL = getSiteUrl();

/**
 * Directory Approval Email
 */
export function approvalEmailTemplate(params: {
  directoryName: string;
  directoryUrl: string;
  adminNotes?: string;
}): { html: string; preheader: string } {
  const { directoryName, adminNotes } = params;

  const content = `
    <div style="text-align: center; margin-bottom: 24px;">
      ${statusBadge("approved")}
    </div>

    <h1 style="margin: 0 0 16px; font-size: 22px; font-weight: 700; color: #18181b; text-align: center; line-height: 1.3;">
      Your submission has been approved!
    </h1>

    <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.6; color: #52525b; text-align: center;">
      Great news! <strong style="color: #18181b;">${escapeHtml(directoryName)}</strong> has been reviewed and added to Awesome Directories.
    </p>

    ${adminNotes ? `
    <div style="margin: 0 0 24px; padding: 16px; background-color: #f4f4f5; border-radius: 8px; border-left: 4px solid #2563eb;">
      <p style="margin: 0 0 4px; font-size: 11px; font-weight: 600; color: #71717a; text-transform: uppercase; letter-spacing: 0.5px;">Reviewer Notes</p>
      <p style="margin: 0; font-size: 14px; color: #3f3f46; line-height: 1.5;">${escapeHtml(adminNotes)}</p>
    </div>
    ` : ""}

    <div style="text-align: center;">
      ${ctaButton("View Directory", SITE_URL)}
    </div>
  `;

  return {
    html: wrapEmailTemplate(content, `Your directory "${directoryName}" has been approved!`),
    preheader: `Your directory "${directoryName}" has been approved!`,
  };
}

/**
 * Directory Rejection Email
 */
export function rejectionEmailTemplate(params: {
  directoryName: string;
  directoryUrl: string;
  adminNotes?: string;
}): { html: string; preheader: string } {
  const { directoryName, adminNotes } = params;

  const content = `
    <div style="text-align: center; margin-bottom: 24px;">
      ${statusBadge("rejected")}
    </div>

    <h1 style="margin: 0 0 16px; font-size: 22px; font-weight: 700; color: #18181b; text-align: center; line-height: 1.3;">
      Submission not approved
    </h1>

    <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.6; color: #52525b; text-align: center;">
      Unfortunately, <strong style="color: #18181b;">${escapeHtml(directoryName)}</strong> wasn't approved for inclusion in Awesome Directories at this time.
    </p>

    ${adminNotes ? `
    <div style="margin: 0 0 24px; padding: 16px; background-color: #f4f4f5; border-radius: 8px; border-left: 4px solid #ef4444;">
      <p style="margin: 0 0 4px; font-size: 11px; font-weight: 600; color: #71717a; text-transform: uppercase; letter-spacing: 0.5px;">Feedback</p>
      <p style="margin: 0; font-size: 14px; color: #3f3f46; line-height: 1.5;">${escapeHtml(adminNotes)}</p>
    </div>
    ` : `
    <div style="margin: 0 0 24px; padding: 16px; background-color: #f4f4f5; border-radius: 8px;">
      <p style="margin: 0; font-size: 14px; color: #52525b; line-height: 1.5;">
        Common reasons for rejection include: duplicate directories, inactive websites, or content that doesn't fit our directory focus.
      </p>
    </div>
    `}

    <p style="margin: 0 0 24px; font-size: 14px; color: #71717a; text-align: center;">
      Feel free to submit other directories that might be a better fit.
    </p>

    <div style="text-align: center;">
      ${ctaButton("Submit Another Directory", `${SITE_URL}/submit`, "#52525b")}
    </div>
  `;

  return {
    html: wrapEmailTemplate(content, `Update on your submission "${directoryName}"`),
    preheader: `Update on your submission "${directoryName}"`,
  };
}

/**
 * Submission Confirmation Email
 */
export function submissionConfirmationTemplate(params: {
  directoryName: string;
  directoryUrl: string;
}): { html: string; preheader: string } {
  const { directoryName } = params;

  const content = `
    <div style="text-align: center; margin-bottom: 24px;">
      ${statusBadge("submitted")}
    </div>

    <h1 style="margin: 0 0 16px; font-size: 22px; font-weight: 700; color: #18181b; text-align: center; line-height: 1.3;">
      Submission received!
    </h1>

    <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.6; color: #52525b; text-align: center;">
      Thanks for submitting <strong style="color: #18181b;">${escapeHtml(directoryName)}</strong> to Awesome Directories.
    </p>

    <div style="margin: 0 0 24px; padding: 16px; background-color: #f0fdf4; border-radius: 8px;">
      <p style="margin: 0 0 8px; font-size: 14px; font-weight: 600; color: #166534;">What happens next?</p>
      <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #3f3f46; line-height: 1.6;">
        <li>Our team will review your submission within 2-3 business days</li>
        <li>We'll verify the directory is active and meets our quality standards</li>
        <li>You'll receive an email once we've made a decision</li>
      </ul>
    </div>

    <div style="text-align: center;">
      ${ctaButton("Track Your Submissions", `${SITE_URL}/my-submissions`)}
    </div>
  `;

  return {
    html: wrapEmailTemplate(content, `We received your submission for "${directoryName}"`),
    preheader: `We received your submission for "${directoryName}"`,
  };
}

/**
 * Welcome Email for New Users
 */
export function welcomeEmailTemplate(params: {
  userName?: string;
}): { html: string; preheader: string } {
  const greeting = params.userName ? `Hi ${escapeHtml(params.userName)}!` : "Welcome!";

  const content = `
    <h1 style="margin: 0 0 16px; font-size: 22px; font-weight: 700; color: #18181b; text-align: center; line-height: 1.3;">
      ${greeting}
    </h1>

    <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.6; color: #52525b; text-align: center;">
      Welcome to Awesome Directories! We help indie hackers and founders discover the best places to launch their products.
    </p>

    <div style="margin: 0 0 24px; padding: 20px; background-color: #f4f4f5; border-radius: 8px;">
      <p style="margin: 0 0 12px; font-size: 14px; font-weight: 600; color: #18181b;">Here's what you can do:</p>
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td style="padding: 8px 0; font-size: 14px; color: #3f3f46;">
            <strong style="color: #2563eb;">Browse 388+ directories</strong> with filters for DR, pricing, and categories
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-size: 14px; color: #3f3f46;">
            <strong style="color: #2563eb;">Save favorites</strong> to build your personalized launch list
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-size: 14px; color: #3f3f46;">
            <strong style="color: #2563eb;">Track submissions</strong> across multiple projects
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-size: 14px; color: #3f3f46;">
            <strong style="color: #2563eb;">Submit directories</strong> we're missing to help the community
          </td>
        </tr>
      </table>
    </div>

    <div style="text-align: center;">
      ${ctaButton("Start Exploring", SITE_URL)}
    </div>
  `;

  return {
    html: wrapEmailTemplate(content, "Welcome to Awesome Directories - discover 388+ launch directories"),
    preheader: "Welcome to Awesome Directories - discover 388+ launch directories",
  };
}

/**
 * Admin Notification for New Submissions
 */
export function adminNewSubmissionTemplate(params: {
  directoryName: string;
  directoryUrl: string;
  submitterEmail: string;
  description?: string;
  categories?: string[];
}): { html: string; preheader: string } {
  const { directoryName, directoryUrl, submitterEmail, description, categories } = params;

  const content = `
    <div style="text-align: center; margin-bottom: 24px;">
      ${statusBadge("pending")}
    </div>

    <h1 style="margin: 0 0 16px; font-size: 22px; font-weight: 700; color: #18181b; text-align: center; line-height: 1.3;">
      New Directory Submission
    </h1>

    <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.6; color: #52525b; text-align: center;">
      A new directory has been submitted for review.
    </p>

    <div style="margin: 0 0 24px; padding: 16px; background-color: #f4f4f5; border-radius: 8px;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td style="padding: 8px 0; font-size: 13px; color: #71717a; width: 100px;">Directory</td>
          <td style="padding: 8px 0; font-size: 14px; color: #18181b; font-weight: 600;">${escapeHtml(directoryName)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-size: 13px; color: #71717a;">URL</td>
          <td style="padding: 8px 0; font-size: 14px;"><a href="${escapeHtml(directoryUrl)}" style="color: #2563eb;">${escapeHtml(directoryUrl)}</a></td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-size: 13px; color: #71717a;">Submitted by</td>
          <td style="padding: 8px 0; font-size: 14px; color: #3f3f46;">${escapeHtml(submitterEmail)}</td>
        </tr>
        ${categories && categories.length > 0 ? `
        <tr>
          <td style="padding: 8px 0; font-size: 13px; color: #71717a;">Categories</td>
          <td style="padding: 8px 0; font-size: 14px; color: #3f3f46;">${categories.map(c => escapeHtml(c)).join(", ")}</td>
        </tr>
        ` : ""}
      </table>
      ${description ? `
      <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e4e4e7;">
        <p style="margin: 0 0 4px; font-size: 13px; color: #71717a;">Description</p>
        <p style="margin: 0; font-size: 14px; color: #3f3f46; line-height: 1.5;">${escapeHtml(description)}</p>
      </div>
      ` : ""}
    </div>

    <div style="text-align: center;">
      ${ctaButton("Review in Supabase", "https://supabase.com/dashboard")}
    </div>
  `;

  return {
    html: wrapEmailTemplate(content, `New submission: ${directoryName}`),
    preheader: `New submission: ${directoryName}`,
  };
}

/**
 * Review Notification (when someone reviews a directory you submitted)
 */
export function reviewNotificationTemplate(params: {
  directoryName: string;
  directorySlug: string;
  reviewerName?: string;
  rating: number;
  comment?: string;
}): { html: string; preheader: string } {
  const { directoryName, directorySlug, reviewerName, rating, comment } = params;
  const reviewer = reviewerName || "Someone";
  const stars = "★".repeat(rating) + "☆".repeat(5 - rating);

  const content = `
    <h1 style="margin: 0 0 16px; font-size: 22px; font-weight: 700; color: #18181b; text-align: center; line-height: 1.3;">
      New review on your directory
    </h1>

    <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.6; color: #52525b; text-align: center;">
      ${escapeHtml(reviewer)} left a review on <strong style="color: #18181b;">${escapeHtml(directoryName)}</strong>
    </p>

    <div style="margin: 0 0 24px; padding: 20px; background-color: #f4f4f5; border-radius: 8px; text-align: center;">
      <div style="font-size: 24px; color: #f59e0b; letter-spacing: 2px; margin-bottom: 8px;">${stars}</div>
      <p style="margin: 0; font-size: 14px; color: #71717a;">${rating} out of 5 stars</p>
      ${comment ? `
      <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e4e4e7; text-align: left;">
        <p style="margin: 0; font-size: 14px; color: #3f3f46; line-height: 1.6; font-style: italic;">"${escapeHtml(comment)}"</p>
      </div>
      ` : ""}
    </div>

    <div style="text-align: center;">
      ${ctaButton("View Directory", `${SITE_URL}/directory/${directorySlug}`)}
    </div>
  `;

  return {
    html: wrapEmailTemplate(content, `${reviewer} reviewed ${directoryName}`),
    preheader: `${reviewer} reviewed ${directoryName}`,
  };
}
