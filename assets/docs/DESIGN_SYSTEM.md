# Awesome Directories - Design System

**Version:** 1.0
**Last Updated:** 2025-11-09
**Framework:** Tailwind CSS v4

Complete technical documentation for implementing the Awesome Directories design system.

---

## Table of Contents

1. [Design Tokens](#design-tokens)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Spacing](#spacing)
5. [Components](#components)
6. [Responsive Design](#responsive-design)
7. [Accessibility](#accessibility)
8. [Code Examples](#code-examples)

---

## Design Tokens

### Base Unit

**Spacing Base:** 8px (0.5rem)

All spacing follows an 8-point grid system for consistency.

---

## Color System

### Tailwind Configuration

```javascript
// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#3b82f6",
          dark: "#2563eb",
          light: "#60a5fa",
        },
        success: "#10b981",
        warning: "#f59e0b",
        danger: "#ef4444",
        // Domain Rating tiers
        dr: {
          high: "#10b981", // 300+ (green)
          medium: "#3b82f6", // 70-79 (blue)
          low: "#f59e0b", // 60-69 (orange)
          verylow: "#6b7280", // <60 (gray)
        },
      },
    },
  },
};
```

### Color Usage

| Semantic Name | Hex       | Tailwind Class | Usage                             |
| ------------- | --------- | -------------- | --------------------------------- |
| Primary       | `#3b82f6` | `bg-primary`   | CTAs, links, brand                |
| Success       | `#10b981` | `bg-success`   | Dofollow, DR 300+, success states |
| Warning       | `#f59e0b` | `bg-warning`   | Paid directories, DR 60-79        |
| Danger        | `#ef4444` | `bg-danger`    | Errors, DR <60                    |

### Text Colors

```html
<!-- Primary text -->
<p class="text-gray-900">Heading text</p>

<!-- Body text -->
<p class="text-gray-700">Body text</p>

<!-- Secondary text -->
<p class="text-gray-600">Secondary text</p>

<!-- Muted text -->
<p class="text-gray-500">Placeholder or muted text</p>
```

---

## Typography

### Font Configuration

```css
/* globals.css */
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap");

body {
  font-family:
    "Inter",
    system-ui,
    -apple-system,
    sans-serif;
  font-size: 16px;
  line-height: 1.6;
  color: #374151; /* gray-700 */
}
```

### Type Scale

```html
<!-- H1 - Page Title -->
<h1 class="text-5xl font-extrabold text-gray-900 leading-tight">
  Find the Top 20 Directories
</h1>

<!-- H2 - Section Header -->
<h2 class="text-4xl font-bold text-gray-900 leading-snug">
  Featured Directories
</h2>

<!-- H3 - Subsection Header -->
<h3 class="text-3xl font-bold text-gray-900 leading-snug">
  High Domain Rating
</h3>

<!-- H4 - Card Title -->
<h4 class="text-xl font-semibold text-gray-900">Product Hunt</h4>

<!-- Body Text -->
<p class="text-base text-gray-700 leading-relaxed">
  Regular paragraph text with good readability.
</p>

<!-- Small Text -->
<p class="text-sm text-gray-600">Helper text, captions, or metadata</p>

<!-- Tiny Text -->
<span class="text-xs font-medium text-gray-500 uppercase tracking-wide">
  Label
</span>
```

### Font Weights

```javascript
fontWeight: {
  normal: '400',    // Body text
  medium: '500',    // Emphasized text, labels
  semibold: '600',  // Subheadings, buttons
  bold: '700',      // Headings
  extrabold: '800', // Hero headings
}
```

---

## Spacing

### Spacing Scale

Based on 8px (0.5rem) increments:

| Token | Rem    | Pixels | Tailwind Class | Usage                 |
| ----- | ------ | ------ | -------------- | --------------------- |
| `xs`  | 0.5rem | 8px    | `p-2`, `m-2`   | Tight spacing, badges |
| `sm`  | 1rem   | 16px   | `p-4`, `m-4`   | Component padding     |
| `md`  | 1.5rem | 24px   | `p-6`, `m-6`   | Card padding          |
| `lg`  | 2rem   | 32px   | `p-8`, `m-8`   | Section padding       |
| `xl`  | 4rem   | 64px   | `p-16`, `m-16` | Page sections         |
| `2xl` | 6rem   | 96px   | `p-24`, `m-24` | Hero sections         |

### Common Spacing Patterns

```html
<!-- Card -->
<div class="p-6 space-y-4">
  <!-- Internal spacing -->
</div>

<!-- Section -->
<section class="py-16 px-4">
  <!-- Content -->
</section>

<!-- Button -->
<button class="px-6 py-3">Click Me</button>
```

---

## Components

### Buttons

#### Primary Button

```html
<button
  class="
  px-6 py-3
  bg-primary hover:bg-primary-dark
  text-white font-semibold
  rounded-xl
  transition-colors duration-200
  shadow-sm hover:shadow-md
"
>
  Start Browsing
</button>
```

#### Secondary Button

```html
<button
  class="
  px-6 py-3
  bg-white hover:bg-gray-50
  text-gray-700 font-semibold
  border-2 border-gray-300
  rounded-xl
  transition-colors duration-200
"
>
  Learn More
</button>
```

#### Button Sizes

```html
<!-- Small -->
<button class="px-4 py-2 text-sm">Small</button>

<!-- Medium (default) -->
<button class="px-6 py-3 text-base">Medium</button>

<!-- Large -->
<button class="px-8 py-4 text-lg">Large</button>
```

### Badges

#### Domain Rating Badge

```html
<!-- High DR (300+) -->
<span
  class="
  inline-flex items-center
  px-3 py-1
  bg-success/10
  text-success font-bold text-sm
  rounded-full
"
>
  DR 300+
</span>

<!-- Medium DR (70-79) -->
<span
  class="
  inline-flex items-center
  px-3 py-1
  bg-primary/10
  text-primary font-bold text-sm
  rounded-full
"
>
  DR 78
</span>

<!-- Low DR (<60) -->
<span
  class="
  inline-flex items-center
  px-3 py-1
  bg-gray-500/10
  text-gray-600 font-bold text-sm
  rounded-full
"
>
  DR 45
</span>
```

#### Dofollow Badge

```html
<span
  class="
  inline-flex items-center gap-1
  px-3 py-1
  bg-success/10
  text-success font-semibold text-xs
  rounded-full
"
>
  ✓ Dofollow
</span>
```

#### Pricing Badge

```html
<!-- Free -->
<span
  class="
  px-3 py-1
  bg-primary/10
  text-primary font-semibold text-xs
  rounded-full
"
>
  Free
</span>

<!-- Paid -->
<span
  class="
  px-3 py-1
  bg-warning/10
  text-warning font-semibold text-xs
  rounded-full
"
>
  Paid
</span>

<!-- Freemium -->
<span
  class="
  px-3 py-1
  bg-gray-500/10
  text-gray-600 font-semibold text-xs
  rounded-full
"
>
  Freemium
</span>
```

### Cards

#### Directory Card

```html
<div
  class="
  bg-white
  border-2 border-gray-200
  rounded-xl
  p-6
  hover:border-primary
  hover:shadow-lg
  transition-all duration-200
"
>
  <!-- Card content -->
  <div class="flex items-start gap-4">
    <!-- Logo -->
    <div class="w-12 h-12 rounded-lg bg-gray-100"></div>

    <!-- Content -->
    <div class="flex-1">
      <h3 class="text-lg font-bold text-gray-900 mb-1">Directory Name</h3>
      <p class="text-sm text-gray-600 mb-3">Description goes here</p>

      <!-- Badges -->
      <div class="flex flex-wrap gap-2">
        <!-- DR Badge -->
        <!-- Dofollow Badge -->
        <!-- Pricing Badge -->
      </div>
    </div>

    <!-- Helpful votes -->
    <div class="text-sm text-gray-600">👍 142 helpful</div>
  </div>
</div>
```

### Inputs

#### Text Input

```html
<input
  type="text"
  class="
    w-full
    px-4 py-3
    border-2 border-gray-300
    rounded-lg
    text-gray-900
    placeholder:text-gray-500
    focus:border-primary focus:ring-2 focus:ring-primary/20
    transition-colors duration-200
  "
  placeholder="Search directories..."
/>
```

#### Select/Dropdown

```html
<select
  class="
  w-full
  px-4 py-3
  border-2 border-gray-300
  rounded-lg
  text-gray-900
  bg-white
  focus:border-primary focus:ring-2 focus:ring-primary/20
  transition-colors duration-200
"
>
  <option>All Categories</option>
  <option>Tech</option>
  <option>SaaS</option>
</select>
```

### Modals

```html
<!-- Modal Overlay -->
<div
  class="
  fixed inset-0
  bg-gray-900/50
  backdrop-blur-sm
  z-40
"
></div>

<!-- Modal Content -->
<div
  class="
  fixed inset-0
  flex items-center justify-center
  z-50
  p-4
"
>
  <div
    class="
    bg-white
    rounded-2xl
    shadow-2xl
    max-w-2xl w-full
    max-h-[90vh]
    overflow-auto
  "
  >
    <!-- Modal Header -->
    <div
      class="
      px-6 py-4
      border-b border-gray-200
      flex items-center justify-between
    "
    >
      <h2 class="text-2xl font-bold text-gray-900">Modal Title</h2>
      <button
        class="
        w-10 h-10
        rounded-full
        hover:bg-gray-100
        transition-colors
      "
      >
        ×
      </button>
    </div>

    <!-- Modal Body -->
    <div class="p-6">
      <!-- Content -->
    </div>

    <!-- Modal Footer -->
    <div
      class="
      px-6 py-4
      border-t border-gray-200
      flex gap-3 justify-end
    "
    >
      <button class="secondary-button">Cancel</button>
      <button class="primary-button">Confirm</button>
    </div>
  </div>
</div>
```

---

## Responsive Design

### Breakpoints

```javascript
screens: {
  'sm': '640px',   // Mobile landscape, small tablets
  'md': '768px',   // Tablets
  'lg': '1024px',  // Desktop
  'xl': '1280px',  // Large desktop
  '2xl': '1536px', // Extra large
}
```

### Mobile-First Approach

```html
<!-- Stack on mobile, grid on desktop -->
<div
  class="
  grid grid-cols-1
  md:grid-cols-2
  lg:grid-cols-3
  gap-6
"
>
  <!-- Cards -->
</div>

<!-- Hidden on mobile, visible on desktop -->
<div class="hidden lg:block">Sidebar content</div>

<!-- Responsive text sizes -->
<h1
  class="
  text-3xl
  md:text-4xl
  lg:text-5xl
  font-bold
"
>
  Responsive Heading
</h1>
```

### Touch Targets

Minimum 44x44px for all interactive elements:

```html
<button
  class="
  min-h-[44px]
  px-6
  touch-manipulation
"
>
  Tap Me
</button>
```

---

## Accessibility

### WCAG 2.1 AA Compliance

All components meet minimum contrast ratios:

- **Normal text:** 4.5:1
- **Large text (24px+):** 3:1
- **UI components:** 3:1

### Semantic HTML

```html
<!-- Use semantic elements -->
<header><!-- Header content --></header>
<main><!-- Main content --></main>
<nav><!-- Navigation --></nav>
<article><!-- Article content --></article>
<footer><!-- Footer content --></footer>

<!-- Proper heading hierarchy -->
<h1>Page Title</h1>
<h2>Section</h2>
<h3>Subsection</h3>
```

### ARIA Labels

```html
<!-- Button with icon only -->
<button aria-label="Close modal">
  <svg><!-- Icon --></svg>
</button>

<!-- Search input -->
<input type="search" aria-label="Search directories" placeholder="Search..." />

<!-- Loading state -->
<div aria-live="polite" aria-busy="true">Loading directories...</div>
```

### Focus States

```html
<button
  class="
  focus:outline-none
  focus:ring-2
  focus:ring-primary
  focus:ring-offset-2
"
>
  Accessible Button
</button>
```

### Keyboard Navigation

- All interactive elements must be keyboard accessible
- Tab order should be logical
- Enter/Space should activate buttons
- Escape should close modals

---

## Code Examples

### Complete Directory Card Component

```html
<article
  class="
  bg-white
  border-2 border-gray-200
  rounded-xl
  p-6
  hover:border-primary
  hover:shadow-lg
  transition-all duration-200
  focus-within:ring-2 focus-within:ring-primary/20
"
>
  <div class="flex items-start gap-4">
    <!-- Logo -->
    <img
      src="/logos/product-hunt.png"
      alt="Product Hunt logo"
      class="w-12 h-12 rounded-lg object-cover flex-shrink-0"
    />

    <!-- Content -->
    <div class="flex-1 min-w-0">
      <!-- Title -->
      <h3 class="text-lg font-bold text-gray-900 mb-1 truncate">
        <a
          href="/directories/product-hunt"
          class="hover:text-primary transition-colors focus:outline-none focus:underline"
        >
          Product Hunt
        </a>
      </h3>

      <!-- Description -->
      <p class="text-sm text-gray-600 mb-3 line-clamp-2">
        The best new products in tech. Launch platform for product enthusiasts.
      </p>

      <!-- Badges -->
      <div class="flex flex-wrap gap-2">
        <!-- DR Badge -->
        <span
          class="
          inline-flex items-center
          px-3 py-1
          bg-success/10
          text-success font-bold text-sm
          rounded-full
        "
        >
          DR 92
        </span>

        <!-- Dofollow Badge -->
        <span
          class="
          inline-flex items-center gap-1
          px-3 py-1
          bg-success/10
          text-success font-semibold text-xs
          rounded-full
        "
        >
          ✓ Dofollow
        </span>

        <!-- Pricing Badge -->
        <span
          class="
          px-3 py-1
          bg-primary/10
          text-primary font-semibold text-xs
          rounded-full
        "
        >
          Free
        </span>
      </div>
    </div>

    <!-- Helpful votes -->
    <div class="text-sm text-gray-600 flex-shrink-0">
      <button
        class="
          hover:text-primary
          transition-colors
          focus:outline-none
          focus:text-primary
        "
        aria-label="Mark as helpful"
      >
        👍 142
      </button>
    </div>
  </div>
</article>
```

### Filter Component

```html
<div class="bg-white border-2 border-gray-200 rounded-xl p-6 sticky top-4">
  <h3 class="text-lg font-bold text-gray-900 mb-4">Filters</h3>

  <!-- Domain Rating Filter -->
  <div class="mb-6">
    <label class="block text-sm font-semibold text-gray-700 mb-3">
      Domain Rating
    </label>

    <div class="flex flex-wrap gap-2">
      <button
        class="
        px-4 py-2
        bg-primary text-white
        font-semibold text-sm
        rounded-lg
        hover:bg-primary-dark
        transition-colors
      "
      >
        70+
      </button>
      <button
        class="
        px-4 py-2
        bg-gray-100 text-gray-700
        font-semibold text-sm
        rounded-lg
        hover:bg-gray-200
        transition-colors
      "
      >
        80+
      </button>
      <button
        class="
        px-4 py-2
        bg-gray-100 text-gray-700
        font-semibold text-sm
        rounded-lg
        hover:bg-gray-200
        transition-colors
      "
      >
        300+
      </button>
    </div>
  </div>

  <!-- Link Type Filter -->
  <div class="mb-6">
    <label class="block text-sm font-semibold text-gray-700 mb-3">
      Link Type
    </label>

    <label class="flex items-center gap-3 mb-2 cursor-pointer">
      <input
        type="checkbox"
        class="
          w-5 h-5
          border-2 border-gray-300
          rounded
          text-success
          focus:ring-2 focus:ring-success/20
        "
        checked
      />
      <span class="text-sm text-gray-700">Dofollow only</span>
    </label>
  </div>

  <!-- Pricing Filter -->
  <div>
    <label class="block text-sm font-semibold text-gray-700 mb-3">
      Pricing
    </label>

    <div class="space-y-2">
      <label class="flex items-center gap-3 cursor-pointer">
        <input
          type="radio"
          name="pricing"
          class="
            w-5 h-5
            border-2 border-gray-300
            text-primary
            focus:ring-2 focus:ring-primary/20
          "
          checked
        />
        <span class="text-sm text-gray-700">All</span>
      </label>
      <label class="flex items-center gap-3 cursor-pointer">
        <input
          type="radio"
          name="pricing"
          class="
            w-5 h-5
            border-2 border-gray-300
            text-primary
            focus:ring-2 focus:ring-primary/20
          "
        />
        <span class="text-sm text-gray-700">Free only</span>
      </label>
      <label class="flex items-center gap-3 cursor-pointer">
        <input
          type="radio"
          name="pricing"
          class="
            w-5 h-5
            border-2 border-gray-300
            text-primary
            focus:ring-2 focus:ring-primary/20
          "
        />
        <span class="text-sm text-gray-700">Paid</span>
      </label>
    </div>
  </div>
</div>
```

---

## Animation & Transitions

### Recommended Durations

```javascript
transitionDuration: {
  fast: '150ms',    // Hover states
  base: '200ms',    // Default transitions
  slow: '300ms',    // Complex animations
}
```

### Common Transitions

```html
<!-- Hover scale -->
<div
  class="
  transition-transform duration-200
  hover:scale-105
"
>
  Card
</div>

<!-- Fade in -->
<div
  class="
  opacity-0 animate-fade-in
"
>
  Content
</div>

<!-- Slide up -->
<div
  class="
  translate-y-4 opacity-0
  animate-slide-up
"
>
  Modal
</div>
```

### Animation Classes

```css
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(16px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-fade-in {
  animation: fadeIn 300ms ease-in;
}

.animate-slide-up {
  animation: slideUp 300ms ease-out;
}
```

---

## Performance Best Practices

### Images

```html
<!-- Always include width, height, and alt -->
<img
  src="/logos/product-hunt.png"
  alt="Product Hunt"
  width="48"
  height="48"
  loading="lazy"
  class="rounded-lg"
/>
```

### Icons

Use SVG icons with `currentColor` for theme flexibility:

```html
<svg
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  class="text-primary"
>
  <!-- Icon path -->
</svg>
```

---

## Resources

- **Tailwind CSS Docs:** https://tailwindcss.com/docs
- **WCAG Guidelines:** https://www.w3.org/WAI/WCAG21/quickref/
- **Color Contrast Checker:** https://webaim.org/resources/contrastchecker/

---

**Questions?** Open an issue on GitHub or reach out to @meysam_io on Twitter.
