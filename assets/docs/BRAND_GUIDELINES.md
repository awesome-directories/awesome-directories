# Awesome Directories - Brand Guidelines

**Version:** 1.0
**Last Updated:** 2025-11-09
**Maintainer:** Meysam (@meysam_io)

---

## Table of Contents

1. [Brand Foundation](#brand-foundation)
2. [Logo](#logo)
3. [Color Palette](#color-palette)
4. [Typography](#typography)
5. [Voice & Tone](#voice--tone)
6. [Imagery & Illustrations](#imagery--illustrations)
7. [Do's and Don'ts](#dos-and-donts)
8. [Applications](#applications)

---

## Brand Foundation

### Brand Archetype: "The Regular Guy"

Awesome Directories is built by a founder, for founders. Our brand reflects authenticity, transparency, and peer-to-peer trust.

**Brand Personality:**

- Down-to-earth, transparent, no-BS (think Basecamp/37signals)
- Not corporate or polished - relatable and human
- Founder-to-founder communication
- "I built this because I needed it" energy

### Core Values

1. **Authenticity** - Real numbers, real struggles, building in public
2. **Efficiency** - Respect people's time, solve problems quickly
3. **Community** - Built by indie hackers, for indie hackers
4. **Transparency** - Open source, no hidden agendas, Apache-2.0 license

### Emotional Response (Priority Order)

1. **Speed/Efficiency** - "This saved me 20 hours"
2. **Trust/Reliability** - "This data is accurate and current"
3. **Community/Belonging** - "Made for people like me"

### Target Audience

- **Primary:** Technical founders, indie hackers, bootstrappers
- **Secondary:** SRE engineers transitioning to entrepreneurship
- **Characteristics:** Value time efficiency, distrust marketing fluff, prefer data over hype

---

## Logo

### Primary Logo

The Awesome Directories logo consists of a **folder icon with a star**, representing curated directory organization.

**Symbolism:**

- **Folder:** Directories, organization, structure
- **Star:** Curation, quality, highlighting the best
- **Together:** Finding the best directories, organized and curated

### Logo Files

Located in `/assets/logos/`:

- `logo-full.svg` - Full horizontal wordmark (primary)
- `logo-icon.svg` - Icon only (square, for avatars)
- `logo-white.svg` - White version (on dark backgrounds)
- `logo-black.svg` - Black version (on light backgrounds)
- `logo-blue.svg` - Brand color version (primary blue)

### Logo Usage Rules

#### Minimum Size

- **Full Logo:** Minimum 120px width
- **Icon Only:** Minimum 24px at smallest (16px for favicon only)

#### Clear Space

Maintain clear space equal to the height of the icon around all sides of the logo.

```
[ Clear Space ]
    [ LOGO ]
[ Clear Space ]
```

#### Logo Placement

**Preferred Positions:**

- Top left corner (primary)
- Center (for hero sections, splash screens)
- Bottom right watermark (small, 60% opacity)

### Logo Variations

| Background    | Logo Version            | File                                |
| ------------- | ----------------------- | ----------------------------------- |
| White/Light   | Primary Blue or Black   | `logo-blue.svg` or `logo-black.svg` |
| Dark          | White                   | `logo-white.svg`                    |
| Blue Gradient | White                   | `logo-white.svg`                    |
| Photos        | White with dark overlay | `logo-white.svg`                    |

### What NOT to Do

❌ **Don't:**

- Rotate or skew the logo
- Change the icon color independently from wordmark
- Add drop shadows, outlines, or effects
- Place on busy backgrounds without overlay
- Stretch or distort proportions
- Use gradients on the logo
- Recreate or modify the logo

✅ **Do:**

- Use approved logo files only
- Maintain aspect ratio
- Ensure sufficient contrast
- Use monochrome versions when appropriate

---

## Color Palette

### Primary Colors

| Color             | Hex       | RGB          | Usage                                      |
| ----------------- | --------- | ------------ | ------------------------------------------ |
| **Primary Blue**  | `#3b82f6` | 59, 130, 246 | CTAs, links, primary actions, brand accent |
| **Primary Dark**  | `#2563eb` | 37, 99, 235  | Hover states, gradients                    |
| **Primary Light** | `#60a5fa` | 96, 165, 250 | Backgrounds, tints                         |

**Usage:**

- All primary call-to-action buttons
- Interactive elements (links, buttons)
- Brand accent throughout the site
- Logo primary color

### Semantic Colors

| Color              | Hex       | Use Case                                         | Examples                                             |
| ------------------ | --------- | ------------------------------------------------ | ---------------------------------------------------- |
| **Success Green**  | `#10b981` | Positive states, dofollow badges, high DR (300+) | "Dofollow" badges, DR 300+ ratings, success messages |
| **Warning Orange** | `#f59e0b` | Caution, paid directories, medium DR (60-79)     | "Paid" badges, DR 60-79 ratings                      |
| **Danger Red**     | `#ef4444` | Errors, low DR (<60), destructive actions        | Error messages, DR <60, delete actions               |

### Neutral Grays

| Color        | Hex       | RGB           | Usage                  |
| ------------ | --------- | ------------- | ---------------------- |
| **Gray 900** | `#1f2937` | 31, 41, 55    | Headings, primary text |
| **Gray 700** | `#374151` | 55, 65, 81    | Body text              |
| **Gray 600** | `#6b7280` | 107, 114, 128 | Secondary text, labels |
| **Gray 500** | `#9ca3af` | 156, 163, 175 | Placeholder text       |
| **Gray 400** | `#cbd5e1` | 203, 213, 225 | Borders, dividers      |
| **Gray 200** | `#e2e8f0` | 226, 232, 240 | Subtle backgrounds     |
| **Gray 100** | `#f3f4f6` | 243, 244, 246 | Card backgrounds       |
| **Gray 50**  | `#f8fafc` | 248, 250, 252 | Page background        |

### Background Colors

- **Primary Background:** `#ffffff` (white)
- **Secondary Background:** `#f8fafc` (gray-50)
- **Hover Background:** `#f3f4f6` (gray-100)

### Color Psychology

| Color  | Emotion                   | When to Use                                   |
| ------ | ------------------------- | --------------------------------------------- |
| Blue   | Trust, reliability, calm  | Primary actions, brand identity               |
| Green  | Success, growth, positive | Dofollow badges, high ratings, success states |
| Orange | Attention, warning        | Paid options, medium priority                 |
| Red    | Error, danger, stop       | Errors, low ratings, destructive actions      |

### Accessibility

All color combinations meet **WCAG 2.1 AA** contrast ratios:

- Normal text (16px): Minimum 4.5:1
- Large text (24px+): Minimum 3:1
- UI components: Minimum 3:1

**Tested Combinations:**

- ✅ Primary Blue (#3b82f6) on White: 5.2:1
- ✅ Gray 900 (#1f2937) on White: 15.5:1
- ✅ White on Primary Blue: 5.2:1

---

## Typography

### Font Family

**Primary Font:** Inter
**Fallback Stack:** `Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`

**Why Inter?**

- Clean, modern, highly legible
- Excellent at small sizes
- Free and open source
- Wide language support
- Developer-friendly aesthetic

### Type Scale

| Element   | Size            | Weight          | Line Height | Usage                 |
| --------- | --------------- | --------------- | ----------- | --------------------- |
| **H1**    | 48px (3rem)     | 800 (ExtraBold) | 1.2         | Page titles           |
| **H2**    | 36px (2.25rem)  | 700 (Bold)      | 1.3         | Section headers       |
| **H3**    | 28px (1.75rem)  | 700 (Bold)      | 1.4         | Subsection headers    |
| **H4**    | 20px (1.25rem)  | 600 (SemiBold)  | 1.4         | Card titles           |
| **Body**  | 16px (1rem)     | 400 (Regular)   | 1.6         | Paragraph text        |
| **Small** | 14px (0.875rem) | 400 (Regular)   | 1.5         | Helper text, captions |
| **Tiny**  | 12px (0.75rem)  | 500 (Medium)    | 1.4         | Labels, badges        |

### Font Weights

- **400 (Regular):** Body text, descriptions
- **500 (Medium):** Emphasized text, labels
- **600 (SemiBold):** Subheadings, button text
- **700 (Bold):** Headings, strong emphasis
- **800 (ExtraBold):** Hero headings, major titles

### Monospace Font

**Font:** `ui-monospace, 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Courier New, monospace`

**Usage:**

- Domain Rating scores (DR 92)
- Code snippets
- Technical data
- URLs

---

## Voice & Tone

### Brand Voice

**Core Principle:** Founder-to-founder, peer-to-peer communication

**Voice Characteristics:**

- **Conversational:** Write like you're talking to a friend
- **Transparent:** Share real numbers, struggles, lessons
- **Helpful:** Focus on solving their problem
- **Casual but professional:** Not stuffy, not juvenile
- **No BS:** Direct, honest, no marketing fluff

### Tone Guidelines

| Situation               | Tone                          | Example                                                                   |
| ----------------------- | ----------------------------- | ------------------------------------------------------------------------- |
| **Homepage Hero**       | Confident, helpful            | "Find the top 20 directories in under 3 minutes"                          |
| **Feature Description** | Clear, benefit-focused        | "Filter by Domain Rating (60-300+) to find high-authority directories"    |
| **Error Messages**      | Empathetic, solution-oriented | "No results found. Try adjusting your filters or browse all directories." |
| **Success Messages**    | Encouraging, positive         | "Checklist downloaded! Good luck with your launch 🚀"                     |
| **About/Story**         | Authentic, vulnerable         | "I wasted 20 hours on this, so you don't have to."                        |

### Writing Examples

#### ✅ Good (On Brand)

- "I wasted 20 hours scrolling through dead links from 2012"
- "Stop wasting time on directories that don't matter"
- "142 founders found this helpful"
- "Free forever. No upsells. Open source."
- "Built by an indie hacker, for indie hackers"

#### ❌ Bad (Off Brand)

- "Our revolutionary platform leverages cutting-edge technology"
- "Maximize your synergistic launch outcomes"
- "Premium enterprise solutions for discerning professionals"
- "Join thousands of satisfied customers"
- "Unlock your potential with our proven system"

### Key Messages

**Tagline:** "Find the top 20 directories in under 3 minutes"

**Supporting Messages:**

- "300+ curated launch directories for indie hackers"
- "Stop wasting time on dead links from 2012"
- "Free & open source, forever"
- "Built in public by @meysam_io"

### Emoji Usage

**Sparingly and purposefully:**

- ✅ Use in success messages, celebration moments
- ✅ Use to add personality to social media
- ❌ Don't use in error messages or serious communication
- ❌ Don't overuse (max 1-2 per message)

**Approved Emojis:**

- 🚀 (launch, success)
- ✓ (checkmark, confirmation)
- 👍 (helpful votes)
- 💡 (tips, ideas)
- ⚡ (speed, efficiency)

---

## Imagery & Illustrations

### Illustration Style

**Style:** Minimal, clean, 2-3 colors maximum

**Characteristics:**

- Simple geometric shapes
- Flat design (no gradients in illustrations)
- Limited color palette (primary blue + 1-2 accent colors)
- Functional, not decorative
- Scalable and performant (SVG)

### When to Use Illustrations

✅ **Use for:**

- Empty states (no results, no favorites)
- Hero sections (feature highlights)
- Onboarding flows
- 404/error pages

❌ **Avoid:**

- Generic stock photos
- Abstract meaningless shapes
- Overly complex illustrations
- Illustrations that slow page load

### Photography

**Preferred:** None (minimalist approach)

**If needed:**

- Real founder photos (not stock)
- Screenshots of actual product
- User-submitted content (with permission)

**Never:**

- Generic stock photos of people in suits
- Fake "diverse team" stock photos
- Overused tech stock imagery

---

## Do's and Don'ts

### Visual Design

#### ✅ Do

- Use plenty of white space
- Keep designs clean and scannable
- Show data prominently (DR scores, badges)
- Use consistent spacing (8px base unit)
- Test all designs at mobile sizes
- Ensure WCAG AA accessibility

#### ❌ Don't

- Clutter interfaces with too many elements
- Use trendy effects that age poorly
- Hide important information
- Rely on color alone to convey meaning
- Design only for desktop

### Content & Copy

#### ✅ Do

- Write in active voice
- Use short sentences and paragraphs
- Lead with benefits, not features
- Include real data and numbers
- Share lessons learned openly

#### ❌ Don't

- Use jargon or buzzwords
- Make unsubstantiated claims
- Write walls of text
- Hide behind corporate speak
- Exaggerate or mislead

---

## Applications

### Website

**Header:**

- Logo in top left
- Primary navigation (minimal)
- CTA button in primary blue

**Hero Section:**

- Large, bold headline
- Clear value proposition
- Primary CTA above the fold
- Optional hero illustration

**Directory Cards:**

- Prominent DR badge (colored by tier)
- Dofollow badge (green when applicable)
- Clear pricing indicator
- Helpful vote count

### Social Media

**Profile Picture:**

- Use `logo-icon.svg` (square)
- Export at 400x400px minimum
- Works in both light and dark themes

**Cover/Header Images:**

- Feature key value props
- Include domain name
- Maintain brand colors
- Keep text readable at small sizes

### Email

**Newsletter:**

- Simple, text-focused layout
- Minimal branding (logo at top)
- Clear hierarchy
- Single primary CTA per email

**Signature:**

- Name + role
- Link to awesome-directories.com
- Optional: Twitter handle
- No heavy images

### Presentations

**Slides:**

- Minimal text (6 words per line max)
- Large, bold headlines
- One key point per slide
- Use brand colors sparingly

---

## Brand Guidelines Summary

**Remember:**

1. **Be Authentic** - Write like a real person
2. **Be Helpful** - Solve problems, save time
3. **Be Clear** - No jargon, no fluff
4. **Be Consistent** - Use approved assets and colors
5. **Be Accessible** - Design for everyone

**When in doubt:** Ask yourself, "Would I say this to a fellow founder over coffee?"

---

## Questions or Feedback?

- **GitHub:** [github.com/awesome-directories/awesome-directories](https://github.com/awesome-directories/awesome-directories)
- **Twitter:** [@meysam_io](https://x.com/meysamazing)
- **Email:** [Your email]

---

**License:** This brand guideline is part of Awesome Directories, licensed under Apache-2.0. You're free to use and adapt for your own projects.
