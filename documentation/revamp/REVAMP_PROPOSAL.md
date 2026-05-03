# Solitude — UI & Functionality Revamp Proposal

> Date: May 3, 2026  
> Status: Decisions locked — ready for implementation

---

## Overview

The goal of this revamp is to make Solitude feel like a **quiet, intentional tool** — not another feature-heavy app fighting for your attention. Every change below serves one principle: **the interface should disappear while you work**.

The stack remains the same (Expo, NativeWind, Reanimated, Zustand). This is a UI/UX and feature-trim revamp, not an architectural rewrite.

---

## 1. Design Direction: "Quiet Focus"

### Problem

The current UI is busy. Gradients, shadow-heavy cards, multiple modal triggers, and dense information all compete for attention on every screen. A productivity app should do the opposite — calm the eye, focus the mind.

### Proposed Direction

**Dark-first design** with a warm light mode alternative. Think quality notebook over digital dashboard.

---

## 2. Color & Theme System

### Current Issues

- Primary blue `#337EC9` feels generic and cold
- Gradient backgrounds on cards add visual noise
- Light mode uses cold whites — clinical feel

### Proposed Palette

#### Dark Mode (Primary)

| Token            | Value                 | Usage                                          |
| ---------------- | --------------------- | ---------------------------------------------- |
| `background`     | `#0D0D0D` / `#111318` | App background (not pure black)                |
| `surface`        | `#1A1A1F`             | Cards, modals, elevated surfaces               |
| `surface-muted`  | `#22222A`             | Secondary surfaces                             |
| `text-primary`   | `#F5F1EB`             | Warm off-white — main text                     |
| `text-secondary` | `#8A8A96`             | Labels, captions, muted info                   |
| `accent`         | `#E8A43A`             | Single warm amber accent — used sparingly      |
| `accent-alt`     | `#FF7A5C`             | Alternative: soft coral (choose one, not both) |
| `border`         | `#2A2A35`             | Subtle dividers                                |
| `destructive`    | `#E05A5A`             | Delete, cancel, error states                   |

#### Light Mode (Secondary)

| Token            | Value     | Usage                                 |
| ---------------- | --------- | ------------------------------------- |
| `background`     | `#FAF8F5` | Warm cream — not clinical white       |
| `surface`        | `#FFFFFF` | Cards                                 |
| `surface-muted`  | `#F2F0ED` | Secondary surfaces                    |
| `text-primary`   | `#1A1A1F` | Near-black                            |
| `text-secondary` | `#7A7A86` | Muted labels                          |
| `accent`         | `#E8A43A` | Same accent — consistent across modes |
| `border`         | `#E5E3E0` | Warm dividers                         |

### Rules

- **No gradient backgrounds on cards** — flat surfaces with subtle opacity/elevation only
- **One accent color**, used for: active states, progress indicators, the single CTA button per screen
- Session types can have their own subtle tint (deep blue-black for Deep Focus, warm amber for breaks) but only applied as screen-level background shifts during active sessions

---

## 3. Typography

### Current Issues

- Sora is used but inconsistently — sizes feel cramped and labels are small
- The timer (most important element) doesn't dominate visually

### Proposed Scale (keep Sora)

| Role         | Size    | Weight      | Usage                      |
| ------------ | ------- | ----------- | -------------------------- |
| Timer / Hero | 80–96px | Light (300) | Focus screen countdown     |
| Display      | 32–40px | Semi-bold   | Screen titles, big stats   |
| Heading      | 22–26px | Semi-bold   | Section headers            |
| Body         | 15px    | Regular     | Main content, task names   |
| Label        | 13px    | Medium      | Tags, captions, metadata   |
| Caption      | 11px    | Regular     | Timestamps, secondary info |

### Rules

- **The timer should be the only thing the eye lands on** on the Focus screen
- Generous line height (1.5–1.6×) for body text
- Avoid ALL CAPS labels — use sentence case throughout
- Letter spacing on display sizes: `+0.5px` for breathing room

---

## 4. Navigation

### Current Issues

- Standard 5-tab bottom bar with icons + text labels takes up fixed space
- Feels heavy and utilitarian

### Proposed: Floating Pill Tab Bar

- A **frosted glass / blur pill** floating above content, centered at the bottom
- **Does not own a fixed layout slot** — content scrolls behind it with padding compensation
- 4–5 icon-only tabs; the **active tab** expands with a spring animation to show the label
- The pill has a subtle dark blur background — it sits on top of content rather than pushing it up
- On the Focus screen in **active session state**, the tab bar **fades to 20% opacity** to reduce distraction and fades back on tap

#### Tab order (proposed)

1. Focus (timer icon)
2. Plan (checklist icon)
3. Journal (pen icon)
4. Insights (chart/spark icon)
5. Settings (sliders icon)

---

## 5. Focus Screen

**This is the most critical screen to get right.**

### Current Issues

- Simultaneously shows: session indicator card, flow indicator card, start button, today's progress, quote modal triggers, task modal triggers
- Cluttered even before a session starts
- Active session state looks nearly identical to idle

### Proposed: Two Distinct States

