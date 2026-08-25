/**
 * The one place the Subscriptions flag is read.
 *
 * Every surface that hides, refuses, or bypasses the money path asks this
 * question instead of reading the environment itself, so the answer cannot
 * drift between the settings menu, the page, the tRPC procedures, the webhook
 * route, and tier gating.
 *
 * The flag is public because the page and the settings menu need it during
 * render; it reveals only whether a deployment sells Subscriptions.
 *
 * Fails closed: unset, empty, or anything other than `'true'` means disabled,
 * so a new environment that forgets the variable hides a broken money path
 * rather than exposing one.
 */
export function areSubscriptionsEnabled() {
  return process.env.NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED === 'true'
}
