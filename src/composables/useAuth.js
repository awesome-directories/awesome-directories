import { computed } from "vue";
import { useStore } from "@nanostores/vue";
import { supabase } from "@/lib/supabase-client";
import {
  $user,
  $session,
  $isLoading,
  setUser,
  setSession,
  setLoading,
  clearAuth,
} from "@/stores/auth";

// Initialize auth state at module level (runs once when first imported)
let authInitialized = false;

async function initializeAuth() {
  if (authInitialized) return;
  authInitialized = true;

  try {
    // Get initial session
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error("Error getting session:", error);
      setUser(null);
      setSession(null);
    } else {
      setSession(session);
      setUser(session?.user ?? null);
    }
  } catch (error) {
    console.error("Error initializing auth:", error);
    setUser(null);
    setSession(null);
  } finally {
    setLoading(false);
  }

  // Listen for auth state changes
  supabase.auth.onAuthStateChange((_event, newSession) => {
    console.log("Auth state changed:", _event, newSession);
    setSession(newSession);
    setUser(newSession?.user ?? null);
    setLoading(false);
  });
}

// Initialize auth immediately when module is imported (browser-side only)
if (typeof window !== "undefined") {
  initializeAuth();
}

export function useAuth() {
  // Use stores from nanostores (reactive)
  const user = useStore($user);
  const session = useStore($session);
  const loading = useStore($isLoading);

  const isAuthenticated = computed(() => !!session.value);

  /**
   * OAuth Sign In - Google
   */
  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + import.meta.env.BASE_URL,
      },
    });
    if (error) throw error;
  };

  /**
   * OAuth Sign In - GitHub
   */
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
   * Email/Password Sign Up
   * Requires email verification before user can sign in
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
   * Email/Password Sign In
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
   * Send password reset email
   */
  const sendPasswordResetEmail = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + import.meta.env.BASE_URL + '#/reset-password',
    });
    if (error) throw error;
  };

  /**
   * Update password (after reset or while logged in)
   */
  const updatePassword = async (newPassword) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
  };

  /**
   * Resend email confirmation
   */
  const resendConfirmationEmail = async (email) => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: window.location.origin + import.meta.env.BASE_URL,
      }
    });
    if (error) throw error;
  };

  /**
   * Link additional OAuth provider to existing account
   */
  const linkProvider = async (provider) => {
    const { error } = await supabase.auth.linkIdentity({
      provider,
    });
    if (error) throw error;
  };

  /**
   * Unlink OAuth provider from account
   */
  const unlinkProvider = async (provider) => {
    const { error } = await supabase.auth.unlinkIdentity({
      provider,
    });
    if (error) throw error;
  };

  /**
   * Sign Out
   */
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    clearAuth();
  };

  const refreshSession = async () => {
    try {
      setLoading(true);
      const {
        data: { session: currentSession },
        error,
      } = await supabase.auth.getSession();

      if (error) throw error;

      setSession(currentSession);
      setUser(currentSession?.user ?? null);
    } catch (error) {
      console.error("Error refreshing session:", error);
      clearAuth();
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    session,
    loading,
    isAuthenticated,
    signInWithGoogle,
    signInWithGithub,
    signUpWithEmail,
    signInWithEmail,
    sendPasswordResetEmail,
    updatePassword,
    resendConfirmationEmail,
    linkProvider,
    unlinkProvider,
    signOut,
    refreshSession,
  };
}
