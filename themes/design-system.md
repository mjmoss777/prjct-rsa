# Design System — Meld

Reference for AI agents building UI in this project. Follow these rules exactly.

## Hard Rules

- **NEVER** use `box-shadow` or any shadow utility (`shadow-*`, `drop-shadow`, etc.)
- **NEVER** use gradients (`bg-gradient-*`, `linear-gradient`, `radial-gradient`, etc.)
- **NEVER** use `font-bold` or `font-weight: 700+`. Maximum allowed weight is `font-semibold` (600) and ONLY on text 14px or smaller. For text above 14px, maximum is `font-medium` (500)
- No emojis in UI
- No pure black (`#000`) or pure gray (`#808080`) for text — always use the palette below
- No `display: grid` or CSS tables — use flexbox for all layout
- No rounded corners larger than `16px` unless the element is a pill (`rounded-full`)
- Honor `prefers-reduced-motion` — wrap all Motion animations so they are disabled or reduced when the user prefers reduced motion

## Color Palette

| Role        | Hex       | Usage                                      |
|-------------|-----------|----------------------------------------------|
| Surface     | `#F5F0E8` | Page background, card fills                  |
| Foreground  | `#1A1A18` | Headings, primary text                       |
| Muted       | `#6B6960` | Body text, secondary labels, nav links       |
| Subtle      | `#A39E93` | Captions, footer text, timestamps            |
| Border      | `#D4CDBE` | Dividers, outlines, input borders            |
| Border Soft | `#C8C1B4` | Secondary outlines (e.g. ghost buttons)      |
| Accent      | `#2D5A3D` | Primary buttons, key actions                 |
| Accent Soft | `#7BA085` | Indicators, status dots, accent details      |
| Hover Tint  | `#E8E3DB` | Hover state for ghost/outline buttons        |
| On Accent   | `#F5F0E8` | Text on accent-colored backgrounds           |
| Error       | `#9B3232` | Destructive actions, inline validation errors|
| Error Soft  | `#C47A7A` | Error hints, secondary error text            |
| Focus Ring  | `#2D5A3D` | Keyboard focus outline (reuses Accent)       |

## Typography

### Fonts

| Role     | Family             | CSS Variable                  |
|----------|--------------------|-------------------------------|
| Display  | Instrument Serif   | `var(--font-instrument-serif)`|
| Body     | DM Sans            | `var(--font-dm-sans)`         |

### Scale

| Token      | Size   | Line Height | Weight | Tracking     | Font     | Usage                    |
|------------|--------|-------------|--------|--------------|----------|--------------------------|
| Display    | 72px   | 76px        | 400    | -0.03em      | Display  | Hero headings            |
| Title      | 24px   | 30px        | 400    | -0.02em      | Display  | Logo, section titles     |
| Heading    | 22px   | 28px        | 400    | -0.01em      | Display  | Feature titles, card h3  |
| Body       | 18px   | 28px        | 400    | normal       | Body     | Hero subtext, paragraphs |
| Body SM    | 15px   | 24px        | 400    | normal       | Body     | Feature descriptions     |
| Label      | 15px   | 18px        | 400    | normal       | Body     | Nav links                |
| Button     | 16px   | 20px        | 500    | normal       | Body     | Button text              |
| Button SM  | 14px   | 18px        | 500    | normal       | Body     | Small buttons (nav CTA)  |
| Tag        | 13px   | 16px        | 500    | 0.04em       | Body     | Badges, uppercase labels |
| Caption    | 13px   | 16px        | 400    | normal       | Body     | Footer text, fine print  |

### Weight Rules

- `400` (regular) — default for all text
- `500` (medium) — buttons and uppercase tags only
- `600` (semibold) — allowed ONLY on text 14px or smaller (e.g. small labels, micro tags)
- Never go above 600, and never use 600 on text larger than 14px

### Typography Extras

- Use `text-wrap: balance` on headings to prevent widows
- Use `font-variant-numeric: tabular-nums` on number columns, prices, stats
- Use `…` not `...` — loading states: `"Loading…"`, `"Saving…"`
- Use curly quotes `"` `"` not straight `"`

## Spacing

| Token     | Value   | Usage                               |
|-----------|---------|-------------------------------------|
| page-x    | 80px    | Horizontal page padding (nav, hero) |
| section-x | 120px   | Feature section horizontal padding  |
| section-y | 80px    | Vertical section padding            |
| hero-top  | 100px   | Hero top padding                    |
| group     | 32px    | Gap between hero elements           |
| feature   | 80px    | Gap between feature columns         |
| element   | 12px    | Gap within a feature card           |
| nav-gap   | 40px    | Gap between nav links               |
| cta-gap   | 16px    | Gap between CTA buttons             |
| footer    | 24px    | Footer vertical padding             |
| compact   | 8px     | Small internal gaps (badge icon+text)|

## Borders & Radius

