<template>
  <div class="fixed inset-0 z-50 overflow-y-auto" @click.self="$emit('close')">
    <div
      class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0"
    >
      <!-- Background overlay -->
      <div
        class="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75"
        @click="$emit('close')"
      ></div>

      <!-- Modal panel -->
      <div
        class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full sm:p-6"
      >
        <!-- Close button -->
        <button
          @click="$emit('close')"
          class="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <!-- Modal content -->
        <div class="text-center">
          <h2 class="text-2xl font-bold text-gray-900 mb-2">
            {{ modalTitle }}
          </h2>
          <p class="text-gray-600 mb-6">
            {{ modalSubtitle }}
          </p>

          <!-- Password Reset View -->
          <div v-if="mode === 'reset'" class="space-y-4">
            <div class="text-left">
              <label
                for="reset-email"
                class="block text-sm font-medium text-gray-700 mb-1"
              >
                Email address
              </label>
              <input
                id="reset-email"
                v-model="email"
                type="email"
                autocomplete="email"
                placeholder="you@example.com"
                class="input w-full"
                @keyup.enter="handleResetPassword"

              />
            </div>

            <button
              @click="handleResetPassword"
              :disabled="isLoading || !email"
              class="btn-primary w-full"
            >
              {{ isLoading ? "Sending..." : "Send Reset Link" }}
            </button>

            <button
              @click="mode = 'signin'"
              class="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Back to sign in
            </button>
          </div>

          <!-- Sign In / Sign Up View -->
          <div v-else class="space-y-4">
            <!-- Email/Password Form -->
            <div class="space-y-3 text-left">
              <div>
                <label
                  for="email"
                  class="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email address
                </label>
                <input
                  id="email"
                  v-model="email"
                  type="email"
                  autocomplete="email"
                  placeholder="you@example.com"
                  class="input w-full"
                  :class="{ 'border-red-500': emailError }"
                  @input="emailError = ''"

                />
                <p v-if="emailError" class="text-xs text-red-600 mt-1">
                  {{ emailError }}
                </p>
              </div>

              <div>
                <label
                  for="password"
                  class="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password
                </label>
                <input
                  id="password"
                  v-model="password"
                  type="password"
                  :autocomplete="mode === 'signup' ? 'new-password' : 'current-password'"
                  :placeholder="
                    mode === 'signup'
                      ? 'At least 6 characters'
                      : 'Your password'
                  "
                  class="input w-full"
                  :class="{ 'border-red-500': passwordError }"
                  @input="passwordError = ''"
                  @keyup.enter="handleEmailAuth"
                />
                <p v-if="passwordError" class="text-xs text-red-600 mt-1">
                  {{ passwordError }}
                </p>
              </div>
            </div>

            <!-- Submit Button -->
            <button
              @click="handleEmailAuth"
              :disabled="isLoading || !email || !password"
              class="btn-primary w-full"
            >
              {{
                isLoading
                  ? "Loading..."
                  : mode === "signin"
                    ? "Sign In"
                    : "Sign Up"
              }}
            </button>

            <!-- Forgot Password Link (only show in sign in mode) -->
            <button
              v-if="mode === 'signin'"
              @click="mode = 'reset'"
              class="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Forgot your password?
            </button>

            <!-- Error Message -->
            <p v-if="errorMessage" class="text-sm text-red-600">
              {{ errorMessage }}
            </p>

            <!-- Success Message (for sign up confirmation) -->
            <div
              v-if="successMessage"
              class="text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg p-3"
            >
              {{ successMessage }}
            </div>

            <!-- Divider -->
            <div class="relative my-6">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-gray-300"></div>
              </div>
              <div class="relative flex justify-center text-sm">
                <span class="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <!-- OAuth Buttons -->
            <div class="space-y-3">
              <!-- Google Sign In -->
              <button
                @click="handleGoogleSignIn"
                :disabled="isLoading"
                class="w-full flex items-center justify-center space-x-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg class="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span class="font-medium text-gray-700"
                  >Continue with Google</span
                >
              </button>

              <!-- GitHub Sign In -->
              <button
                @click="handleGithubSignIn"
                :disabled="isLoading"
                class="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    fill-rule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clip-rule="evenodd"
                  />
                </svg>
                <span class="font-medium">Continue with GitHub</span>
              </button>
            </div>

            <!-- Toggle Sign In / Sign Up -->
            <div class="mt-6 pt-6 border-t border-gray-200">
              <p class="text-sm text-gray-600">
                {{ mode === "signin" ? "Don't have an account?" : "Already have an account?" }}
                <button
                  @click="toggleMode"
                  class="text-primary hover:underline font-medium"
                >
                  {{ mode === "signin" ? "Sign up" : "Sign in" }}
                </button>
              </p>
            </div>

            <!-- Continue without account -->
            <button
              @click="$emit('close')"
              class="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Continue without account
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useAuth } from "@/composables/useAuth";

