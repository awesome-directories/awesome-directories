import { ref, computed, onMounted } from "vue";
import { supabase } from "@/lib/supabase";

const user = ref(null);
const session = ref(null);
const loading = ref(true);

export function useAuth() {
  const isAuthenticated = computed(() => !!session.value);

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + import.meta.env.BASE_URL,
      },
    });
    if (error) throw error;
  };

  const signInWithGithub = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: window.location.origin + import.meta.env.BASE_URL,
      },
    });
    if (error) throw error;
  };

  /**
   * Sign in with email and password
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @returns {Promise<{user: object, session: object}>} Authentication data
   * @throws {Error} If credentials are invalid or email is not confirmed
   */
  const signInWithEmail = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  /**
   * Sign up with email and password
   * @param {string} email - User's email address
   * @param {string} password - User's password (minimum 6 characters)
   * @returns {Promise<{user: object, session: object|null}>}
   *   Authentication data. If email confirmation is enabled, session will be null
   *   until the user confirms their email address.
   * @throws {Error} If email is already registered or validation fails
   */
  const signUpWithEmail = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin + import.meta.env.BASE_URL,
      },
    });
    if (error) throw error;
    return data;
  };

  /**
   * Send password reset email with magic link
   *
   * This function sends an email to the user with a secure password reset link.
   * When clicked, the link redirects to the /reset-password page with a recovery token
   * in the URL hash fragment. The token is automatically handled by Supabase auth,
   * allowing updatePassword() to work without additional authentication.
   *
   * @param {string} email - User's email address
   * @returns {Promise<void>}
   * @throws {Error} If email sending fails or email is not registered
   *
   * @example
   * await resetPassword('user@example.com');
   * // User receives email with link to: https://yoursite.com/#/reset-password
   * // The URL contains a recovery token handled by Supabase
   */
  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + import.meta.env.BASE_URL + 'reset-password',
    });
    if (error) throw error;
  };

  /**
   * Update user's password
   *
   * IMPORTANT: This function requires an active authenticated session with a valid
   * recovery token. This token is automatically set when a user clicks the password
   * reset link from their email. Do not call this function unless:
   * 1. User is on the password reset page after clicking the email link, OR
   * 2. User is authenticated and changing their password from account settings
   *
   * @param {string} newPassword - New password (minimum 6 characters)
   * @returns {Promise<void>}
   * @throws {Error} If no valid session/recovery token exists or update fails
   *
   * @example
   * // After user clicks reset link and lands on /reset-password page:
   * await updatePassword('newSecurePassword123');
   */
  const updatePassword = async (newPassword) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    user.value = null;
    session.value = null;
  };

  const refreshSession = async () => {
    try {
      const {
        data: { session: currentSession },
        error,
      } = await supabase.auth.getSession();
      if (error) throw error;

      session.value = currentSession;
      user.value = currentSession?.user ?? null;
    } catch (error) {
      console.error("Error refreshing session:", error);
    } finally {
      loading.value = false;
    }
  };

  onMounted(() => {
    refreshSession();

    // Listen for auth changes
    supabase.auth.onAuthStateChange((_event, newSession) => {
      session.value = newSession;
      user.value = newSession?.user ?? null;
      loading.value = false;
    });
  });

  return {
    user,
    session,
    loading,
    isAuthenticated,
    signInWithGoogle,
    signInWithGithub,
    signInWithEmail,
    signUpWithEmail,
    resetPassword,
    updatePassword,
    signOut,
    refreshSession,
  };
}