| Token      | Value                   | Usage                     |
|------------|-------------------------|---------------------------|
| border     | 1px solid `#D4CDBE`     | Dividers, badges          |
| border-alt | 1px solid `#C8C1B4`     | Ghost/outline buttons     |
| pill       | `border-radius: 9999px` | Buttons, badges, pills    |
| card       | `border-radius: 16px`   | Image containers, cards   |
| none       | `border-radius: 0`      | Default for sections      |

## Components

### Primary Button

```
bg: #2D5A3D | text: #F5F0E8 | weight: 500 | size: 16px
padding: 14px 32px | radius: pill
hover: opacity 0.9 | transition: opacity 200ms
focus: outline 2px solid #2D5A3D, offset 2px (focus-visible only)
active: opacity 0.85
disabled: opacity 0.4, pointer-events none
```

### Ghost Button

```
bg: transparent | text: #1A1A18 | weight: 400 | size: 16px
border: 1px solid #C8C1B4 | padding: 14px 32px | radius: pill
hover: bg #E8E3DB | transition: background-color 200ms
focus: outline 2px solid #2D5A3D, offset 2px (focus-visible only)
active: bg #D4CDBE
disabled: opacity 0.4, pointer-events none
```

### Destructive Button

```
bg: #9B3232 | text: #F5F0E8 | weight: 500 | size: 16px
padding: 14px 32px | radius: pill
hover: opacity 0.9 | transition: opacity 200ms
focus: outline 2px solid #9B3232, offset 2px (focus-visible only)
active: opacity 0.85
disabled: opacity 0.4, pointer-events none
```

### Nav Button (small)

```
bg: #2D5A3D | text: #F5F0E8 | weight: 500 | size: 14px
padding: 10px 24px | radius: pill
hover: opacity 0.9 | transition: opacity 200ms
focus: outline 2px solid #2D5A3D, offset 2px (focus-visible only)
```

### Badge / Tag

```
bg: transparent | border: 1px solid #D4CDBE
padding: 6px 16px | radius: pill | gap: 8px
text: 13px uppercase tracking 0.04em weight 500 color #6B6960
dot: 6px circle #7BA085
```

### Nav Link

```
text: 15px weight 400 color #6B6960
hover: color #1A1A18 | transition: color 200ms
focus: outline 2px solid #2D5A3D, offset 2px (focus-visible only)
```

### Footer Link

```
text: 13px weight 400 color #A39E93
hover: color #6B6960 | transition: color 200ms
focus: outline 2px solid #2D5A3D, offset 2px (focus-visible only)
```

## Focus States

All interactive elements must have a visible `focus-visible` state:

```
outline: 2px solid #2D5A3D
outline-offset: 2px
```

- Use `:focus-visible` not `:focus` (no ring on click, only keyboard)
- Never use `outline: none` without a `focus-visible` replacement
- No shadows for focus — outline only

## Accessibility

- Icon-only buttons require `aria-label`
- Form inputs require `<label>` or `aria-label`
- Use `<button>` for actions, `<a>` for navigation — never `<div onClick>`
- Images need `alt` (or `alt=""` if decorative)
- Headings follow hierarchical order (`h1` → `h6`)
- Async status updates (toasts, validation) use `aria-live="polite"`

## Touch & Interaction

- Apply `touch-action: manipulation` on buttons and interactive elements (prevents double-tap zoom delay)
- Use `overscroll-behavior: contain` on modals, drawers, and sheets
- Destructive actions require a confirmation step or undo window — never immediate

## Animation Principles

- Use `motion/react` for all animations
- Entrance: fade up (`opacity: 0, y: 24` → `opacity: 1, y: 0`)
- Ease curve: `[0.25, 0.1, 0.25, 1]` (CSS ease equivalent)
- Duration: 500-800ms for entrances
- Stagger: 120ms between hero children, 150ms between feature columns
- Scroll-triggered: `whileInView` with `viewport={{ once: true }}`
- Nav: fade down from `y: -16`
- No spring/bounce — keep it calm and restrained
- Animate `transform` and `opacity` only (compositor-friendly)
- Never `transition: all` — list properties explicitly
- **Reduced motion:** wrap animations with `prefers-reduced-motion` check. When reduced motion is preferred, skip translate/scale and use opacity-only fades with shorter duration (200ms max)

## Layout Principles

- Flexbox only — `display: flex` for all containers
- Center-aligned hero content, left-aligned feature text
- Max-width constraints: 800px headings, 480px body, 280px feature columns
- Full-width sections with horizontal padding, never a max-width wrapper
- Vertical rhythm: generous whitespace between sections, tight within groups

## Visual Philosophy

- Warm, muted, earthy tones — no saturated colors
- One accent color used sparingly (forest green)
- Restraint over decoration — whitespace is a feature
- No shadows, no gradients, no visual noise
- Hierarchy through size contrast and color, never weight
- Serif display + sans body pairing for editorial warmth