#### Idle State

```
[Streak chip — top right, subtle]

[Session type label — muted, 18px, centered]
[Large timer digits — 80px, centered, dominant]

[Session type selector — horizontal scroll chips, below timer]

[Start button — large, accent color, single CTA]

[Flow indicator — slim bar at very bottom of content area, tappable to expand]
```

- No cards, no panels — just the timer and minimal controls
- Session type chips are small, horizontal scroll, icon + name

#### Active State (session running)

```
[4px progress bar — very top edge of screen, accent color]

[Muted session type label]
[LARGE running timer — full visual focus]

[Pause  |  Stop — minimal icon buttons below]
```

- Everything else **fades out or collapses** with an animated transition
- Screen background **subtly shifts** based on session type:
  - Deep Focus → near-black with a very faint deep blue tint
  - Break → warm amber-tinted background
  - Creative → faint purple tint
- Tab bar fades to near-invisible
- No quote modal during active sessions — defer to completion

#### Post-Session State (completion)

- Smooth transition from Active back to Idle
- **Bottom sheet** slides up (not a full modal) with:
  - Session type + duration summary
  - 1–5 quality tap (dots, not stars)
  - Optional: one-line note input
  - "Next in flow" or "Done" CTA
- Quote appears as a **bottom toast**, 3 seconds, non-blocking

---

## 6. Plan Screen

### Current Issues

- Bold tag labels (URGENT, DEEP WORK) create visual noise
- Task groups with headers add hierarchy that isn't always useful
- Add/Edit tasks use full modals even for simple operations

### Proposed

#### Task List

- **Flat list** — no group headers unless actively filtering
- Each task row:
  ```
  [○ Checkbox]  [Task name — 15px]  [● Tag dot — color coded]
  ```
- Tag dots (no text labels): Urgent = red, Deep Work = blue, Important = amber, Quick Win = green
- Tap tag dot to see label in a small tooltip

#### Current Task (pinned)

- The task linked to the active session is **pinned at the top** with a left accent border — the single visual emphasis
- All other tasks appear below in a flat list

#### Interactions

- **Swipe left** → delete (with undo toast)
- **Swipe right** → complete
- Tap task → inline expand to edit name/tag (no modal for basic edits)
- Complex edits → bottom sheet (not full-screen modal)

#### Add Task

- Floating `+` button → **expands inline at top of list** into a text input
- Press enter or tap checkmark to save
- No modal for simple task creation

---

## 7. Journal Screen

### Current Issues

- Cards with borders feel heavy
- The editor opens as a screen but the tab bar persists, breaking the writing focus

### Proposed: Editorial Style (Bear / Craft inspired)

#### List View

- **Date-grouped entries** — date as a large muted section header (`May 3`)
- Entry rows: title (bold, 16px) + single-line content preview (muted, 14px)
- No card borders — subtle bottom divider only
- Tap → full-screen editor

#### Journal Editor

- Enters a **focus mode** — tab bar hides completely (or slides down)
- Clean top bar: back arrow (left), title (center, editable inline), options `...` (right)
- Block toolbar slides up from the bottom on cursor focus (text, checklist, list, image, audio)
- No floating action buttons cluttering the writing surface

#### New Entry

- Floating `+` (same pattern as Plan screen)
- Opens editor immediately with cursor in title field

---

## 8. Insights Screen

### Current Issues

- Three chart types (bar, line, pie), multiple scrollable sections, and a dense data layout
- Overwhelming for a single user's personal stats
- Pie chart adds complexity without proportional clarity

### Proposed: Score → Stats → Insight

#### Hero Section (above fold)

```
[Animated ring/arc — weekly productivity score 0–100]
[Score number — large, centered in ring]
[Score label — "Good week" / "Strong" / "Building momentum"]

[3 stat chips below ring:]
  [X sessions]  [X hrs focus]  [X day streak]
```

#### Scroll Section

1. **Single weekly bar chart** — days of week, sessions per day, accent color bars, minimal axes (no labels, just values on hover/tap)
2. **Session history list** — recent 7 entries, each a row: session type + duration + quality dot
3. **One insight card** — a single contextual recommendation:  
   _"You complete 80% of Deep Focus sessions started before 10am. Consider scheduling your hardest task then."_
   Updates weekly.

#### What to Remove

- Pie chart (session type distribution) — not actionable for a single user
- Monthly analytics section — move to a "See more" expandable or remove for MVP
- Flow success rates section — collapse into the insight card if relevant

---

## 9. Settings Screen

### Current Issues

- Long single-column list with "Pro" badges creating visual noise
- Locked features tease creates friction in a minimal app

### Proposed

#### Structure: 3 collapsible sections

1. **Sessions** — default duration, break duration, auto-start, session types order
2. **Notifications** — master toggle, then per-type toggles (start, end, break, streak, summary)
3. **Appearance** — theme (system / light / dark), accent color picker (3–4 options), font size (2 options: Default / Comfortable)

#### Rules

