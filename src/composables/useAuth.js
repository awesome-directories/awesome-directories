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

  const signInWithEmail = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

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

  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + import.meta.env.BASE_URL + '#/reset-password',
    });
    if (error) throw error;
  };

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
