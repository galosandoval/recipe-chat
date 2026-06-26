import { createId, init } from '@paralleldrive/cuid2'

/** The standard createId, re-exported for general use. */
export { createId as cuid }

/**
 * Customized nanoId function for slugs. Uses a shorter length (6 chars) for
 * more readable URLs.
 */
export const nanoId = init({
  length: 6
})