- Plain rows: label left, toggle or `›` right
- No inline descriptions unless critical — use a `?` icon that shows a brief tooltip
- **Remove all "Pro" badge UI for now** — either ship the features or hide them. Teasing locked features is incongruent with minimalism.
- Section headers are simple uppercase 11px labels — not accordion toggles unless the list is long

---

## 10. Onboarding

### Current Issues

- 7 screens including widget setup and granular personalization
- Widget config and work type selection feel like settings, not onboarding
- Too much friction before first use

### Proposed: 3–4 Screens

1. **Welcome** — App name, 1-line philosophy, Lottie plant animation (keep this, it's good)
2. **Work Style** — Pick one: Quick Sprints / Balanced / Deep Work  
   (maps to default session type; can always change in Settings)
3. **Notifications** — Single permission request screen (keep)
4. **You're in** — First screen is the Focus tab, ready to go

#### Move to Settings (post-onboarding discovery)

- Widget configuration
- Work type details
- Detailed personalization

---

## 11. Component & Feature Trims

### Remove Entirely

- `BackgroundEventTest.tsx` — debug component, no place in production
- `NotificationTest.tsx` — debug component
- `NotificationTestSimple.tsx` — debug component
- `SessionIntelligenceTest.tsx` — debug component

### Simplify

| Feature                    | Current                                          | Proposed                                                  |
| -------------------------- | ------------------------------------------------ | --------------------------------------------------------- |
| Quote system               | Full modal with 3s auto-dismiss, interrupts flow | Bottom toast, non-blocking, appears post-session only     |
| Session Intelligence modal | Multi-section modal with charts                  | 2–3 plain text recommendations in a small bottom sheet    |
| Flow presets               | 11 built-in flows                                | 5 core flows: Classic, Deep Work, Creative, Study, Custom |
| Session completion         | Full modal                                       | Bottom sheet slide-up                                     |
| Task editing               | Full-screen modal                                | Bottom sheet or inline expansion                          |

### Keep As-Is (good foundations)

- Zustand stores — solid, don't touch
- Block-based journal architecture — keep internally, just improve editor UI
- Session intelligence data collection — keep all tracking, just simplify the display
- Streak system — keep, just display more subtly
- Sound + haptic feedback — keep

---

## 12. Animation Principles

All animations should follow these rules:

- **Spring physics** for interactive elements (buttons, modals, tab bar)
- **Fade + slight translateY** for content transitions (not slides, not flips)
- **Duration**: 200–350ms for interactions, 400–500ms for screen transitions
- **No bounce** on functional elements (toggles, checkboxes) — bounce only on celebratory moments (streak milestone, flow completion)
- The active session background color shift should be a **slow 800ms ease** — barely perceptible, felt more than seen

---

## Implementation Order (Recommended)

Given that this is a significant UI revamp, the recommended approach is:

1. **Design tokens first** — Update `tailwind.config.js` and `ThemeContext.tsx` with new palette
2. **Navigation** — Replace tab bar with floating pill component
3. **Focus screen** — Highest impact, idle + active states
4. **Global components** — Button, cards, bottom sheets, toasts
5. **Plan screen**
6. **Journal screen + editor**
7. **Insights screen**
8. **Settings screen**
9. **Onboarding** — Trim and restyle
10. **Remove debug components + trim flow presets**

---

## Decisions Log

| Question     | Decision                                                                                                                                                                                             |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Accent color | **Warm amber `#E8A43A`** — neutral, works across all session type tints                                                                                                                              |
| Tab count    | **4 tabs** — Journal tab removed. Reflections integrated into Focus screen post-session as a bottom sheet. Journal entries still accessible via the Focus post-session flow or a link from Insights. |
| Pro features | **Keep monetization UI** — Pro badges and locked states stay, but styled cleanly. Paywall is part of the long-term business model.                                                                   |
| Flow presets | **5 kept**: Classic Focus, Deep Work, Creative Rhythm, Solo Study, Morning Routine. Others removed from the selector.                                                                                |
| Dark default | **Dark mode ships as default**. System setting respected after user changes it in Settings, but first launch is always dark.                                                                         |

---

## Impact of Decisions on Proposal Sections

### Journal Tab → Focus Integration

- **Tab bar becomes 4 tabs**: Focus, Plan, Insights, Settings
- **Post-session bottom sheet** gains an optional "Write a note" CTA that opens a lightweight inline note composer (title + single text block)
- **Full journal editor** accessible from the post-session sheet via "Open full journal" link
- **Journal entry list** accessible from the Insights screen — session history rows can link to associated reflections
- The full block-based `journalEditor.tsx` screen is kept but reached via deep link, not a tab

### Pro Monetization UI

- Pro-locked rows use a **subtle lock icon** suffix — same row height, muted text color, no loud badge
- Tapping a locked feature opens a **minimal upgrade bottom sheet**: 1-line benefit, price, two CTAs (Upgrade / Maybe Later)
- The upgrade sheet is the only place "Pro" branding appears prominently
- Free tier limits communicated clearly in onboarding (one screen) — no surprises mid-use

### 4-Tab Navigation

```
1. Focus    (timer icon)
2. Plan     (checklist icon)
3. Insights (spark/chart icon)
4. Settings (sliders icon)
```
