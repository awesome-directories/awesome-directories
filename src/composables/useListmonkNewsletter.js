/**
 * Listmonk Newsletter Subscription Composable
 *
 * Provides a reusable way to subscribe users to the Listmonk newsletter
 * from Vue components. Uses the self-hosted Listmonk instance.
 */

const LISTMONK_BASE_URL = "https://newsletter.meysam.io";
const LISTMONK_LIST_ID = "3a836c26-900d-4d3f-89d9-eba6943ca1ac";

export function useListmonkNewsletter() {
  /**
   * Subscribe an email to the Listmonk newsletter
   * @param {Object} options - Subscription options
   * @param {string} options.email - The email address to subscribe
   * @param {string} [options.source='unknown'] - The source of the subscription (for tracking)
   * @returns {Promise<{success: boolean, message: string}>}
   */
  const subscribe = async ({ email, source = "unknown" }) => {
    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("l", LISTMONK_LIST_ID);
      formData.append("nonce", "");

      // Submit to Listmonk subscription endpoint
      // Note: Using no-cors mode since Listmonk may not have CORS headers configured
      await fetch(`${LISTMONK_BASE_URL}/subscription/form`, {
        method: "POST",
        body: formData,
        mode: "no-cors",
      });

      // Track subscription event if Pirsch is available
      if (typeof window !== "undefined" && window.pirsch) {
        window.pirsch("Newsletter Signup", { source });
      }

      // With no-cors, we can't read the response, so we assume success
      return {
        success: true,
        message: "Thanks for subscribing! Please check your email to confirm.",
      };
    } catch (error) {
      console.error("Newsletter subscription error:", error);
      throw error;
    }
  };

  return {
    subscribe,
    LISTMONK_BASE_URL,
    LISTMONK_LIST_ID,
  };
}
