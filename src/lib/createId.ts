import { createId, init } from '@paralleldrive/cuid2'

// Export the standard createId for general use
export { createId as cuid }

// Create a customized nanoId function for slugs
// Using shorter length (6 chars) for more readable URLs
export const nanoId = init({
  length: 6
})
