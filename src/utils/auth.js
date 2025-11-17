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


