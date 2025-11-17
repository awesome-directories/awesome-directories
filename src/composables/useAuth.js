import { computed } from "vue";
import { useStore } from "@nanostores/vue";
import { supabase } from "@/lib/supabase";
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
    signOut,
    refreshSession,
  };
}
