/**
 * Auth utility functions for checking authentication and triggering modals
 */

/**
 * Check if user is authenticated
 * @param {Object|null} user - The user object from auth store
 * @returns {boolean}
 */
export function isAuthenticated(user) {
  return !!user;
}

/**
 * Show the authentication modal
 */
export function showAuthModal() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("show-auth-modal"));
  }
}

/**
 * Require authentication - shows modal if not authenticated
 * @param {Object|null} user - The user object from auth store
 * @param {Function} callback - Function to call if authenticated
 * @returns {boolean} - Returns true if authenticated, false otherwise
 */
export function requireAuth(user, callback) {
  if (isAuthenticated(user)) {
    if (callback) callback();
    return true;
  }

  showAuthModal();
  return false;
}

/**
 * Get user ID from user object
 * @param {Object|null} user - The user object
 * @returns {string|null}
 */
export function getUserId(user) {
  return user?.id || null;
}

/**
 * Get user email from user object
 * @param {Object|null} user - The user object
 * @returns {string|null}
 */
export function getUserEmail(user) {
  return user?.email || null;
}

/**
 * Create IP hash for anonymous voting (fallback)
 * @returns {Promise<string>}
 */
export async function getClientIpHash() {
  // Simple client-side hash based on user agent and screen resolution
  // Note: This is not secure but serves as a basic identifier
  const data = `${navigator.userAgent}-${screen.width}x${screen.height}`;

  try {
    const msgUint8 = new TextEncoder().encode(data);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return hashHex;
  } catch (error) {
    console.error("Failed to generate IP hash:", error);
    // Fallback to simple hash
    return btoa(data).slice(0, 32);
  }
}
