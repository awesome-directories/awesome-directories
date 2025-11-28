# Awesome Directories Product Roadmap

> **Last Updated**: 2025-11-28
> **Version**: 2.0.0
> **Status**: Active Development

A strategic product roadmap for Awesome Directories—the curated directory aggregator helping indie hackers, bootstrappers, and solopreneurs discover high-quality launch directories for their SaaS products.

---

## Table of Contents

- [Executive Summary](#executive-summary)
- [Core Value Proposition](#core-value-proposition)
- [Ideal Customer Profiles](#ideal-customer-profiles)
- [Current State](#current-state)
- [Competitive Positioning](#competitive-positioning)
- [Phased Roadmap](#phased-roadmap)
- [Detailed Feature Analysis](#detailed-feature-analysis)
- [Anti-Roadmap: What We Won't Build](#anti-roadmap-what-we-wont-build)
- [Contributing](#contributing)
- [Changelog](#changelog)

---

## Executive Summary

**Current State:**
- 300+ curated directories with advanced filtering (DR, category, pricing, dofollow)
- Full authentication system with Google/GitHub OAuth
- Project-based submission tracking with comprehensive CRUD operations
- Complete email notification system (5 Edge Functions via Resend)
- Blog system with Astro Content Collections, tags, search, and RSS
- Web scraper for automated directory curation
- Statistics dashboard with interactive Chart.js visualizations

**Core Strategic Direction:**
1. **Complete partially-implemented features** (Reviews UI, Email Preferences page, Weekly Digest)
2. **Add high-impact differentiators** (Keyboard navigation, Dark mode, Command palette)
3. **Build launch workflow tools** (Submission templates, Response time tracking)
4. **Enable community-driven growth** (Launch stories, Directory comparison)

**Key Principles:**
- Depth over breadth—perfect the core experience before expanding
- Every feature must directly serve indie hacker launch workflows
- Leverage partially-implemented backend work for maximum ROI

---

## Core Value Proposition

> **Find the top 20 launch directories worth your time in under 3 minutes—curated, verified, and updated weekly.**

Awesome Directories exists to solve the chaos of SaaS product launches. While hundreds of "submit your startup" directories exist, most are outdated, low-quality, or time-wasters. We curate only the directories that actually matter, with real SEO metrics (Domain Rating via Ahrefs), accurate categorization, and honest assessments of value.

**The Job We Do:**
- **Save time**: Replace hours of manual research with instant, filtered access
- **Reduce risk**: Verified metrics prevent wasted submissions to dead/scam directories
- **Enable strategy**: Categorization and filtering enable phased launch planning
- **Track progress**: Project-based submission tracking keeps launches organized

---

## Ideal Customer Profiles

### ICP 1: The First-Time Launcher

**Who they are**: Solo developer or indie hacker launching their first SaaS product. Non-technical in marketing. Has 2-4 hours per week for launch activities.

**Their context**: Built a product, has no audience, heard "submit to directories" is a free way to get early traction and backlinks. Overwhelmed by the number of options.

**Jobs to be Done (JTBD):**
1. Find the 10-20 best directories to submit to first (primary)
2. Understand which directories are worth paying for
3. Track what they've submitted and the outcomes

**Pain points with alternatives:**
- Generic "submit your startup" lists are overwhelming and outdated
- No way to know which directories actually provide value (DR, dofollow)
- Spreadsheet tracking becomes chaotic after 10+ submissions

**What "exceptional" looks like for them:**
- "I found 15 perfect directories for my niche in 10 minutes"
- "I know exactly what I submitted, when, and the status of each"
- "I got my first organic traffic within 2 weeks of following the filtered list"

---

### ICP 2: The Serial Launcher

**Who they are**: Experienced indie hacker or small team with 2-5 products. Has launched before and knows the process. Technical, values efficiency.

**Their context**: Launching multiple products per year. Needs to systematize and streamline the directory submission process. Time-constrained.

**Jobs to be Done (JTBD):**
1. Quickly filter directories by their specific criteria (DR > 60, dofollow, free)
2. Manage multiple projects with separate submission tracking
3. Export and integrate with existing workflows (CSV, Notion, etc.)

**Pain points with alternatives:**
- Rebuilding submission lists from scratch for each product
- No project-level organization for multi-product portfolios
- Manual tracking breaks down at scale

**What "exceptional" looks like for them:**
- "I have a repeatable checklist I can execute for every launch"
- "Keyboard shortcuts let me navigate and select directories in seconds"
- "My team can see submission progress without syncing spreadsheets"

---

### ICP 3: The SEO-Focused Founder

**Who they are**: Founder who understands SEO value of directory backlinks. Wants strategic, high-DR dofollow links. May be bootstrapped or have small marketing budget.

**Their context**: Building domain authority systematically. Treats directory submissions as part of link-building strategy. Measures ROI.

**Jobs to be Done (JTBD):**
1. Find high-DR dofollow directories (the primary filter)
2. Understand approval rates and response times before investing effort
3. Track which directories actually delivered value (traffic, rankings)

**Pain points with alternatives:**
- Most lists don't have reliable DR data or it's outdated
- No data on actual approval rates or typical response times
- Paid directories don't disclose whether they're worth the cost

**What "exceptional" looks like for them:**
- "I can filter to DR 70+ dofollow directories in one click"
- "Community data tells me which directories actually respond"
- "I know my backlink portfolio improved because I tracked everything"

---

### ICP 4: The Content Marketer / VA

**Who they are**: Marketing hire or virtual assistant tasked with directory submissions. May be doing this for multiple clients. Needs clear workflows.

**Their context**: Needs to execute efficiently on someone else's behalf. Values checklists, export functionality, and clear status tracking.

**Jobs to be Done (JTBD):**
1. Generate ready-to-use submission checklists for clients
2. Track and report on submission progress systematically
3. Copy/paste optimized submission content quickly

**Pain points with alternatives:**
- Creating custom tracking systems for each client
- Manually researching directory requirements
- Inconsistent submission quality across directories

**What "exceptional" looks like for them:**
- "I export a PDF checklist and work through it systematically"
- "The submission templates save me hours of writing"
- "My client sees a clear dashboard of where their product is listed"

---

## Current State

### Fully Implemented

| Feature | Description | Status |
|---------|-------------|--------|
| Directory Catalog | 300+ curated directories with comprehensive metadata | Complete |
| Advanced Filtering | Filter by DR, category, pricing type, dofollow status | Complete |
| Real-time Search | Instant search across names, descriptions, categories | Complete |
| Multi-Select Export | Select directories and export as PDF or CSV checklist | Complete |
| Community Voting | IP-based "helpful" voting system | Complete |
| OAuth Authentication | Google & GitHub OAuth via Supabase | Complete |
| Favorites System | Save directories to personal collection | Complete |
| Project Management | Create projects, track submissions per project | Complete |
| Directory Submission | User-submitted directories with admin review workflow | Complete |
| Email Notifications | Approval, rejection, welcome, confirmation, admin alerts | Complete |
| Email Preferences | Opt-out preferences for email categories | Complete |
| Email Logging | Full audit trail of all sent emails | Complete |
| Statistics Dashboard | Interactive charts (category, pricing, DR distribution) | Complete |
| Blog System | Astro Content Collections with tags, pagination, search | Complete |
| RSS Feed | Blog RSS feed for subscribers | Complete |
| Web Scraper | Automated directory analysis and curation tool | Complete |
| SEO Metrics Updates | Automated Ahrefs DR updates via Edge Functions | Complete |
| Directory Detail Pages | Individual pages with SEO metadata and related directories | Complete |

### Partially Implemented (High-ROI Opportunities)

| Feature | What Exists | What's Missing | Priority |
|---------|-------------|----------------|----------|
| Reviews & Ratings | Database schema, triggers, aggregation logic | UI for submitting reviews on directory detail pages | **P0** |
| Email Preferences Page | Database tables, RLS policies, helper functions | User settings page to manage email preferences | **P1** |
| Weekly Digest Email | email_preferences.weekly_digest column | Edge Function to generate and send digests | **P2** |
| Review Notifications | email_preferences.review_notifications column | Edge Function to notify when directories are reviewed | **P2** |
| Directory Reviews View | `directory_reviews_with_user` database view | Display reviews on directory detail pages | **P0** |

### Not Yet Implemented

| Category | Features |
|----------|----------|
| Power User | Keyboard navigation (Vim mode), Command palette (Cmd+K), Dark mode |
| Launch Workflow | Submission templates, AI copy generator, Launch calendar/planner |
| Community Data | Response time tracker, Approval rate data, Launch stories |
| Comparison | Side-by-side directory comparison tool |
| Engagement | Achievement badges, Leaderboards, Weekly progress reports |
| Integration | Browser extension, Notion/Sheets sync, Webhooks/Zapier |
| Monetization | Premium tier, Featured directory listings, Launch course |
| UX Polish | Toast notifications, Micro-animations, PWA support, OG image generator |

---

## Competitive Positioning

### Current Landscape

| Alternative | Strengths | Weaknesses | Our Advantage |
|-------------|-----------|------------|---------------|
| **BetaPage** | Active community, launch scheduling | Outdated listings, no filtering | Curated quality + advanced filters |
| **SaaSHub** | Large database, comparison features | Focus on established products | Launch-specific + DR metrics |
| **Product Hunt** | Massive reach, social proof | One-day-only launches, high competition | Ongoing directory value |
| **Static GitHub Lists** | Open source, community maintained | No filtering, no tracking, often stale | Dynamic + personalized + verified |
| **Paid "Submit to 100 Directories"** | Done-for-you convenience | No transparency, often scam directories | Transparent metrics + self-serve |

### Our Moat

1. **Curated Quality**: Every directory is manually verified with real DR scores from Ahrefs
2. **Indie Hacker Focus**: Built by and for the bootstrapped SaaS community
3. **Project-Based Tracking**: Unique multi-project submission management
4. **Open Source**: Community contributions keep the data fresh (Apache 2.0)
5. **SEO Authority**: Static site with strong Lighthouse scores (95+)

### Positioning Statement

> For indie hackers and solopreneurs who need to launch their SaaS products, **Awesome Directories** is the curated directory aggregator that saves hours of research with verified SEO metrics and project-based tracking, unlike generic startup lists which are outdated and lack actionable filtering.

---

## Phased Roadmap

### Phase 1: Complete the Core (1-2 Weeks)

**Outcome**: All partially-implemented features are shipped, creating a complete v1.0 experience.

**Target ICPs**: All (foundation work)

| Priority | Feature | Score | Effort | Status | Notes |
|----------|---------|-------|--------|--------|-------|
| P0 | Reviews UI on Directory Pages | 9.5 | S | Partial | Schema + triggers exist, need frontend |
| P0 | Display Reviews with Ratings | 9.2 | S | Partial | View exists, need to query and render |
| P1 | Email Preferences Settings Page | 8.8 | S | Partial | DB exists, need settings UI |
| P1 | Toast Notification System | 8.5 | XS | Planned | Replace browser alerts |
| P2 | Weekly Digest Edge Function | 7.5 | M | Partial | Preference exists, need function |

**Key Metrics:**
- Users can rate and review directories
- Users can manage email preferences
- All user actions have polished feedback

---

### Phase 2: Power User Differentiators (2-4 Weeks)

**Outcome**: Awesome Directories becomes the fastest, most efficient way to browse and select directories—a tool that delights technical founders.

**Target ICPs**: Serial Launcher, SEO-Focused Founder

| Priority | Feature | Score | Effort | Status | Notes |
|----------|---------|-------|--------|--------|-------|
| P0 | Keyboard Navigation (Vim Mode) | 9.8 | M | Planned | `j/k` navigate, `f` favorite, `o` open |
| P0 | Dark Mode | 9.5 | M | Planned | System preference + manual toggle |
| P1 | Command Palette (Cmd+K) | 9.0 | M | Planned | Fuzzy search across directories + actions |
| P1 | Directory Comparison Tool | 8.5 | S | Planned | Side-by-side 2-4 directories |
| P2 | Theme Toggle (Terminal/Hacker) | 7.0 | S | Planned | Identity signal for tech audience |

**Key Metrics:**
- Power users can browse without touching the mouse
- Technical founders share keyboard shortcuts on Twitter/HN
- 90%+ of sessions have dark mode or keyboard usage

---

### Phase 3: Launch Workflow Excellence (3-6 Weeks)

**Outcome**: Awesome Directories doesn't just list directories—it helps you execute a strategic launch with templates, timing data, and progress tracking.

**Target ICPs**: First-Time Launcher, Content Marketer

| Priority | Feature | Score | Effort | Status | Notes |
|----------|---------|-------|--------|--------|-------|
| P0 | Submission Templates Library | 9.5 | M | Planned | 50/100/250-word descriptions, taglines |
| P0 | Response Time Tracker (Crowdsourced) | 9.2 | M | Planned | User-submitted response data |
| P1 | AI Submission Generator | 9.0 | M | Planned | GPT-powered copy for top 10 directories |
| P1 | Personal Launch Dashboard | 8.8 | M | Planned | Visual progress bar, ROI calculator |
| P2 | Launch Calendar View | 8.0 | L | Planned | Timeline for planning submissions |
| P2 | Smart Launch Path / Wizard | 7.5 | M | Planned | Week-by-week guided workflow |

**Key Metrics:**
- 50%+ of users use at least one template
- Crowdsourced response time data for 50+ directories
- AI generator produces usable copy in 80%+ of cases

---

### Phase 4: Community & Content Flywheel (2-3 Months)

**Outcome**: User-generated content creates a self-sustaining growth engine with SEO value and social proof.

**Target ICPs**: All (network effects)

| Priority | Feature | Score | Effort | Status | Notes |
|----------|---------|-------|--------|--------|-------|
| P0 | Launch Stories / Case Studies | 9.5 | M | Planned | User-submitted launch narratives |
| P1 | Achievement System / Badges | 8.5 | M | Planned | Gamification for engagement |
| P1 | Weekly Progress Report Email | 8.2 | S | Planned | Automated stats and suggestions |
| P2 | Leaderboards | 7.0 | S | Planned | Top submitters, most helpful reviews |
| P2 | Find a Launch Buddy | 7.0 | M | Planned | Match with founders launching same time |

**Key Metrics:**
- 50+ user-submitted launch stories
- 30%+ of authenticated users have at least one badge
- Organic traffic increases 50%+ from long-tail content

---

### Phase 5: Integrations & Automation (3+ Months)

**Outcome**: Awesome Directories fits seamlessly into existing workflows with exports, extensions, and automation.

**Target ICPs**: Serial Launcher, Content Marketer

| Priority | Feature | Score | Effort | Status | Notes |
|----------|---------|-------|--------|--------|-------|
| P1 | Email Drip Campaign (Post-Signup) | 8.5 | M | Planned | Onboarding sequence with tips |
| P1 | Google Sheets / Notion Integration | 8.0 | M | Planned | One-click export to templates |
| P2 | Browser Extension | 7.5 | L | Planned | "Is this a directory?" detection |
| P2 | Webhooks / Zapier Integration | 7.0 | M | Planned | Automation triggers |
| P3 | PWA Support | 6.5 | M | Planned | Offline access, push notifications |

---

### Phase 6: Sustainability (Future)

**Outcome**: Revenue model enables long-term maintenance and continued development.

**Target ICPs**: All (sustainability)

| Priority | Feature | Score | Effort | Status | Notes |
|----------|---------|-------|--------|--------|-------|
| P2 | Premium Features Tier ($9/mo) | 8.0 | M | Future | Unlimited projects, AI, priority support |
| P2 | Featured Directory Listings | 7.0 | S | Future | Directories pay for visibility |
| P3 | Launch Course (Gumroad) | 6.5 | L | Future | Productized knowledge |

---

## Detailed Feature Analysis

### Tier 1: Critical (Phase 1)

---

#### Reviews UI on Directory Detail Pages

**Score**: 9.5/10

**Why it matters**: The database schema, triggers, and aggregation logic for reviews all exist. Users expect to see and submit reviews when viewing a directory. This is the highest-ROI feature—minimal frontend work unlocks significant value.

| Pros | Cons |
|------|------|
| Backend 100% complete | Need to design review form UX |
| Auto-updates average_rating | Moderation considerations |
| Builds social proof | Could show empty states initially |
| High perceived value |  |

**Current State**:
- `directory_reviews` and `directory_ratings` tables exist
- Triggers auto-update `average_rating`, `rating_count`, `review_count` on `directories`
- `directory_reviews_with_user` view joins reviews with user info
- RLS policies allow public read, authenticated write

**Implementation Approach**:
1. Add review submission form to `src/pages/directory/[slug].astro`
2. Create `ReviewForm.vue` component with star rating + comment textarea
3. Display existing reviews using the `directory_reviews_with_user` view
4. Add optimistic updates with rollback on error

**Success Criteria**:
- Users can submit 1-5 star ratings with optional comments
- Reviews display with user avatar, name, and timestamp
- Directory cards show aggregate rating (X.X stars, Y reviews)

---

#### Toast Notification System

**Score**: 8.5/10

**Why it matters**: Current browser `alert()` calls feel dated. A toast system elevates perceived quality across all user actions.

| Pros | Cons |
|------|------|
| Improves all existing features | None significant |
| Low effort, high polish |  |
| Undo support for destructive actions |  |
| Expected by technical audience |  |

**Current State**: Browser alerts used for errors and confirmations.

**Implementation Approach**:
1. Add lightweight toast library or build custom with Vue Teleport
2. Create `useToast()` composable with `success()`, `error()`, `info()` methods
3. Replace all `alert()` calls in existing components
4. Add undo support for favorites, submission tracking removal

**Success Criteria**:
- All user feedback uses styled toast notifications
- Destructive actions have "Undo" button in toast
- Toasts auto-dismiss after 3-5 seconds

---

### Tier 2: High Value (Phase 2)

---

#### Keyboard Navigation (Vim Mode)

**Score**: 9.8/10

**Why it matters**: No other directory site has this. Instant viral appeal on HackerNews/Twitter. Perfect for the technical ICP.

| Pros | Cons |
|------|------|
| Unique differentiator | Needs careful keyboard conflict handling |
| High shareability | Mobile users won't use it |
| Zero ongoing maintenance | Requires good visual feedback |
| Low cost, high delight |  |

**Current State**: Not implemented.

**Implementation Approach**:
1. Create `useKeyboardNavigation()` composable
2. Track focused directory index in state
3. Implement key handlers: `j/k` (up/down), `f` (favorite), `o` (open URL), `enter` (detail page), `?` (show shortcuts)
4. Add visual focus ring to DirectoryCard on keyboard focus
5. Konami code Easter egg: unlock "Ultra Mode" theme

**Success Criteria**:
- User can navigate, favorite, and open directories without mouse
- `?` key shows all available shortcuts in modal
- Focus state is clearly visible

---

#### Dark Mode

**Score**: 9.5/10

**Why it matters**: Expected by developer audience. High polish perception. Shows you care about UX.

| Pros | Cons |
|------|------|
| Expected by devs | Tailwind v4 requires different approach |
| System preference detection | Need to verify all components |
| High perceived quality |  |

**Current State**: Not implemented. Using Tailwind v4.

**Implementation Approach**:
1. Add `dark:` variants to Tailwind config
2. Create `useTheme()` composable with localStorage persistence
3. Detect system preference with `prefers-color-scheme`
4. Add toggle in header with `d` keyboard shortcut
5. Smooth transition animation between themes

**Success Criteria**:
- Dark mode respects system preference by default
- Toggle persists across sessions
- All components render correctly in both modes

---

#### Command Palette (Cmd+K)

**Score**: 9.0/10

**Why it matters**: Modern productivity tool UX (Notion, Linear, Raycast). Fast access to everything.

| Pros | Cons |
|------|------|
| Powerful navigation | Moderate complexity |
| Fuzzy search is delightful | Need to index all searchable content |
| Context-aware actions |  |

**Current State**: Not implemented.

**Implementation Approach**:
1. Create `CommandPalette.vue` component with modal overlay
2. Use lightweight fuzzy search library (fuse.js)
3. Index: directories, blog posts, pages, actions
4. Actions: "Go to favorites", "Submit directory", "Toggle dark mode", "Export CSV"
5. Show recent searches and visited directories

**Success Criteria**:
- `Cmd+K` / `Ctrl+K` opens palette from anywhere
- Fuzzy search returns relevant results in <50ms
- Actions execute immediately on selection

---

### Tier 3: Strategic (Phase 3)

---

#### Submission Templates Library

**Score**: 9.5/10

**Why it matters**: Solves the #1 pain point—writing submissions is tedious. Saves hours of work. High perceived value.

| Pros | Cons |
|------|------|
| Solves real pain point | Need to create quality templates |
| Increases conversion | Some templates may become stale |
| Differentiator |  |
| Low ongoing cost |  |

**Current State**: Not implemented.

**Implementation Approach**:
1. Create templates JSON with multiple lengths (50/100/250 words)
2. Add "My Launch Profile" feature to store product details
3. Generate personalized templates from profile data
4. One-click copy with toast confirmation
5. Track which templates are most used

**Success Criteria**:
- Users can generate customized descriptions for any length
- Templates cover SaaS, AI tools, dev tools, etc.
- Copy-to-clipboard works seamlessly

---

#### Response Time Tracker (Crowdsourced)

**Score**: 9.2/10

**Why it matters**: Unique data no one else has. High value for planning. Encourages community participation. Builds moat.

| Pros | Cons |
|------|------|
| Unique differentiator | Needs critical mass of data |
| High value for users | Data quality depends on user honesty |
| Community engagement |  |
| Defensible data moat |  |

**Current State**:
- `project_submissions` table has `submitted_at` and `status` fields
- Could calculate response time from submitted → approved/rejected

**Implementation Approach**:
1. Add "Date Heard Back" field to project submissions
2. Calculate response time: `heard_back_at - submitted_at`
3. Aggregate per directory: avg response time, approval rate
4. Display on directory cards and detail pages
5. Anonymize all user-specific data in aggregations

**Success Criteria**:
- Show avg response time and approval rate for 50+ directories
- Data updates as users track their submissions
- Clear "Based on X submissions" disclosure

---

### Tier 4: Future Consideration

---

#### AI Submission Generator

**Score**: 9.0/10

**Why it matters**: GPT-powered copy generation could be a premium feature differentiator.

| Pros | Cons |
|------|------|
| Very high perceived value | API costs |
| Natural premium upsell | Quality varies by product type |
| Time savings are massive | Potential rate limiting |

**Current State**: Not implemented.

**Implementation Approach**:
1. Create Edge Function with OpenAI API integration
2. Input: product name, URL, one-sentence description
3. Output: 3 versions for different lengths
4. Rate limit free tier (3/month), unlimited for premium
5. Allow user editing before copy

**Success Criteria**:
- Generated copy is usable 80%+ of the time
- Users can regenerate if first attempt isn't right
- Clear value prop for premium upgrade

---

#### Launch Calendar View

**Score**: 8.0/10

**Why it matters**: Visual timeline helps with launch planning. Increases engagement as users return to check.

| Pros | Cons |
|------|------|
| Solves real planning pain | Complex UX to get right |
| Increases retention | Calendar libraries are heavy |
| Natural premium feature |  |

**Current State**: Not implemented.

**Implementation Approach**:
1. Integrate lightweight calendar library
2. Display submissions as events on timeline
3. Add suggested submission dates based on directory response times
4. Export to Google Calendar / iCal
5. Browser notification reminders (with permission)

**Success Criteria**:
- Users can visualize their launch timeline
- Suggested dates are actionable
- Calendar export works seamlessly

---

## Anti-Roadmap: What We Won't Build

Explicitly defining what we **won't** build protects focus and prevents scope creep.

### 1. Full CRM / Sales Pipeline
**Why not**: We track directory submissions, not customer relationships. This would dilute focus and compete with established tools (HubSpot, Pipedrive).

### 2. Directory Submission Automation
**Why not**: Auto-submitting to directories violates most directories' ToS and provides poor quality submissions. We help you track, not spam.

### 3. General Project Management
**Why not**: We're not Notion or Trello. Projects exist solely to organize directory submissions per product. No Kanban boards, no task dependencies.

### 4. Social Media Scheduling
**Why not**: Many good tools exist (Buffer, Hootsuite). Our focus is directory launches, not social media management.

### 5. Landing Page Builder
**Why not**: This would be a separate product entirely. We assume users have a product page to submit.

### 6. Paid Directory Submission Service
**Why not**: "Submit to 100 directories for $99" services are often scammy. We provide the data; users make informed decisions themselves.

### 7. Mobile App (Native)
**Why not**: PWA covers mobile use cases sufficiently. Native app development would consume resources without proportional value for our ICP.

### 8. Real-time Collaboration
**Why not**: Directory submissions are individual tasks. Real-time multiplayer editing adds complexity without clear value.

### 9. Multi-language / i18n
**Why not**: Our ICP is English-speaking indie hackers. Translation would dilute quality and require ongoing maintenance. May revisit if international demand is proven.

### 10. Affiliate Commission Tracking
**Why not**: While some directories offer affiliate programs, tracking commissions would add complexity and potential conflicts of interest in our curation.

---

## Contributing

Want to help implement features from this roadmap?

### How to Pick a Feature

1. **Check Current State**: Look at "Partially Implemented" features first—they have the highest ROI
2. **Read the Analysis**: Each feature has implementation notes and success criteria
3. **Start with Issues**: Open a GitHub issue to discuss approach before coding
4. **Small PRs**: Break large features into reviewable chunks

### Feature Priority Guidelines

| Priority | Meaning | Who Can Pick Up |
|----------|---------|-----------------|
| P0 | Blocks phase outcome, must ship | Maintainers primarily |
| P1 | Significantly enhances phase | Contributors welcome |
| P2 | Nice-to-have, could slip | Contributors welcome |
| P3 | Opportunistic, include if trivial | Anyone |

### Development Setup

```bash
git clone https://github.com/awesome-directories/awesome-directories.git
cd awesome-directories
bun install
cp .env.example .env
# Add your Supabase credentials to .env
bun start
```

### Contribution Guidelines

- Follow existing code patterns (Vue Composition API, Tailwind CSS)
- Add TypeScript types where applicable
- Test locally before submitting PR
- Update CLAUDE.md if adding new features/patterns

---

## Changelog

### Version 2.0.0 (2025-11-28)
- Complete restructure following strategic roadmap methodology
- Added systematic feature scoring and prioritization
- Identified partially-implemented features as high-ROI opportunities
- Added Anti-Roadmap section to define scope boundaries
- Aligned with current Astro.js SSG architecture
- Added detailed ICPs with JTBD analysis

### Version 1.0.0 (2025-11-27)
- Initial 45+ feature ideas across 8 categories
- Basic Impact vs Effort prioritization
- Focus on "outside the box" indie hacker appeal

---

**Made with care by indie hackers, for indie hackers.**
