/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx,vue}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Brand colors using CSS variables
        brand: {
          primary: "var(--color-brand-primary)",
          "primary-hover": "var(--color-brand-primary-hover)",
          "primary-active": "var(--color-brand-primary-active)",
          secondary: "var(--color-brand-secondary)",
          accent: "var(--color-brand-accent)",
        },

        // Background colors
        surface: {
          primary: "var(--color-bg-primary)",
          secondary: "var(--color-bg-secondary)",
          tertiary: "var(--color-bg-tertiary)",
          elevated: "var(--color-bg-elevated)",
          inverse: "var(--color-bg-inverse)",
        },

        // Text colors
        content: {
          primary: "var(--color-text-primary)",
          secondary: "var(--color-text-secondary)",
          tertiary: "var(--color-text-tertiary)",
          disabled: "var(--color-text-disabled)",
          inverse: "var(--color-text-inverse)",
        },

        // Semantic colors
        success: {
          DEFAULT: "var(--color-success)",
          bg: "var(--color-success-bg)",
          text: "var(--color-success-text)",
        },
        warning: {
          DEFAULT: "var(--color-warning)",
          bg: "var(--color-warning-bg)",
          text: "var(--color-warning-text)",
        },
        error: {
          DEFAULT: "var(--color-error)",
          bg: "var(--color-error-bg)",
          text: "var(--color-error-text)",
        },
        info: {
          DEFAULT: "var(--color-info)",
          bg: "var(--color-info-bg)",
          text: "var(--color-info-text)",
        },

        // Border colors
        border: {
          primary: "var(--color-border-primary)",
          secondary: "var(--color-border-secondary)",
          focus: "var(--color-border-focus)",
        },

        // Domain Rating colors
        dr: {
          high: "var(--color-dr-high)",
          good: "var(--color-dr-good)",
          medium: "var(--color-dr-medium)",
          low: "var(--color-dr-low)",
        },

        // Legacy compatibility (gradually migrate away from these)
        primary: {
          DEFAULT: "var(--color-brand-primary)",
          dark: "var(--color-brand-primary-hover)",
          light: "#A5B4FC",
        },
        danger: "var(--color-error)",
      },

      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },

      maxWidth: {
        "8xl": "var(--max-width-8xl)",
      },

      zIndex: {
        dropdown: "var(--z-dropdown)",
        sticky: "var(--z-sticky)",
        fixed: "var(--z-fixed)",
        "modal-backdrop": "var(--z-modal-backdrop)",
        modal: "var(--z-modal)",
        popover: "var(--z-popover)",
        tooltip: "var(--z-tooltip)",
        toast: "var(--z-toast)",
      },

      animation: {
        "fade-in": "fadeIn var(--duration-normal) var(--ease-default)",
        "fade-out": "fadeOut var(--duration-fast) var(--ease-default)",
        "slide-up": "slideUp var(--duration-normal) var(--ease-default)",
        "slide-down": "slideDown var(--duration-normal) var(--ease-default)",
        "scale-in": "scaleIn var(--duration-normal) var(--ease-default)",
        shimmer: "shimmer 1.5s infinite",
      },

      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        fadeOut: {
          from: { opacity: "1" },
          to: { opacity: "0" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          from: { opacity: "0", transform: "translateY(-10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};
