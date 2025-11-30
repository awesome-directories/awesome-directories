# Awesome Directories — UI Design System

> **Last Updated**: 2025-11-30
> **Design Version**: 1.0
> **Status**: Phase 1 In Progress
> **Direction**: Linear Clarity

## Design Philosophy

Precision meets clarity. We build interfaces that feel as reliable as the data they display—clean, confident, and keyboard-accessible. Every interaction should feel intentional, every metric should be instantly readable, and the experience should delight technical users while remaining approachable to first-time launchers.

**Core Principles**:
1. **Data clarity over decoration** — Metrics are the hero, not the chrome
2. **Speed is a feature** — < 100ms response to every interaction
3. **Dark mode is native** — Not an afterthought, designed together
4. **Keyboard-first** — Power users navigate without touching the mouse

---

## Design Direction

**Chosen Direction**: Linear Clarity

**Mood**: Precise, confident, developer-focused, minimal, trustworthy

**Reference Anchors**:
- **Linear** — Clean dark/light modes, crisp typography, keyboard-first UX
- **Vercel Dashboard** — Excellent information density, monospace accents
- **Raycast** — Command palette UX, subtle gradients, refined animations

---

## Design Tokens

### Colors — Light Mode

```css
/* Backgrounds */
--color-bg-primary: #FFFFFF;
--color-bg-secondary: #F9FAFB;
--color-bg-tertiary: #F3F4F6;
--color-bg-elevated: #FFFFFF;
--color-bg-inverse: #18181B;

/* Text */
--color-text-primary: #18181B;
--color-text-secondary: #52525B;
--color-text-tertiary: #71717A;
--color-text-disabled: #A1A1AA;
--color-text-inverse: #FAFAFA;

/* Brand */
--color-brand-primary: #6366F1;       /* Indigo 500 */
--color-brand-primary-hover: #4F46E5; /* Indigo 600 */
--color-brand-primary-active: #4338CA;/* Indigo 700 */
--color-brand-secondary: #8B5CF6;     /* Violet 500 */
--color-brand-accent: #06B6D4;        /* Cyan 500 */

/* Semantic */
--color-success: #10B981;
--color-success-bg: #D1FAE5;
--color-success-text: #065F46;

--color-warning: #F59E0B;
--color-warning-bg: #FEF3C7;
--color-warning-text: #92400E;

--color-error: #EF4444;
--color-error-bg: #FEE2E2;
--color-error-text: #991B1B;

--color-info: #3B82F6;
--color-info-bg: #DBEAFE;
--color-info-text: #1E40AF;

/* Borders */
--color-border-primary: #E4E4E7;
--color-border-secondary: #D4D4D8;
--color-border-focus: #6366F1;

/* Domain Rating Colors */
--color-dr-high: #10B981;    /* 80+ */
--color-dr-good: #3B82F6;    /* 70-79 */
--color-dr-medium: #F59E0B;  /* 60-69 */
--color-dr-low: #71717A;     /* <60 */
```

### Colors — Dark Mode

```css
/* Backgrounds */
--color-bg-primary: #09090B;
--color-bg-secondary: #18181B;
--color-bg-tertiary: #27272A;
--color-bg-elevated: #27272A;
--color-bg-inverse: #FAFAFA;

/* Text */
--color-text-primary: #FAFAFA;
--color-text-secondary: #A1A1AA;
--color-text-tertiary: #71717A;
--color-text-disabled: #52525B;
--color-text-inverse: #18181B;

/* Brand (adjusted for dark) */
--color-brand-primary: #818CF8;       /* Indigo 400 */
--color-brand-primary-hover: #6366F1;
--color-brand-primary-active: #4F46E5;
--color-brand-secondary: #A78BFA;     /* Violet 400 */
--color-brand-accent: #22D3EE;        /* Cyan 400 */

/* Semantic (brighter for dark) */
--color-success: #34D399;
--color-success-bg: #064E3B;
--color-success-text: #A7F3D0;

--color-warning: #FBBF24;
--color-warning-bg: #78350F;
--color-warning-text: #FDE68A;

--color-error: #F87171;
--color-error-bg: #7F1D1D;
--color-error-text: #FECACA;

--color-info: #60A5FA;
--color-info-bg: #1E3A8A;
--color-info-text: #BFDBFE;

/* Borders */
--color-border-primary: #27272A;
--color-border-secondary: #3F3F46;
--color-border-focus: #818CF8;
```

### Typography

```css
/* Font Families */
--font-sans: 'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif;
--font-mono: 'JetBrains Mono', ui-monospace, 'Fira Code', monospace;

/* Font Sizes (Perfect Fourth - 1.333) */
--text-xs: 0.75rem;      /* 12px */
--text-sm: 0.875rem;     /* 14px */
--text-base: 1rem;       /* 16px */
--text-lg: 1.125rem;     /* 18px */
--text-xl: 1.25rem;      /* 20px */
--text-2xl: 1.5rem;      /* 24px */
--text-3xl: 1.875rem;    /* 30px */
--text-4xl: 2.25rem;     /* 36px */
--text-5xl: 3rem;        /* 48px */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;

/* Line Heights */
--leading-tight: 1.25;
--leading-snug: 1.375;
--leading-normal: 1.5;
--leading-relaxed: 1.625;

/* Letter Spacing */
--tracking-tight: -0.025em;
--tracking-normal: 0;
--tracking-wide: 0.025em;
```

