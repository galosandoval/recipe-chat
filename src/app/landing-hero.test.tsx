import '@testing-library/jest-dom'
import { screen, fireEvent, act } from '@testing-library/react'
import * as motion from 'motion/react'
import { renderWithTranslations, en } from '~/lib/test-translations'
import { LandingHero } from './landing-hero'

const examplePrompts = Object.values(en.landing.hero.examplePrompts)

describe('LandingHero', () => {
  function renderHero(overrides?: {
    onStart?: () => void
    onScrollCue?: () => void
  }) {
    const onStart = overrides?.onStart ?? jest.fn()
    const onScrollCue = overrides?.onScrollCue ?? jest.fn()
    renderWithTranslations(
      <LandingHero
        onStart={onStart}
        onScrollCue={onScrollCue}
        signUp={<a href='#'>{en.landing.hero.signUp}</a>}
      />
    )
    return { onStart, onScrollCue }
  }

  it('renders the pitch: headline, mechanism, first example prompt and sign-up link', () => {
    renderHero()

    expect(
      screen.getByRole('heading', { name: en.landing.hero.headline })
    ).toBeInTheDocument()
    expect(screen.getByText(en.landing.hero.tagline)).toBeInTheDocument()
    expect(screen.getByText(examplePrompts[0])).toBeInTheDocument()
    expect(
      screen.getByText(en.landing.hero.signUpPrompt, { exact: false })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: en.landing.hero.signUp })
    ).toBeInTheDocument()
  })

  it('the call to action starts the chat', () => {
    const { onStart } = renderHero()

    fireEvent.click(screen.getByRole('button', { name: en.landing.hero.cta }))

    expect(onStart).toHaveBeenCalledTimes(1)
  })

  it('the scroll cue scrolls to the chat', () => {
    const { onScrollCue } = renderHero()

    fireEvent.click(
      screen.getByRole('button', { name: en.landing.hero.scrollCue })
    )

    expect(onScrollCue).toHaveBeenCalledTimes(1)
  })

  describe('the cycling example prompt', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      act(() => jest.runOnlyPendingTimers())
      jest.useRealTimers()
      jest.restoreAllMocks()
    })

    it('cycles at least three prompts, advancing to the next after a readable hold', () => {
      expect(examplePrompts.length).toBeGreaterThanOrEqual(3)

      renderHero()

      expect(screen.getByText(examplePrompts[0])).toBeInTheDocument()
      expect(screen.queryByText(examplePrompts[1])).not.toBeInTheDocument()

      act(() => jest.advanceTimersByTime(5000))

      expect(screen.getByText(examplePrompts[1])).toBeInTheDocument()
    })

    it('shows a single prompt and never advances under reduced motion', () => {
      jest.spyOn(motion, 'useReducedMotion').mockReturnValue(true)

      renderHero()

      expect(screen.getByText(examplePrompts[0])).toBeInTheDocument()

      act(() => jest.advanceTimersByTime(20000))

      expect(screen.getByText(examplePrompts[0])).toBeInTheDocument()
      expect(screen.queryByText(examplePrompts[1])).not.toBeInTheDocument()
    })

    it('stops cycling while the hero is scrolled out of view', () => {
      let observerCallback:
        | ((entries: Partial<IntersectionObserverEntry>[]) => void)
        | undefined
      const original = globalThis.IntersectionObserver
      class OffscreenObserver {
        constructor(
          cb: (entries: Partial<IntersectionObserverEntry>[]) => void
        ) {
          observerCallback = cb
        }
        observe() {}
        unobserve() {}
        disconnect() {}
        takeRecords() {
          return []
        }
      }
      globalThis.IntersectionObserver =
        OffscreenObserver as unknown as typeof IntersectionObserver

      try {
        renderHero()

        act(() => observerCallback?.([{ isIntersecting: false }]))
        act(() => jest.advanceTimersByTime(20000))

        expect(screen.getByText(examplePrompts[0])).toBeInTheDocument()
        expect(screen.queryByText(examplePrompts[1])).not.toBeInTheDocument()
      } finally {
        globalThis.IntersectionObserver = original
      }
    })
  })
})