// Email validation regex constant
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const {
  signInWithGoogle,
  signInWithGithub,
  signInWithEmail,
  signUpWithEmail,
  resetPassword,
} = useAuth();

const mode = ref("signin"); // 'signin', 'signup', or 'reset'
const email = ref("");
const password = ref("");
const isLoading = ref(false);
const errorMessage = ref("");
const successMessage = ref("");
const emailError = ref("");
const passwordError = ref("");

const modalTitle = computed(() => {
  if (mode.value === "reset") return "Reset Password";
  if (mode.value === "signup") return "Create Account";
  return "Welcome Back";
});

const modalSubtitle = computed(() => {
  if (mode.value === "reset")
    return "Enter your email to receive a password reset link";
  if (mode.value === "signup")
    return "Sign up to save favorites and track submissions";
  return "Sign in to save favorites and track submissions";
});

const validateEmail = () => {
  if (!email.value) {
    emailError.value = "Email is required";
    return false;
  }
  if (!EMAIL_REGEX.test(email.value)) {
    emailError.value = "Please enter a valid email address";
    return false;
  }
  emailError.value = "";
  return true;
};

const validatePassword = () => {
  if (!password.value) {
    passwordError.value = "Password is required";
    return false;
  }
  if (mode.value === "signup" && password.value.length < 6) {
    passwordError.value = "Password must be at least 6 characters";
    return false;
  }
  passwordError.value = "";
  return true;
};

const handleEmailAuth = async () => {
  if (!validateEmail() || !validatePassword()) return;

  isLoading.value = true;
  errorMessage.value = "";
  successMessage.value = "";

  try {
    if (mode.value === "signin") {
      await signInWithEmail(email.value, password.value);
      // Modal will close automatically via App.vue auth state listener
    } else {
      const result = await signUpWithEmail(email.value, password.value);

      // Check if email confirmation is required
      if (result.user && !result.session) {
        successMessage.value =
          "Account created! Please check your email to confirm your account.";
        email.value = "";
        password.value = "";
      }
    }
  } catch (error) {
    console.error("Auth error:", error);

    // User-friendly error messages
    if (error.message?.includes("Invalid login credentials")) {
      errorMessage.value = "Invalid email or password. Please try again.";
    } else if (error.message?.includes("Email not confirmed")) {
      errorMessage.value = "Please confirm your email before signing in.";
    } else if (error.message?.includes("User already registered")) {
      errorMessage.value = "This email is already registered. Try signing in instead.";
      mode.value = "signin";
    } else {
      errorMessage.value =
        mode.value === "signin"
          ? "Failed to sign in. Please check your credentials."
          : "Failed to create account. Please try again.";
    }
  } finally {
    isLoading.value = false;
  }
};

const handleGoogleSignIn = async () => {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    await signInWithGoogle();
  } catch (error) {
    errorMessage.value = "Failed to sign in with Google. Please try again.";
    console.error("Google sign in error:", error);
  } finally {
    isLoading.value = false;
  }
};

const handleGithubSignIn = async () => {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    await signInWithGithub();
  } catch (error) {
    errorMessage.value = "Failed to sign in with GitHub. Please try again.";
    console.error("GitHub sign in error:", error);
  } finally {
    isLoading.value = false;
  }
};

const handleResetPassword = async () => {
  if (!validateEmail()) return;

  isLoading.value = true;
  errorMessage.value = "";
  successMessage.value = "";

  try {
    await resetPassword(email.value);
    successMessage.value =
      "Password reset link sent! Check your email inbox.";
    email.value = "";
  } catch (error) {
    console.error("Reset password error:", error);
    // Provide more specific error messages based on Supabase error structure
    if (error && error.message) {
      const msg = error.message.toLowerCase();
      if (msg.includes("user not found") || msg.includes("no user found")) {
        errorMessage.value = "No account found with that email address.";
      } else if (msg.includes("rate limit") || msg.includes("too many requests")) {
        errorMessage.value = "Too many reset attempts. Please try again later.";
      } else if (msg.includes("invalid email")) {
        errorMessage.value = "The email address is invalid.";
      } else {
        errorMessage.value = error.message || "Failed to send reset link. Please try again.";
      }
    } else {
      errorMessage.value = "Failed to send reset link. Please try again.";
    }
  } finally {
    isLoading.value = false;
  }
};

const toggleMode = () => {
  mode.value = mode.value === "signin" ? "signup" : "signin";
  errorMessage.value = "";
  successMessage.value = "";
  emailError.value = "";
  passwordError.value = "";
};

defineEmits(["close"]);
</script>
