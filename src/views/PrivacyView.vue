<template>
  <div class="min-h-screen bg-gray-50 py-12">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 class="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
      <p class="text-gray-600 mb-8">Last Updated: November 12, 2025</p>

      <div class="space-y-8">
        <!-- Introduction -->
        <div class="card p-8 bg-blue-50 border-blue-200">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">
            Our Commitment to Privacy
          </h2>
          <p class="text-gray-700 leading-relaxed mb-4">
            Awesome Directories is an open-source project that respects your
            privacy. We collect minimal data necessary to provide our service
            and never sell your personal information to third parties.
          </p>
          <p class="text-gray-700 leading-relaxed">
            This privacy policy explains what data we collect, how we use it,
            and your rights regarding your personal information. As an
            open-source project, we prioritize transparency and user control.
          </p>
        </div>

        <!-- Data We Collect -->
        <div class="card p-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">
            1. Information We Collect
          </h2>

          <h3 class="text-lg font-semibold text-gray-900 mb-3">
            1.1 Authentication Data (via Supabase)
          </h3>
          <p class="text-gray-700 leading-relaxed mb-4">
            When you create an account using OAuth authentication, we collect:
          </p>
          <ul class="list-disc list-inside text-gray-700 space-y-2 mb-4">
            <li>
              <strong>Email address</strong> - From your Google or GitHub
              account
            </li>
            <li>
              <strong>OAuth provider ID</strong> - Unique identifier from Google
              or GitHub
            </li>
            <li>
              <strong>Display name/username</strong> - Public profile
              information from your OAuth provider
            </li>
            <li>
              <strong>Profile picture</strong> - Avatar from your OAuth provider
              (if available)
            </li>
            <li>
              <strong>Account creation date</strong> - Timestamp of when you
              first signed up
            </li>
          </ul>
          <p class="text-gray-700 leading-relaxed mb-4">
            This data is securely stored and managed by
            <a
              href="https://supabase.com/privacy"
              target="_blank"
              rel="noopener"
              class="text-primary hover:text-primary-dark font-medium"
            >
              Supabase</a
            >, our backend infrastructure provider.
          </p>

          <h3 class="text-lg font-semibold text-gray-900 mb-3 mt-6">
            1.2 User-Generated Content
          </h3>
          <p class="text-gray-700 leading-relaxed mb-4">
            When you use our service, we store:
          </p>
          <ul class="list-disc list-inside text-gray-700 space-y-2 mb-4">
            <li>
              <strong>Directory submissions</strong> - Information you submit
              about new directories
            </li>
            <li>
              <strong>Favorites</strong> - Directories you've marked as
              favorites
            </li>
            <li>
              <strong>Votes</strong> - Your upvotes or downvotes on directories
            </li>
            <li>
              <strong>Reviews & comments</strong> - Your written feedback about
              directories
            </li>
            <li>
              <strong>Submission tracking</strong> - Record of your directory
              submissions and their status
            </li>
          </ul>

          <h3 class="text-lg font-semibold text-gray-900 mb-3 mt-6">
            1.3 Analytics Data (via Pirsch)
          </h3>
          <p class="text-gray-700 leading-relaxed mb-4">
            We use
            <a
              href="https://pirsch.io/"
              target="_blank"
              rel="noopener"
              class="text-primary hover:text-primary-dark font-medium"
            >
              Pirsch Analytics</a
            >, a privacy-first, cookie-free analytics service. Pirsch collects:
          </p>
          <ul class="list-disc list-inside text-gray-700 space-y-2 mb-4">
            <li><strong>Page views</strong> - Which pages you visit</li>
            <li>
              <strong>Referrer information</strong> - Where you came from
            </li>
            <li>
              <strong>Browser & device type</strong> - General device
              information
            </li>
            <li>
              <strong>Geographic location</strong> - Country-level location
              (not precise)
            </li>
            <li>
              <strong>Session duration</strong> - How long you spend on the
              site
            </li>
          </ul>
          <p class="text-gray-700 leading-relaxed mb-4">
            <strong>Important:</strong> Pirsch is fully GDPR-compliant and does
            NOT use cookies or track personal information. All analytics data is
            anonymized and aggregated. No IP addresses are stored.
          </p>

          <h3 class="text-lg font-semibold text-gray-900 mb-3 mt-6">
            1.4 Newsletter Data (via Mautic)
          </h3>
          <p class="text-gray-700 leading-relaxed mb-4">
            If you subscribe to our newsletter, we collect:
          </p>
          <ul class="list-disc list-inside text-gray-700 space-y-2 mb-4">
            <li>
              <strong>Email address</strong> - To send you updates and launch
              strategies
            </li>
            <li>
              <strong>Subscription source</strong> - Where you signed up (e.g.,
              footer, popup)
            </li>
            <li>
              <strong>Subscription date</strong> - When you subscribed
            </li>
            <li>
              <strong>Email engagement</strong> - Whether you open or click
              links in our emails (standard email marketing metrics)
            </li>
          </ul>
          <p class="text-gray-700 leading-relaxed">
            Newsletter data is managed by Mautic, our email marketing provider.
            You can unsubscribe at any time using the link in any email we send.
          </p>
        </div>

        <!-- How We Use Data -->
        <div class="card p-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">
            2. How We Use Your Information
          </h2>
          <p class="text-gray-700 leading-relaxed mb-4">
            We use collected data only for the following purposes:
          </p>
          <ul class="list-disc list-inside text-gray-700 space-y-2 mb-4">
            <li>
              <strong>Provide core features</strong> - Authentication, favorites,
              submissions, voting, and reviews
            </li>
            <li>
              <strong>Improve the service</strong> - Understand usage patterns
              and optimize user experience
            </li>
            <li>
              <strong>Send newsletters</strong> - Deliver launch strategies and
              new directory updates (opt-in only)
            </li>
            <li>
              <strong>Prevent abuse</strong> - Detect and prevent spam,
              manipulation, or malicious activity
            </li>
            <li>
              <strong>Communicate updates</strong> - Notify you of important
              changes to the service
            </li>
            <li>
              <strong>Comply with legal obligations</strong> - Respond to valid
              legal requests if required
            </li>
          </ul>
          <p class="text-gray-700 leading-relaxed">
            <strong>We do NOT:</strong> Sell your data, share it with
            advertisers, or use it for purposes unrelated to Awesome
            Directories.
          </p>
        </div>

        <!-- Data Storage & Security -->
        <div class="card p-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">
            3. Data Storage & Security
          </h2>

          <h3 class="text-lg font-semibold text-gray-900 mb-3">
            3.1 Where Your Data Is Stored
          </h3>
          <p class="text-gray-700 leading-relaxed mb-4">
            Your data is stored with our third-party service providers:
          </p>
          <ul class="list-disc list-inside text-gray-700 space-y-2 mb-4">
            <li>
              <strong>Supabase</strong> - PostgreSQL database hosted on secure
              cloud infrastructure (
              <a
                href="https://supabase.com/privacy"
                target="_blank"
                rel="noopener"
                class="text-primary hover:text-primary-dark font-medium"
              >
                Supabase Privacy Policy</a
              >)
            </li>
            <li>
              <strong>Pirsch</strong> - Analytics data stored in EU servers (
              <a
                href="https://pirsch.io/privacy"
                target="_blank"
                rel="noopener"
                class="text-primary hover:text-primary-dark font-medium"
              >
                Pirsch Privacy Policy</a
              >)
            </li>
            <li>
              <strong>Mautic</strong> - Newsletter subscriber data on email
              marketing servers
            </li>
          </ul>

          <h3 class="text-lg font-semibold text-gray-900 mb-3 mt-6">
            3.2 Security Measures
          </h3>
          <p class="text-gray-700 leading-relaxed mb-4">
            We take reasonable security measures to protect your data:
          </p>
          <ul class="list-disc list-inside text-gray-700 space-y-2 mb-4">
            <li>
              <strong>Encryption</strong> - All data is transmitted over HTTPS
              (TLS/SSL)
            </li>
            <li>
              <strong>OAuth authentication</strong> - We never store passwords;
              authentication is handled by Google/GitHub
            </li>
            <li>
              <strong>Database security</strong> - Supabase implements
              row-level security and encryption at rest
            </li>
            <li>
              <strong>Access controls</strong> - Limited access to production
              data by maintainers
            </li>
            <li>
              <strong>Regular updates</strong> - Dependencies and infrastructure
              are kept up to date
            </li>
          </ul>
          <p class="text-gray-700 leading-relaxed">
            However, no method of transmission or storage is 100% secure. We
            cannot guarantee absolute security of your data.
          </p>
        </div>

        <!-- Data Sharing -->
        <div class="card p-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">
            4. Data Sharing & Third Parties
          </h2>
          <p class="text-gray-700 leading-relaxed mb-4">
            We do NOT sell, rent, or trade your personal information. We only
            share data with:
          </p>

          <h3 class="text-lg font-semibold text-gray-900 mb-3">
            4.1 Essential Service Providers
          </h3>
          <ul class="list-disc list-inside text-gray-700 space-y-2 mb-4">
            <li>
              <strong>Supabase</strong> - Database and authentication
              infrastructure
            </li>
            <li>
              <strong>Pirsch</strong> - Privacy-first analytics (anonymized
              data only)
            </li>
            <li><strong>Mautic</strong> - Newsletter delivery</li>
          </ul>

          <h3 class="text-lg font-semibold text-gray-900 mb-3 mt-6">
            4.2 Public Data
          </h3>
          <p class="text-gray-700 leading-relaxed mb-4">
            Some data is publicly visible by design:
          </p>
          <ul class="list-disc list-inside text-gray-700 space-y-2 mb-4">
            <li>
              <strong>Directory submissions</strong> - Approved submissions
              become part of the public dataset
            </li>
            <li>
              <strong>Reviews & comments</strong> - Public feedback on
              directories
            </li>
            <li>
              <strong>Vote counts</strong> - Aggregated voting data (individual
              votes may be anonymized)
            </li>
            <li>
              <strong>Open source data</strong> - Directory database is publicly
              available on GitHub
            </li>
          </ul>

          <h3 class="text-lg font-semibold text-gray-900 mb-3 mt-6">
            4.3 Legal Requirements
          </h3>
          <p class="text-gray-700 leading-relaxed">
            We may disclose your information if required by law or in response
            to valid legal requests (e.g., court orders, subpoenas).
          </p>
        </div>

        <!-- Cookies & Tracking -->
        <div class="card p-8 bg-green-50 border-green-200">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">
            5. Cookies & Tracking Technologies
          </h2>
          <p class="text-gray-700 leading-relaxed mb-4">
            <strong>Good news:</strong> We use minimal cookies and tracking.
          </p>

          <h3 class="text-lg font-semibold text-gray-900 mb-3">
            5.1 Essential Cookies
          </h3>
          <ul class="list-disc list-inside text-gray-700 space-y-2 mb-4">
            <li>
              <strong>Authentication cookies</strong> - Supabase session tokens
              to keep you logged in
            </li>
            <li>
              <strong>Local storage</strong> - Preferences and UI state (stored
              locally in your browser)
            </li>
          </ul>

          <h3 class="text-lg font-semibold text-gray-900 mb-3 mt-6">
            5.2 No Tracking Cookies
          </h3>
          <p class="text-gray-700 leading-relaxed">
            We do NOT use third-party advertising cookies, tracking pixels, or
            invasive analytics. Pirsch Analytics is completely cookie-free and
            does not track users across sites.
          </p>
        </div>

        <!-- Your Rights -->
        <div class="card p-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">
            6. Your Privacy Rights
          </h2>
          <p class="text-gray-700 leading-relaxed mb-4">
            You have the following rights regarding your personal data:
          </p>
          <ul class="list-disc list-inside text-gray-700 space-y-2 mb-4">
            <li>
              <strong>Access</strong> - Request a copy of the data we have about
              you
            </li>
            <li>
              <strong>Correction</strong> - Request corrections to inaccurate
              data
            </li>
            <li>
              <strong>Deletion</strong> - Request deletion of your account and
              associated data
            </li>
            <li>
              <strong>Portability</strong> - Request your data in a
              machine-readable format
            </li>
            <li>
              <strong>Opt-out</strong> - Unsubscribe from newsletters at any
              time
            </li>
            <li>
              <strong>Revoke access</strong> - Disconnect OAuth access via your
              Google/GitHub settings
            </li>
          </ul>

          <h3 class="text-lg font-semibold text-gray-900 mb-3 mt-6">
            How to Exercise Your Rights
          </h3>
          <p class="text-gray-700 leading-relaxed mb-4">
            To exercise any of these rights, contact us at:
          </p>
          <ul class="text-gray-700 space-y-2 mb-4">
            <li>
              <strong>Email:</strong>
              <a
                href="mailto:privacy@awesome-directories.com"
                class="text-primary hover:text-primary-dark font-medium"
              >
                privacy@awesome-directories.com
              </a>
            </li>
            <li>
              <strong>GitHub Issues:</strong>
              <a
                href="https://github.com/awesome-directories/awesome-directories/issues"
                target="_blank"
                rel="noopener"
                class="text-primary hover:text-primary-dark font-medium"
              >
                Report privacy concerns
              </a>
            </li>
          </ul>
          <p class="text-gray-700 leading-relaxed">
            We will respond to your request within 30 days. For account
            deletion, some public contributions (like approved directory
            submissions) may remain in the public dataset but will be
            disassociated from your identity.
          </p>
        </div>

        <!-- Data Retention -->
        <div class="card p-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">
            7. Data Retention
          </h2>
          <p class="text-gray-700 leading-relaxed mb-4">
            We retain your data for the following periods:
          </p>
          <ul class="list-disc list-inside text-gray-700 space-y-2 mb-4">
            <li>
              <strong>Account data</strong> - Retained while your account is
              active
            </li>
            <li>
              <strong>User-generated content</strong> - Retained indefinitely as
              part of the public dataset (can be anonymized upon request)
            </li>
            <li>
              <strong>Analytics data</strong> - Retained for up to 24 months by
              Pirsch
            </li>
            <li>
              <strong>Newsletter data</strong> - Retained until you unsubscribe
            </li>
            <li>
              <strong>Deleted accounts</strong> - Permanently deleted within 90
              days, except for legally required records
            </li>
          </ul>
          <p class="text-gray-700 leading-relaxed">
            If you delete your account, we will remove your personal information
            but may retain anonymized or aggregated data for analytics and
            service improvement.
          </p>
        </div>

        <!-- Children's Privacy -->
        <div class="card p-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">
            8. Children's Privacy
          </h2>
          <p class="text-gray-700 leading-relaxed">
            Awesome Directories is not intended for users under the age of 13.
            We do not knowingly collect personal information from children. If
            you believe a child has provided us with personal information,
            please contact us immediately and we will delete it.
          </p>
        </div>

        <!-- International Users -->
        <div class="card p-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">
            9. International Users
          </h2>
          <p class="text-gray-700 leading-relaxed mb-4">
            Awesome Directories is available globally. By using our service, you
            consent to the transfer and processing of your data by our service
            providers, which may be located in different jurisdictions.
          </p>
          <p class="text-gray-700 leading-relaxed">
            Our primary infrastructure provider, Supabase, operates in
            compliance with GDPR and other international privacy regulations. We
            strive to protect your data regardless of where you are located.
          </p>
        </div>

        <!-- Changes to Privacy Policy -->
        <div class="card p-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">
            10. Changes to This Privacy Policy
          </h2>
          <p class="text-gray-700 leading-relaxed mb-4">
            We may update this privacy policy from time to time to reflect
            changes in our practices or legal requirements. Updates will be
            posted on this page with a revised "Last Updated" date.
          </p>
          <p class="text-gray-700 leading-relaxed mb-4">
            For significant changes, we will:
          </p>
          <ul class="list-disc list-inside text-gray-700 space-y-2 mb-4">
            <li>Post a notice on our homepage</li>
            <li>Announce it in our newsletter</li>
            <li>
              Document changes in our
              <a
                href="https://github.com/awesome-directories/awesome-directories"
                target="_blank"
                rel="noopener"
                class="text-primary hover:text-primary-dark font-medium"
              >
                GitHub repository
              </a>
            </li>
          </ul>
          <p class="text-gray-700 leading-relaxed">
            Continued use of the service after changes constitutes acceptance of
            the updated privacy policy.
          </p>
        </div>

        <!-- Open Source Transparency -->
        <div class="card p-8 bg-blue-50 border-blue-200">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">
            11. Open Source Transparency
          </h2>
          <p class="text-gray-700 leading-relaxed mb-4">
            As an open-source project, we believe in transparency. You can:
          </p>
          <ul class="list-disc list-inside text-gray-700 space-y-2 mb-4">
            <li>
              <strong>Review our source code</strong> - See exactly how we
              handle data on
              <a
                href="https://github.com/awesome-directories/awesome-directories"
                target="_blank"
                rel="noopener"
                class="text-primary hover:text-primary-dark font-medium"
              >
                GitHub
              </a>
            </li>
            <li>
              <strong>Audit our practices</strong> - Verify our privacy claims
              in the codebase
            </li>
            <li>
              <strong>Contribute improvements</strong> - Submit PRs to enhance
              privacy features
            </li>
            <li>
              <strong>Report concerns</strong> - Open issues for privacy-related
              questions
            </li>
          </ul>
          <p class="text-gray-700 leading-relaxed">
            This level of transparency is only possible because we're
            open-source. We encourage security researchers and privacy advocates
            to review our code.
          </p>
        </div>

        <!-- Contact -->
        <div class="card p-8 bg-yellow-50 border-yellow-200">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">
            12. Contact Us About Privacy
          </h2>
          <p class="text-gray-700 leading-relaxed mb-4">
            If you have questions, concerns, or requests regarding this privacy
            policy or your personal data, please contact us:
          </p>
          <ul class="text-gray-700 space-y-2">
            <li>
              <strong>Privacy Email:</strong>
              <a
                href="mailto:privacy@awesome-directories.com"
                class="text-primary hover:text-primary-dark font-medium"
              >
                privacy@awesome-directories.com
              </a>
            </li>
            <li>
              <strong>General Contact:</strong>
              <a
                href="mailto:contact@awesome-directories.com"
                class="text-primary hover:text-primary-dark font-medium"
              >
                contact@awesome-directories.com
              </a>
            </li>
            <li>
              <strong>GitHub Issues:</strong>
              <a
                href="https://github.com/awesome-directories/awesome-directories/issues"
                target="_blank"
                rel="noopener"
                class="text-primary hover:text-primary-dark font-medium"
              >
                awesome-directories/awesome-directories
              </a>
            </li>
          </ul>
          <p class="text-gray-700 leading-relaxed mt-4">
            We take privacy seriously and will respond to all inquiries promptly
            and professionally.
          </p>
        </div>

        <!-- Summary -->
        <div class="card p-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">
            Privacy Policy Summary
          </h2>
          <p class="text-gray-700 leading-relaxed mb-4">
            <strong>TL;DR:</strong>
          </p>
          <ul class="list-disc list-inside text-gray-700 space-y-2">
            <li>
              We collect minimal data (email, OAuth info, usage data) to provide
              our service
            </li>
            <li>We use privacy-first analytics (Pirsch) with no cookies</li>
            <li>
              We never sell your data or share it with advertisers
            </li>
            <li>You can request access, correction, or deletion at any time</li>
            <li>
              Our code is open-source, so you can verify our privacy practices
            </li>
            <li>
              We're transparent, community-driven, and respect your privacy 🔒
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from "vue";

onMounted(() => {
  if (window.pirsch) {
    window.pirsch("Privacy Policy View");
  }
});
</script>
