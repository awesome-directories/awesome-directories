<template>
  <Teleport to="body">
    <TransitionGroup
      name="toast"
      tag="div"
      class="toast-container"
      role="region"
      aria-label="Notifications"
      aria-live="polite"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="['toast', `toast-${toast.type}`]"
        role="alert"
      >
        <div class="toast-icon">
          <!-- Success icon -->
          <svg
            v-if="toast.type === 'success'"
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
          <!-- Error icon -->
          <svg
            v-else-if="toast.type === 'error'"
            class="w-5 h-5"
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
          <!-- Warning icon -->
          <svg
            v-else-if="toast.type === 'warning'"
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <!-- Info icon -->
          <svg
            v-else
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <div class="toast-content">
          <p v-if="toast.title" class="toast-title">{{ toast.title }}</p>
          <p class="toast-message">{{ toast.message }}</p>
        </div>

        <button
          v-if="toast.dismissible !== false"
          @click="dismiss(toast.id)"
          class="toast-dismiss"
          aria-label="Dismiss notification"
        >
          <svg
            class="w-4 h-4"
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
      </div>
    </TransitionGroup>
  </Teleport>
</template>

<script setup>
import { useToast } from "@/composables/useToast";

var { toasts, dismiss } = useToast();
</script>

<style scoped>
/* Toast Container */
.toast-container {
  position: fixed;
  bottom: var(--space-4);
  right: var(--space-4);
  z-index: var(--z-toast);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  max-width: 24rem;
  width: calc(100vw - var(--space-8));
  pointer-events: none;
}

@media (min-width: 640px) {
  .toast-container {
    bottom: var(--space-6);
    right: var(--space-6);
    width: auto;
    min-width: 20rem;
  }
}

/* Toast Base */
.toast {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-4);
  background-color: var(--color-bg-elevated);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--color-border-primary);
  pointer-events: auto;
}

/* Toast Types */
.toast-success .toast-icon {
  color: var(--color-success);
  background-color: var(--color-success-bg);
}

.toast-error .toast-icon {
  color: var(--color-error);
  background-color: var(--color-error-bg);
}

.toast-warning .toast-icon {
  color: var(--color-warning);
  background-color: var(--color-warning-bg);
}

.toast-info .toast-icon {
  color: var(--color-info);
  background-color: var(--color-info-bg);
}

/* Toast Icon */
.toast-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: var(--radius-full);
}

/* Toast Content */
.toast-content {
  flex: 1;
  min-width: 0;
}

.toast-title {
  font-weight: var(--font-semibold);
  color: var(--color-text-primary);
  font-size: var(--text-sm);
  margin: 0;
  line-height: var(--leading-tight);
}

.toast-message {
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
  margin: 0;
  line-height: var(--leading-normal);
}

.toast-title + .toast-message {
  margin-top: var(--space-1);
}

/* Toast Dismiss Button */
.toast-dismiss {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  margin: calc(var(--space-1) * -1);
  border-radius: var(--radius-md);
  color: var(--color-text-tertiary);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background-color var(--duration-fast) var(--ease-default),
              color var(--duration-fast) var(--ease-default);
}

.toast-dismiss:hover {
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
}

.toast-dismiss:focus-visible {
  outline: var(--ring-width) solid var(--ring-color);
  outline-offset: var(--ring-offset);
}

/* Toast Transitions */
.toast-enter-active {
  transition: all var(--duration-normal) var(--ease-out);
}

.toast-leave-active {
  transition: all var(--duration-fast) var(--ease-in);
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-move {
  transition: transform var(--duration-normal) var(--ease-default);
}

@media (prefers-reduced-motion: reduce) {
  .toast-enter-active,
  .toast-leave-active,
  .toast-move {
    transition: none;
  }

  .toast-enter-from,
  .toast-leave-to {
    transform: none;
  }
}
</style>
