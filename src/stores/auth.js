import { atom } from "nanostores";

export const $user = atom(null);
export const $session = atom(null);
export const $isLoading = atom(true);

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
