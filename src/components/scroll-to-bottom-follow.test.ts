import {
  AT_BOTTOM_TOLERANCE_PX,
  isAtBottom,
  reduceFollow,
  type FollowState
} from './scroll-to-bottom-follow'

const metrics = (scrollTop: number) => ({
  scrollTop,
  scrollHeight: 1000,
  clientHeight: 400
})

/** The bottom of `metrics()` — the scrollTop at which no content is below. */
const BOTTOM = 600

describe('isAtBottom', () => {
  it('counts the exact bottom as at bottom', () => {
    expect(isAtBottom(metrics(BOTTOM))).toBe(true)
  })

  it('counts a gap within the tolerance as at bottom', () => {
    expect(isAtBottom(metrics(BOTTOM - AT_BOTTOM_TOLERANCE_PX))).toBe(true)
  })

  it('counts a gap just outside the tolerance as scrolled up', () => {
    expect(isAtBottom(metrics(BOTTOM - AT_BOTTOM_TOLERANCE_PX - 1))).toBe(false)
  })

  it('counts content shorter than the viewport as at bottom', () => {
    expect(
      isAtBottom({ scrollTop: 0, scrollHeight: 300, clientHeight: 400 })
    ).toBe(true)
  })
})

describe('reduceFollow', () => {
  it('detaches when the user scrolls up while following', () => {
    expect(
      reduceFollow('following', { type: 'scrolled', atBottom: false })
    ).toEqual({ state: 'detached', scrollToBottom: false })
  })

  it('re-attaches when the user scrolls back to the bottom', () => {
    expect(
      reduceFollow('detached', { type: 'scrolled', atBottom: true })
    ).toEqual({ state: 'following', scrollToBottom: false })
  })

  it('stays following while the user scrolls within the bottom tolerance', () => {
    expect(
      reduceFollow('following', { type: 'scrolled', atBottom: true })
    ).toEqual({ state: 'following', scrollToBottom: false })
  })

  it('stays detached while the user scrolls above the bottom', () => {
    expect(
      reduceFollow('detached', { type: 'scrolled', atBottom: false })
    ).toEqual({ state: 'detached', scrollToBottom: false })
  })

  it.each<FollowState>(['following', 'detached'])(
    're-attaches and travels to the bottom on a jump request from %s',
    (state) => {
      expect(reduceFollow(state, { type: 'jumpToBottomRequested' })).toEqual({
        state: 'following',
        scrollToBottom: true
      })
    }
  )

  it('keeps up with growing content while following', () => {
    expect(reduceFollow('following', { type: 'contentResized' })).toEqual({
      state: 'following',
      scrollToBottom: true
    })
  })

  it('leaves the user where they are when content grows while detached', () => {
    expect(reduceFollow('detached', { type: 'contentResized' })).toEqual({
      state: 'detached',
      scrollToBottom: false
    })
  })
})
