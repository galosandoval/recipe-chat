/** A cooking duration detected inside an instruction step. */
export type StepTimer = {
  /** The matched text, shown on the timer button (e.g. `"20 minutes"`). */
  label: string
  /** The duration in seconds, used to run the countdown. */
  seconds: number
}

const UNIT_SECONDS: Record<string, number> = {
  hour: 60 * 60,
  hr: 60 * 60,
  minute: 60,
  min: 60,
  second: 1,
  sec: 1
}

/**
 * Match a number (or a `1-2` style range) followed by a time unit. The range's
 * upper bound is captured separately so we can prefer it over the lower bound.
 */
const TIMER_PATTERN =
  /(\d+)(?:\s*(?:-|–|to)\s*(\d+))?\s*(hours?|hrs?|minutes?|mins?|seconds?|secs?)/gi

/**
 * Finds every cooking duration mentioned in an instruction step so Cook Mode can
 * offer a countdown for each. Ranges (e.g. `"1-2 minutes"`) resolve to their
 * upper bound so a step is never undercooked.
 */
export function parseStepTimers(text: string): StepTimer[] {
  const timers: StepTimer[] = []

  for (const match of text.matchAll(TIMER_PATTERN)) {
    const [label, lower, upper, rawUnit] = match
    const unit = rawUnit.toLowerCase().replace(/s$/, '')
    const perUnit = UNIT_SECONDS[unit]
    if (!perUnit) continue

    const amount = Number(upper ?? lower)
    timers.push({ label: label.trim(), seconds: amount * perUnit })
  }

  return timers
}

/**
 * Formats a countdown of `seconds` as `MM:SS` (minutes are not capped at 59, so a
 * one-hour timer reads `60:00`). Negative values clamp to `00:00`.
 */
export function formatCountdown(seconds: number): string {
  const clamped = Math.max(0, Math.floor(seconds))
  const minutes = Math.floor(clamped / 60)
  const secs = clamped % 60
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${pad(minutes)}:${pad(secs)}`
}
