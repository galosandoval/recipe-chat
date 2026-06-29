import type { Transition, Variants } from 'motion/react'

/**
 * Shared animation tokens. Every Motion-driven transition in the app pulls its
 * timing and easing from here so the whole product shares one feel — tune these
 * to retune everything. Keep animated properties to `opacity` + `transform`
 * (translate/scale) only, for GPU acceleration and to avoid layout thrash.
 */
export const durations = {
  /** Quick UI affordances: dropdowns, selects, overlays. */
  fast: 0.18,
  /** Default for content entrances: dialogs, chat messages, onboarding steps. */
  base: 0.24
} as const

/** Eased curve (a soft ease-out) used across enter/exit transitions. */
export const ease = [0.16, 1, 0.3, 1] as const

/** The "north star" entrance: subtle fade + small rise, fast and eased. */
export const fadeRiseTransition: Transition = {
  duration: durations.base,
  ease
}

/** Overlay/backdrop fade, kept in sync with the surface it dims. */
export const overlayVariants: Variants = {
  closed: { opacity: 0 },
  open: { opacity: 1 }
}

/** Dialog surface: centered fade + slight scale (no corner slide). */
export const dialogVariants: Variants = {
  closed: { opacity: 0, scale: 0.97 },
  open: { opacity: 1, scale: 1 }
}

/** Popover surfaces (dropdown, select): fade + slight scale near the trigger. */
export const popoverVariants: Variants = {
  closed: { opacity: 0, scale: 0.96 },
  open: { opacity: 1, scale: 1 }
}

/** Content entrance (chat message bubbles): fade + rise. */
export const fadeRiseVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 }
}
