/**
 * Theme composable for managing dark/light mode
 * Supports system preference detection, manual toggle, and localStorage persistence
 */

import { ref, watch, onMounted } from "vue";

var STORAGE_KEY = "awesome-directories-theme";
var TRANSITION_CLASS = "transitioning";

// Theme state (reactive)
var theme = ref("system"); // 'light' | 'dark' | 'system'
var isDark = ref(false);

/**
 * Check if we're in a browser environment
 */
function isBrowser() {
  return typeof window !== "undefined";
}

/**
 * Get the effective theme based on system preference
 */
function getEffectiveTheme() {
  if (!isBrowser()) return "light";

  if (theme.value === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return theme.value;
}

/**
 * Apply theme to document
 */
function applyTheme(newTheme, animate) {
  if (!isBrowser()) return;

  var html = document.documentElement;
  var effectiveTheme = newTheme === "system" ? getEffectiveTheme() : newTheme;

  // Add transition class for smooth animation
  if (animate) {
    html.classList.add(TRANSITION_CLASS);
  }

  // Update classes
  if (effectiveTheme === "dark") {
    html.classList.add("dark");
    html.classList.remove("light");
  } else {
    html.classList.remove("dark");
    html.classList.add("light");
  }

  // Update isDark ref
  isDark.value = effectiveTheme === "dark";

  // Update meta theme-color
  var metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute(
      "content",
      effectiveTheme === "dark" ? "#09090B" : "#ffffff"
    );
  }

  // Remove transition class after animation completes
  if (animate) {
    setTimeout(function removeTransition() {
      html.classList.remove(TRANSITION_CLASS);
    }, 300);
  }
}

/**
 * Save theme preference to localStorage
 */
function saveTheme(themeValue) {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEY, themeValue);
  } catch (e) {
    console.warn("Failed to save theme preference:", e);
  }
}

/**
 * Load theme preference from localStorage
 */
function loadTheme() {
  if (!isBrowser()) return "system";
  try {
    return localStorage.getItem(STORAGE_KEY) || "system";
  } catch (e) {
    return "system";
  }
}

/**
 * Initialize theme on mount
 */
function initTheme() {
  if (!isBrowser()) return;

  // Load saved preference
  var savedTheme = loadTheme();
  theme.value = savedTheme;

  // Apply immediately without animation
  applyTheme(savedTheme, false);

  // Listen for system preference changes
  var mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  mediaQuery.addEventListener("change", function handleMediaChange(e) {
    if (theme.value === "system") {
      isDark.value = e.matches;
      applyTheme("system", true);
    }
  });
}

/**
 * Set theme programmatically
 */
function setTheme(newTheme) {
  theme.value = newTheme;
  saveTheme(newTheme);
  applyTheme(newTheme, true);
}

/**
 * Toggle between light and dark (ignores system)
 */
function toggleTheme() {
  var currentEffective = getEffectiveTheme();
  var newTheme = currentEffective === "dark" ? "light" : "dark";
  setTheme(newTheme);
}

/**
 * Cycle through: light -> dark -> system
 */
function cycleTheme() {
  var order = ["light", "dark", "system"];
  var currentIndex = order.indexOf(theme.value);
  var nextIndex = (currentIndex + 1) % order.length;
  setTheme(order[nextIndex]);
}

/**
 * Vue composable
 */
export function useTheme() {
  onMounted(function onThemeMount() {
    initTheme();
  });

  return {
    theme: theme,
    isDark: isDark,
    setTheme: setTheme,
    toggleTheme: toggleTheme,
    cycleTheme: cycleTheme,
  };
}

// Also export for non-Vue usage (e.g., Astro scripts)
export { theme, isDark, setTheme, toggleTheme, cycleTheme, initTheme };