### Spacing

```css
/* 4px base unit */
--space-0: 0;
--space-1: 0.25rem;      /* 4px */
--space-2: 0.5rem;       /* 8px */
--space-3: 0.75rem;      /* 12px */
--space-4: 1rem;         /* 16px */
--space-5: 1.25rem;      /* 20px */
--space-6: 1.5rem;       /* 24px */
--space-8: 2rem;         /* 32px */
--space-10: 2.5rem;      /* 40px */
--space-12: 3rem;        /* 48px */
--space-16: 4rem;        /* 64px */
--space-20: 5rem;        /* 80px */
--space-24: 6rem;        /* 96px */
```

### Border Radius

```css
--radius-sm: 0.25rem;    /* 4px */
--radius-md: 0.375rem;   /* 6px - Default */
--radius-lg: 0.5rem;     /* 8px */
--radius-xl: 0.75rem;    /* 12px */
--radius-2xl: 1rem;      /* 16px */
--radius-full: 9999px;
```

### Shadows

```css
/* Light Mode */
--shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);

/* Focus Ring */
--ring-offset: 2px;
--ring-width: 2px;
--ring-color: var(--color-brand-primary);
```

### Motion

```css
/* Durations */
--duration-instant: 50ms;
--duration-fast: 100ms;
--duration-normal: 200ms;
--duration-slow: 300ms;

/* Easings */
--ease-default: cubic-bezier(0.16, 1, 0.3, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
```

---

## Component Library

### Implemented

- [ ] Button
- [ ] Input
- [ ] Badge
- [ ] Card
- [ ] Modal
- [ ] Toast
- [ ] Skeleton
- [ ] ThemeToggle

### Component Specifications

#### Button

| Variant | Background | Text | Hover |
|---------|------------|------|-------|
| primary | `brand-primary` | white | `brand-primary-hover` |
| secondary | `bg-tertiary` | `text-primary` | darken |
| ghost | transparent | `text-secondary` | `bg-tertiary` |
| danger | `error` | white | darken |

**Sizes**: `sm` (32px), `md` (40px), `lg` (48px)

**States**: default, hover, active, focus, disabled, loading

---

#### Badge

| Type | Background | Text |
|------|------------|------|
| DoFollow | `success-bg` | `success-text` |
| NoFollow | `bg-tertiary` | `text-tertiary` |
| DR 80+ | `success-bg` | `success-text` |
| DR 70-79 | `info-bg` | `info-text` |
| DR 60-69 | `warning-bg` | `warning-text` |
| Free | `success-bg` | `success-text` |
| Paid | `warning-bg` | `warning-text` |

---

#### Card (Directory)

- Radius: `--radius-lg` (8px)
- Padding: `--space-5` (20px)
- Border: 1px `border-primary`
- Shadow: `shadow-sm` → `shadow-md` on hover
- Hover: translateY(-2px)

---

## Page Designs

### Home Page
**Status**: Not started
**Key Components**: Hero, FilterBar, DirectoryGrid, FeaturedDirectories
**Notes**: Hero uses gradient from `brand-primary` to `brand-secondary`

### Directory Detail
**Status**: Not started
**Key Components**: BreadcrumbNav, DirectoryHeader, MetricsGrid, ReviewSection
**Notes**: Sticky sidebar for actions on desktop

### Stats Page
**Status**: Not started
**Key Components**: StatsCards, Charts (with dark mode colors)

---

## Dark Mode

**Status**: Phase 1 (infrastructure)

**Approach**:
- CSS custom properties for all colors
- `dark` class on `<html>` element
- Respects `prefers-color-scheme` by default
- Toggle persists to localStorage
- Transition: 200ms on background-color

---

## Motion Design

**Status**: Not started

**Planned Interactions**:
- [ ] Button hover/active states
- [ ] Card hover lift effect
- [ ] Modal enter/exit
- [ ] Toast enter/exit/stack
- [ ] Skeleton shimmer
- [ ] Theme toggle transition
- [ ] Focus ring animation

---

## Performance Patterns

### Loading States
- Skeleton screens for DirectoryListContent
- Skeleton for DirectoryDetailActions
- Spinner in buttons during async operations

### Optimistic Updates
- Favorites toggle
- Rating submission
- Vote count increment

### Caching
- directories.json preloaded
- Theme preference in localStorage
- Favorites cached in component state

---

## Implementation Progress

| Phase | Scope | Status | PR |
|-------|-------|--------|----|
| 1. Foundation | Tokens, Tailwind config, dark mode infra | In Progress | — |
| 2. Components | UI component library | Planned | — |
| 3. Core Pages | Home, Detail, Filters redesign | Planned | — |
| 4. Polish | Dark mode activation, toasts, motion | Planned | — |

---

## Changelog

| Date | Change |
|------|--------|
| 2025-11-30 | Initial design system created. Direction: Linear Clarity. |

---

_This document is the source of truth for UI decisions._
