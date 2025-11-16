import { atom } from "nanostores";

export const $user = atom(null);
export const $session = atom(null);
export const $isLoading = atom(true);

// Convenient export for Vue components
export const userStore = $user;
export const sessionStore = $session;
export const loadingStore = $isLoading;

export function setUser(user) {
  $user.set(user);
}

export function setSession(session) {
  $session.set(session);
}

export function setLoading(loading) {
  $isLoading.set(loading);
}

export function clearAuth() {
  $user.set(null);
  $session.set(null);
}

// Initialize auth state from Supabase (call this on app startup)
export async function initAuth() {
  if (typeof window === 'undefined') return;

  try {
    const { supabase } = await import('@/lib/supabase-client.js');

    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
      $session.set(session);
      $user.set(session.user);
    }

    $isLoading.set(false);

    // Listen for auth changes
    supabase.auth.onAuthStateChange((_event, newSession) => {
      $session.set(newSession);
      $user.set(newSession?.user ?? null);
      $isLoading.set(false);
    });
  } catch (error) {
    console.error('Error initializing auth:', error);
    $isLoading.set(false);
  }
}

// Call initAuth when this module is loaded on the client
if (typeof window !== 'undefined') {
  initAuth();
}
