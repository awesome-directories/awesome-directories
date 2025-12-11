<template>
  <div
    class="modal-container"
    role="dialog"
    aria-modal="true"
    aria-labelledby="auth-modal-title"
    @keydown.escape="handleClose"
  >
    <div
      class="modal-backdrop"
      @click="handleClose"
      aria-hidden="true"
    ></div>

    <div class="modal-panel">
      <!-- Mobile drag indicator -->
      <div class="drag-indicator-container">
        <div class="drag-indicator"></div>
      </div>

      <button
        @click="handleClose"
        class="modal-close-btn"
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
        <h2 id="auth-modal-title" class="modal-title">
          Welcome to Awesome Directories
        </h2>
        <p class="modal-subtitle">
          Sign in to save favorites and track submissions
        </p>

        <div class="space-y-3">
          <button
            @click="handleGoogleSignIn"
            :disabled="isLoading"
            class="oauth-btn oauth-btn-google"
          >
            <svg
              class="w-5 h-5 flex-shrink-0"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
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
            <span class="oauth-btn-text">
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
            class="oauth-btn oauth-btn-github"
          >
            <svg
              class="w-5 h-5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fill-rule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                clip-rule="evenodd"
              />
            </svg>
            <span class="oauth-btn-text">
              {{
                isLoading && activeProvider === "github"
                  ? "Signing in..."
                  : "Continue with GitHub"
              }}
            </span>
          </button>

          <div
            v-if="errorMessage"
            class="error-alert"
            role="alert"
          >
            <p class="error-text">{{ errorMessage }}</p>
          </div>
        </div>

        <div class="modal-footer">
          <button
            @click="handleClose"
            class="skip-btn"
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
/* Modal Container */
.modal-container {
  position: fixed;
  inset: 0;
  z-index: var(--z-modal);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 0;
}

@media (min-width: 640px) {
  .modal-container {
    align-items: center;
    padding: 1rem;
  }
}

/* Modal Backdrop */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgb(0 0 0 / 0.75);
  transition: opacity var(--duration-normal) var(--ease-default);
}

/* Modal Panel */
.modal-panel {
  position: relative;
  background-color: var(--color-bg-primary);
  border-radius: var(--radius-2xl) var(--radius-2xl) 0 0;
  box-shadow: var(--shadow-xl);
  width: 100%;
  padding: 1.5rem 1.5rem 2rem;
  transform: translateY(0);
  transition: transform var(--duration-normal) var(--ease-default);
  padding-bottom: max(2rem, env(safe-area-inset-bottom));
}

@media (min-width: 640px) {
  .modal-panel {
    max-width: 28rem;
    border-radius: var(--radius-xl);
    padding: 1.5rem;
  }
}

/* Drag Indicator (mobile) */
.drag-indicator-container {
  display: flex;
  justify-content: center;
  margin-bottom: 0.75rem;
  margin-top: -0.25rem;
}

@media (min-width: 640px) {
  .drag-indicator-container {
    display: none;
  }
}

.drag-indicator {
  width: 2.5rem;
  height: 0.25rem;
  background-color: var(--color-border-secondary);
  border-radius: var(--radius-full);
}

/* Close Button */
.modal-close-btn {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  color: var(--color-text-tertiary);
  min-width: 48px;
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  background: transparent;
  border: none;
  cursor: pointer;
  touch-action: manipulation;
  transition: color var(--duration-fast) var(--ease-default),
              background-color var(--duration-fast) var(--ease-default);
}

@media (min-width: 640px) {
  .modal-close-btn {
    top: 1rem;
    right: 1rem;
    min-width: 44px;
    min-height: 44px;
  }
}

.modal-close-btn:hover {
  color: var(--color-text-secondary);
  background-color: var(--color-bg-tertiary);
}

.modal-close-btn:focus-visible {
  outline: var(--ring-width) solid var(--ring-color);
  outline-offset: var(--ring-offset);
}

/* Modal Title */
.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 0.5rem;
}

@media (min-width: 640px) {
  .modal-title {
    font-size: 1.5rem;
  }
}

/* Modal Subtitle */
.modal-subtitle {
  color: var(--color-text-secondary);
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
}

@media (min-width: 640px) {
  .modal-subtitle {
    font-size: 1rem;
  }
}

/* OAuth Buttons */
.oauth-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  border-radius: var(--radius-xl);
  min-height: 52px;
  touch-action: manipulation;
  cursor: pointer;
  transition: background-color var(--duration-fast) var(--ease-default),
              border-color var(--duration-fast) var(--ease-default);
}

@media (min-width: 640px) {
  .oauth-btn {
    padding: 0.75rem 1rem;
    min-height: 48px;
    border-radius: var(--radius-lg);
  }
}

.oauth-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.oauth-btn:focus-visible {
  outline: var(--ring-width) solid var(--ring-color);
  outline-offset: var(--ring-offset);
}

/* Google Button */
.oauth-btn-google {
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border-primary);
}

.oauth-btn-google:hover:not(:disabled) {
  background-color: var(--color-bg-tertiary);
}

.oauth-btn-google:active:not(:disabled) {
  background-color: var(--color-border-primary);
}

.oauth-btn-google .oauth-btn-text {
  color: var(--color-text-secondary);
  font-weight: 500;
  font-size: 0.875rem;
}

@media (min-width: 640px) {
  .oauth-btn-google .oauth-btn-text {
    font-size: 1rem;
  }
}

/* GitHub Button */
.oauth-btn-github {
  background-color: var(--color-bg-inverse);
  color: var(--color-text-inverse);
  border: 1px solid var(--color-bg-inverse);
}

.oauth-btn-github:hover:not(:disabled) {
  background-color: #27272A;
  border-color: #27272A;
}

.oauth-btn-github:active:not(:disabled) {
  background-color: #3F3F46;
  border-color: #3F3F46;
}

.oauth-btn-github .oauth-btn-text {
  font-weight: 500;
  font-size: 0.875rem;
}

@media (min-width: 640px) {
  .oauth-btn-github .oauth-btn-text {
    font-size: 1rem;
  }
}

/* Error Alert */
.error-alert {
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: var(--color-error-bg);
  border: 1px solid var(--color-error);
  border-radius: var(--radius-lg);
}

.error-text {
  font-size: 0.875rem;
  color: var(--color-error-text);
}

/* Modal Footer */
.modal-footer {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-border-primary);
}

/* Skip Button */
.skip-btn {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  font-weight: 500;
  min-height: 48px;
  padding: 0 1rem;
  background: transparent;
  border: none;
  border-radius: var(--radius-lg);
  cursor: pointer;
  touch-action: manipulation;
  transition: color var(--duration-fast) var(--ease-default);
}

@media (min-width: 640px) {
  .skip-btn {
    min-height: 44px;
  }
}

.skip-btn:hover {
  color: var(--color-text-primary);
}

.skip-btn:focus-visible {
  outline: var(--ring-width) solid var(--ring-color);
  outline-offset: var(--ring-offset);
}
</style>
