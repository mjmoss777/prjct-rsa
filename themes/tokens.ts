/**
 * Design tokens extracted from the Meld design system.
 * Import these instead of hardcoding hex values in components.
 *
 * HARD RULES — never violate:
 *   - No box-shadow, drop-shadow, or any shadow
 *   - No gradients (linear, radial, conic)
 *   - No font-weight above 500 for text larger than 14px
 *   - font-weight 600 (semibold) allowed ONLY on text 14px or smaller
 */

export const colors = {
  surface: "#F5F0E8",
  foreground: "#1A1A18",
  muted: "#6B6960",
  subtle: "#A39E93",
  border: "#D4CDBE",
  borderSoft: "#C8C1B4",
  accent: "#2D5A3D",
  accentSoft: "#7BA085",
  hoverTint: "#E8E3DB",
  onAccent: "#F5F0E8",
  error: "#9B3232",
  errorSoft: "#C47A7A",
  focusRing: "#2D5A3D",
} as const;

export const fonts = {
  display: 'var(--font-instrument-serif), "Instrument Serif", serif',
  body: 'var(--font-dm-sans), "DM Sans", sans-serif',
} as const;

export const fontVars = {
  display: "font-[family-name:var(--font-instrument-serif)]",
  body: "font-[family-name:var(--font-dm-sans)]",
} as const;

export const typeScale = {
  display: { fontSize: "72px", lineHeight: "76px", letterSpacing: "-0.03em", fontWeight: 400 },
  title: { fontSize: "24px", lineHeight: "30px", letterSpacing: "-0.02em", fontWeight: 400 },
  heading: { fontSize: "22px", lineHeight: "28px", letterSpacing: "-0.01em", fontWeight: 400 },
  body: { fontSize: "18px", lineHeight: "28px", fontWeight: 400 },
  bodySm: { fontSize: "15px", lineHeight: "24px", fontWeight: 400 },
  label: { fontSize: "15px", lineHeight: "18px", fontWeight: 400 },
  button: { fontSize: "16px", lineHeight: "20px", fontWeight: 500 },
  buttonSm: { fontSize: "14px", lineHeight: "18px", fontWeight: 500 },
  tag: { fontSize: "13px", lineHeight: "16px", letterSpacing: "0.04em", textTransform: "uppercase" as const, fontWeight: 500 },
  caption: { fontSize: "13px", lineHeight: "16px", fontWeight: 400 },
} as const;

export const spacing = {
  pageX: "80px",
  sectionX: "120px",
  sectionY: "80px",
  heroTop: "100px",
  group: "32px",
  feature: "80px",
  element: "12px",
  navGap: "40px",
  ctaGap: "16px",
  footer: "24px",
  compact: "8px",
} as const;

export const radii = {
  pill: "9999px",
  card: "16px",
  none: "0px",
} as const;

export const focus = {
  ring: `2px solid ${colors.focusRing}`,
  offset: "2px",
} as const;

export const disabled = {
  opacity: 0.4,
  pointerEvents: "none" as const,
} as const;

export const motion = {
  fadeUp: {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0 },
  },
  fadeDown: {
    hidden: { opacity: 0, y: -16 },
    visible: { opacity: 1, y: 0 },
  },
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  /** Reduced-motion variants — opacity only, short duration */
  reducedFadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  ease: [0.25, 0.1, 0.25, 1] as const,
  duration: {
    fast: 0.5,
    normal: 0.6,
    slow: 0.8,
    reduced: 0.2,
  },
  stagger: {
    hero: 0.12,
    features: 0.15,
  },
} as const;
