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

        <!-- Success State -->
        <div v-if="successMessage" class="text-center">
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
              placeholder="At least 6 characters"
              class="input w-full"
              :class="{ 'border-red-500': passwordError }"
              @input="passwordError = ''"
              required
              autocomplete="new-password"
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
              placeholder="Re-enter your password"
              class="input w-full"
              :class="{ 'border-red-500': confirmError }"
              @input="confirmError = ''"
              required
              autocomplete="new-password"
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
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "@/composables/useAuth";

const router = useRouter();
const { updatePassword } = useAuth();

const newPassword = ref("");
const confirmPassword = ref("");
const isLoading = ref(false);
const errorMessage = ref("");
const successMessage = ref("");
const passwordError = ref("");
const confirmError = ref("");

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

  isLoading.value = true;
  errorMessage.value = "";

  try {
    await updatePassword(newPassword.value);
    successMessage.value = "Password updated successfully!";
    newPassword.value = "";
    confirmPassword.value = "";

    // Redirect to home after 2 seconds
    setTimeout(() => {
      router.push("/");
    }, 2000);
  } catch (error) {
    console.error("Password reset error:", error);
    // Check for invalid or expired reset token/session
    const msg = (error && error.message) ? error.message.toLowerCase() : "";
    if (
      msg.includes("expired") ||
      msg.includes("invalid") ||
      msg.includes("recovery session") ||
      msg.includes("reset token")
    ) {
      errorMessage.value = "Your password reset link is invalid or has expired. Please request a new reset link.";
    } else {
      errorMessage.value =
        error.message || "Failed to update password. Please try again or request a new reset link.";
    }
    isLoading.value = false;
  }
};

onMounted(() => {
  if (window.pirsch) {
    window.pirsch("Reset Password Page View");
  }
});
</script>
