/**
 * Toast notification composable
 *
 * Provides a simple API for showing toast notifications across the app.
 * Uses a shared reactive state that persists across component instances.
 *
 * Usage:
 *   import { useToast } from '@/composables/useToast';
 *
 *   var { toast, success, error, warning, info } = useToast();
 *
 *   // Show a success toast
 *   success('Changes saved successfully');
 *
 *   // Show an error toast with title
 *   error('Please try again later', 'Connection failed');
 *
 *   // Show with custom options
 *   toast({
 *     type: 'info',
 *     title: 'Heads up',
 *     message: 'Your session will expire in 5 minutes',
 *     duration: 10000
 *   });
 */

import { ref } from "vue";

// Shared state across all component instances
var toasts = ref([]);
var toastIdCounter = 0;

// Default duration in milliseconds
var DEFAULT_DURATION = 5000;

/**
 * Generate a unique ID for each toast
 */
function generateId() {
  toastIdCounter += 1;
  return "toast-" + toastIdCounter;
}

/**
 * Add a toast to the queue
 * @param {Object} options - Toast options
 * @param {string} options.type - Toast type: 'success' | 'error' | 'warning' | 'info'
 * @param {string} options.message - Toast message (required)
 * @param {string} [options.title] - Optional title
 * @param {number} [options.duration] - Duration in ms (default: 5000, 0 = no auto-dismiss)
 * @param {boolean} [options.dismissible] - Show dismiss button (default: true)
 * @returns {string} Toast ID
 */
function addToast(options) {
  var id = generateId();
  var duration =
    options.duration !== undefined ? options.duration : DEFAULT_DURATION;

  var newToast = {
    id: id,
    type: options.type || "info",
    message: options.message,
    title: options.title || null,
    dismissible: options.dismissible !== false,
  };

  toasts.value.push(newToast);

  // Auto-dismiss after duration (if duration > 0)
  if (duration > 0) {
    setTimeout(function autoDismiss() {
      dismiss(id);
    }, duration);
  }

  return id;
}

/**
 * Dismiss a toast by ID
 * @param {string} id - Toast ID
 */
function dismiss(id) {
  var index = toasts.value.findIndex(function findToast(t) {
    return t.id === id;
  });
  if (index !== -1) {
    toasts.value.splice(index, 1);
  }
}

/**
 * Dismiss all toasts
 */
function dismissAll() {
  toasts.value = [];
}

/**
 * Show a success toast
 * @param {string} message - Toast message
 * @param {string} [title] - Optional title
 * @param {Object} [options] - Additional options
 * @returns {string} Toast ID
 */
function success(message, title, options) {
  return addToast({
    type: "success",
    message: message,
    title: title,
    ...options,
  });
}

/**
 * Show an error toast
 * @param {string} message - Toast message
 * @param {string} [title] - Optional title
 * @param {Object} [options] - Additional options
 * @returns {string} Toast ID
 */
function error(message, title, options) {
  return addToast({
    type: "error",
    message: message,
    title: title,
    duration: 0, // Errors don't auto-dismiss by default
    ...options,
  });
}

/**
 * Show a warning toast
 * @param {string} message - Toast message
 * @param {string} [title] - Optional title
 * @param {Object} [options] - Additional options
 * @returns {string} Toast ID
 */
function warning(message, title, options) {
  return addToast({
    type: "warning",
    message: message,
    title: title,
    duration: 7000, // Warnings stay a bit longer
    ...options,
  });
}

/**
 * Show an info toast
 * @param {string} message - Toast message
 * @param {string} [title] - Optional title
 * @param {Object} [options] - Additional options
 * @returns {string} Toast ID
 */
function info(message, title, options) {
  return addToast({
    type: "info",
    message: message,
    title: title,
    ...options,
  });
}

/**
 * Toast composable
 * @returns {Object} Toast API
 */
export function useToast() {
  return {
    toasts: toasts,
    toast: addToast,
    dismiss: dismiss,
    dismissAll: dismissAll,
    success: success,
    error: error,
    warning: warning,
    info: info,
  };
}

// Also export individual functions for non-composable usage
export { addToast as toast, success, error, warning, info, dismiss, dismissAll };
