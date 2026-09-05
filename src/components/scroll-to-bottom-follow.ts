/**
 * The chat scroller's follow-the-stream policy, as a plain module: no React, no
 * DOM. {@link ScrollToBottomProvider} owns the refs, listeners and context and
 * delegates every decision here, so the policy is testable against fake scroll
 * metrics instead of a layout engine (jsdom has none — `scrollHeight` and
 * `clientHeight` are always 0 there).
 */

/**
 * How far from the bottom still counts as "at the bottom", in CSS pixels.
 *
 * A tolerance is required: on fractional device pixel ratios `scrollTop` lands
 * a sub-pixel short of `scrollHeight - clientHeight`, so the exact-equality
 * case never reliably fires. This is the one number here likely to need tuning
 * against a real device.
 */
export const AT_BOTTOM_TOLERANCE_PX = 8

/** The scroll metrics the policy reads — an element, or a fake in tests. */
type ScrollMetrics = {
  scrollTop: number
  scrollHeight: number
  clientHeight: number
}

/** Whether the view is close enough to the bottom to count as at it. */
export function isAtBottom({
  scrollTop,
  scrollHeight,
  clientHeight
}: ScrollMetrics) {
  return scrollHeight - clientHeight - scrollTop <= AT_BOTTOM_TOLERANCE_PX
}

/**
 * Whether new content pins the view to the bottom. The user is in charge:
 * scrolling up detaches and stays detached until they come back themselves or
 * press the scroll-to-bottom button.
 */
export type FollowState = 'following' | 'detached'

export type ScrollEvent =
  | { type: 'scrolled'; atBottom: boolean }
  | { type: 'contentResized' }
  | { type: 'jumpToBottomRequested' }

type FollowTransition = {
  state: FollowState
  /** Whether the caller should scroll its container to the bottom. */
  scrollToBottom: boolean
}

/** The next follow state, plus the scroll the transition asks the caller for. */
export function reduceFollow(
  state: FollowState,
  event: ScrollEvent
): FollowTransition {
  switch (event.type) {
    case 'scrolled':
      return {
        state: event.atBottom ? 'following' : 'detached',
        scrollToBottom: false
      }
    case 'jumpToBottomRequested':
      return { state: 'following', scrollToBottom: true }
    case 'contentResized':
      return { state, scrollToBottom: state === 'following' }
  }
}
