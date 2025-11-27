<template>
  <div
    class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
    style="position: fixed"
    role="dialog"
    aria-modal="true"
    aria-labelledby="auth-modal-title"
    @keydown.escape="handleClose"
  >
    <div
      class="fixed inset-0 bg-gray-900/75 transition-opacity"
      @click="handleClose"
      aria-hidden="true"
    ></div>

    <div
      class="relative bg-white rounded-t-2xl sm:rounded-xl shadow-xl w-full sm:max-w-md p-6 pb-8 sm:pb-6 transform transition-all safe-area-inset-bottom"
    >
      <!-- Mobile drag indicator -->
      <div class="sm:hidden flex justify-center mb-3 -mt-1">
        <div class="w-10 h-1 bg-gray-300 rounded-full"></div>
      </div>

      <button
        @click="handleClose"
        class="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600 transition-colors min-w-[48px] min-h-[48px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center rounded-full hover:bg-gray-100 touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-label="Close modal"
      >
        <svg
          class="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      <div class="text-center pt-2 sm:pt-0">
        <div class="text-4xl sm:text-5xl mb-4" aria-hidden="true">🚀</div>
        <h2
          id="auth-modal-title"
          class="text-xl sm:text-2xl font-bold text-gray-900 mb-2"
        >
          Welcome to Awesome Directories
        </h2>
        <p class="text-gray-600 mb-6 text-sm sm:text-base">
          Sign in to save favorites and track submissions
        </p>

        <div class="space-y-3">
          <button
            @click="handleGoogleSignIn"
            :disabled="isLoading"
            class="w-full flex items-center justify-center space-x-3 px-4 py-3.5 sm:py-3 border border-gray-300 rounded-xl sm:rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[52px] sm:min-h-[48px] touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <svg class="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" aria-hidden="true">
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
            <span class="font-medium text-gray-700 text-sm sm:text-base">
              {{
                isLoading && activeProvider === "google"
                  ? "Signing in..."
                  : "Continue with Google"
              }}
            </span>
          </button>

          <button
            @click="handleGithubSignIn"
            :disabled="isLoading"
            class="w-full flex items-center justify-center space-x-3 px-4 py-3.5 sm:py-3 bg-gray-900 text-white rounded-xl sm:rounded-lg hover:bg-gray-800 active:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[52px] sm:min-h-[48px] touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-600 focus-visible:ring-offset-2"
          >
            <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill-rule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                clip-rule="evenodd"
              />
            </svg>
            <span class="font-medium text-sm sm:text-base">
              {{
                isLoading && activeProvider === "github"
                  ? "Signing in..."
                  : "Continue with GitHub"
              }}
            </span>
          </button>

          <div
            v-if="errorMessage"
            class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg"
            role="alert"
          >
            <p class="text-sm text-red-600">{{ errorMessage }}</p>
          </div>
        </div>

        <div class="mt-6 pt-6 border-t border-gray-200">
          <button
            @click="handleClose"
            class="text-sm text-gray-600 hover:text-gray-900 active:text-gray-900 transition-colors font-medium min-h-[48px] sm:min-h-[44px] px-4 touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg"
          >
            Continue without account
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useAuth } from "@/composables/useAuth";

var { signInWithGoogle, signInWithGithub } = useAuth();

var isLoading = ref(false);
var errorMessage = ref("");
var activeProvider = ref("");

var emit = defineEmits(["close"]);

function handleClose() {
  emit("close");
}

// Prevent body scroll when modal is open
onMounted(function () {
  document.body.style.overflow = "hidden";
});

onUnmounted(function () {
  document.body.style.overflow = "";
});

async function handleGoogleSignIn() {
  isLoading.value = true;
  activeProvider.value = "google";
  errorMessage.value = "";

  try {
    await signInWithGoogle();
  } catch (error) {
    errorMessage.value = "Failed to sign in with Google. Please try again.";
    console.error("Google sign in error:", error);
  } finally {
    isLoading.value = false;
    activeProvider.value = "";
  }
}

async function handleGithubSignIn() {
  isLoading.value = true;
  activeProvider.value = "github";
  errorMessage.value = "";

  try {
    await signInWithGithub();
  } catch (error) {
    errorMessage.value = "Failed to sign in with GitHub. Please try again.";
    console.error("GitHub sign in error:", error);
  } finally {
    isLoading.value = false;
    activeProvider.value = "";
  }
}
</script>

<style scoped>
.safe-area-inset-bottom {
  padding-bottom: max(1.5rem, env(safe-area-inset-bottom));
}



@media (max-width: 640px) {
  .safe-area-inset-bottom {
    padding-bottom: max(2rem, env(safe-area-inset-bottom));
  }
}
</style>
