<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full">
      <div class="card p-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2 text-center">
          Reset Your Password
        </h1>
        <p class="text-gray-600 mb-6 text-center">
          Enter your new password below
        </p>

        <!-- Checking Token State -->
        <div v-if="isCheckingToken" class="text-center py-8">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p class="text-gray-600">Validating reset link...</p>
        </div>

        <!-- Success State -->
        <div v-else-if="successMessage" class="text-center">
          <div class="mb-6 text-green-600 bg-green-50 border border-green-200 rounded-lg p-4">
            <svg
              class="w-12 h-12 mx-auto mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <p class="font-medium">{{ successMessage }}</p>
          </div>
          <router-link to="/" class="btn-primary">
            Go to Home
          </router-link>
        </div>

        <!-- Invalid Token State -->
        <div v-else-if="!hasValidToken" class="text-center">
          <div class="mb-6 text-red-600 bg-red-50 border border-red-200 rounded-lg p-4">
            <svg
              class="w-12 h-12 mx-auto mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <p class="font-medium mb-4">{{ errorMessage }}</p>
            <p class="text-sm text-gray-600">The reset link may have expired or is invalid.</p>
          </div>
          <router-link to="/" class="btn-primary">
            Go to Home
          </router-link>
        </div>

        <!-- Password Reset Form -->
        <form v-else @submit.prevent="handlePasswordReset" class="space-y-4">
          <div>
            <label
              for="new-password"
              class="block text-sm font-medium text-gray-700 mb-1"
            >
              New Password
            </label>
            <input
              id="new-password"
              v-model="newPassword"
              type="password"
              autocomplete="new-password"
              placeholder="At least 6 characters"
              class="input w-full"
              :class="{ 'border-red-500': passwordError }"
              @input="passwordError = ''"
              required
            />
            <p v-if="passwordError" class="text-xs text-red-600 mt-1">
              {{ passwordError }}
            </p>
          </div>

          <div>
            <label
              for="confirm-password"
              class="block text-sm font-medium text-gray-700 mb-1"
            >
              Confirm Password
            </label>
            <input
              id="confirm-password"
              v-model="confirmPassword"
              type="password"
              autocomplete="new-password"
              placeholder="Re-enter your password"
              class="input w-full"
              :class="{ 'border-red-500': confirmError }"
              @input="confirmError = ''"
              required
            />
            <p v-if="confirmError" class="text-xs text-red-600 mt-1">
              {{ confirmError }}
            </p>
          </div>

          <!-- Error Message -->
          <div
            v-if="errorMessage"
            class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3"
          >
            {{ errorMessage }}
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="isLoading || !newPassword || !confirmPassword"
            class="btn-primary w-full"
          >
            {{ isLoading ? "Updating..." : "Update Password" }}
          </button>
        </form>

        <!-- Back to Home Link -->
        <div class="mt-6 text-center">
          <router-link
            to="/"
            class="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Back to Home
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "@/composables/useAuth";
import { supabase } from "@/lib/supabase";

const router = useRouter();
const { updatePassword } = useAuth();

const newPassword = ref("");
const confirmPassword = ref("");
const isLoading = ref(false);
const errorMessage = ref("");
const successMessage = ref("");
const passwordError = ref("");
const confirmError = ref("");
const hasValidToken = ref(false);
const isCheckingToken = ref(true);

// Store timeout ID to clean up on unmount
let redirectTimeoutId = null;

const validatePasswords = () => {
  let isValid = true;

  if (!newPassword.value) {
    passwordError.value = "Password is required";
    isValid = false;
  } else if (newPassword.value.length < 6) {
    passwordError.value = "Password must be at least 6 characters";
    isValid = false;
  } else {
    passwordError.value = "";
  }

  if (!confirmPassword.value) {
    confirmError.value = "Please confirm your password";
    isValid = false;
  } else if (newPassword.value !== confirmPassword.value) {
    confirmError.value = "Passwords do not match";
    isValid = false;
  } else {
    confirmError.value = "";
  }

  return isValid;
};

const handlePasswordReset = async () => {
  if (!validatePasswords()) return;

  // Double-check we have a valid recovery token
  if (!hasValidToken.value) {
    errorMessage.value = "Invalid or expired reset link. Please request a new password reset.";
    return;
  }

  isLoading.value = true;
  errorMessage.value = "";

  try {
    await updatePassword(newPassword.value);
    successMessage.value = "Password updated successfully!";
    newPassword.value = "";
    confirmPassword.value = "";

    // Redirect to home after 2 seconds - store timeout ID for cleanup
    redirectTimeoutId = setTimeout(() => {
      router.push("/");
    }, 2000);
  } catch (error) {
    console.error("Password reset error:", error);

    // Check for invalid or expired reset token/session
    const msg = (error && error.message) ? error.message.toLowerCase() : "";
    // Prefer error.code if available (Supabase may provide codes like 'invalid_recovery_token')
    if (
      (error && error.code === "invalid_recovery_token") ||
      (error && error.code === "expired_recovery_token") ||
      msg === "invalid recovery session" ||
      msg === "invalid or expired token" ||
      msg === "invalid recovery token" ||
      msg === "expired recovery token"
    ) {
      errorMessage.value = "Your password reset link is invalid or has expired. Please request a new reset link.";
    } else {
      errorMessage.value =
        error.message || "Failed to update password. Please try again or request a new reset link.";
    }
  } finally {
    isLoading.value = false;
  }
};

/**
 * Verify that the user has a valid recovery token from the password reset email
 * Supabase automatically handles the token from the URL (query or fragment) and sets the session.
 */
const checkResetToken = async () => {
  try {
    // Get the current session - if user came from reset email, Supabase will have
    // processed the token from the URL fragment (after '#') and created a recovery session.
    // This is handled by Supabase and is unrelated to Vue Router's routing mode.
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error("Error checking session:", error);
      hasValidToken.value = false;
      errorMessage.value = "Invalid or expired reset link. Please request a new password reset.";
      return;
    }

    // Check if we have a session (indicating valid recovery token)
    if (session) {
      hasValidToken.value = true;
    } else {
      hasValidToken.value = false;
      errorMessage.value = "Invalid or expired reset link. Please request a new password reset.";
    }
  } catch (error) {
    console.error("Error validating reset token:", error);
    hasValidToken.value = false;
    errorMessage.value = "Unable to validate reset link. Please try again.";
  } finally {
    isCheckingToken.value = false;
  }
};

onMounted(() => {
  // Check for valid reset token
  checkResetToken();

  if (window.pirsch) {
    window.pirsch("Reset Password Page View");
  }
});

// Clean up timeout on component unmount to prevent navigation errors
onBeforeUnmount(() => {
  if (redirectTimeoutId !== null) {
    clearTimeout(redirectTimeoutId);
  }
});
</script>
