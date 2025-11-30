<template>
  <button
    @click="toggleTheme"
    class="theme-toggle"
    :aria-label="ariaLabel"
    :title="ariaLabel"
  >
    <!-- Sun icon (shown in dark mode) -->
    <svg
      v-if="currentTheme === 'dark'"
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
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
    <!-- Moon icon (shown in light mode) -->
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
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
      />
    </svg>
  </button>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";

var STORAGE_KEY = "awesome-directories-theme";

var currentTheme = ref("light");

var ariaLabel = computed(function getAriaLabel() {
  return currentTheme.value === "dark"
    ? "Switch to light mode"
    : "Switch to dark mode";
});

function getSystemTheme() {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getEffectiveTheme(preference) {
  if (preference === "system") {
    return getSystemTheme();
  }
  return preference;
}

function applyTheme(theme) {
  var html = document.documentElement;

  // Add transitioning class for smooth color transition
  html.classList.add("transitioning");

  if (theme === "dark") {
    html.classList.remove("light");
    html.classList.add("dark");
  } else {
    html.classList.remove("dark");
    html.classList.add("light");
  }

  // Remove transitioning class after animation completes
  setTimeout(function removeTransitioning() {
    html.classList.remove("transitioning");
  }, 300);
}

function toggleTheme() {
  var newTheme = currentTheme.value === "dark" ? "light" : "dark";
  currentTheme.value = newTheme;

  try {
    localStorage.setItem(STORAGE_KEY, newTheme);
  } catch (e) {
    // localStorage not available
  }

  applyTheme(newTheme);
}

onMounted(function initTheme() {
  var savedTheme = "system";
  try {
    savedTheme = localStorage.getItem(STORAGE_KEY) || "system";
  } catch (e) {
    // localStorage not available
  }

  var effectiveTheme = getEffectiveTheme(savedTheme);
  currentTheme.value = effectiveTheme;

  // Listen for system theme changes
  if (typeof window !== "undefined") {
    var mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", function handleSystemChange(e) {
      var storedTheme = "system";
      try {
        storedTheme = localStorage.getItem(STORAGE_KEY) || "system";
      } catch (err) {
        // localStorage not available
      }

      if (storedTheme === "system") {
        var newTheme = e.matches ? "dark" : "light";
        currentTheme.value = newTheme;
        applyTheme(newTheme);
      }
    });
  }
});
</script>

<style scoped>
.theme-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  min-width: 44px;
  padding: 0.5rem;
  border-radius: var(--radius-lg);
  color: var(--color-text-secondary);
  background-color: transparent;
  border: none;
  cursor: pointer;
  transition: background-color var(--duration-fast) var(--ease-default),
    color var(--duration-fast) var(--ease-default);
}

.theme-toggle:hover {
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
}

.theme-toggle:focus-visible {
  outline: var(--ring-width) solid var(--ring-color);
  outline-offset: var(--ring-offset);
}
</style>
