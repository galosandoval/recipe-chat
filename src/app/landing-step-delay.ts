/** Seconds between two steps of a landing section, so they arrive one after another. */
const STEP_SECONDS = 0.12

/**
 * How long the given step of a landing section holds before it rises in. Step 0
 * is the section's own entrance, so its contents stagger from step 1 up.
 */
export function stepDelay(step: number) {
  return step * STEP_SECONDS
}
