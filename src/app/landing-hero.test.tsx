import '@testing-library/jest-dom'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithTranslations, en } from '~/lib/test-translations'
import { LandingHero } from './landing-hero'

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

  it('renders the pitch: headline, mechanism, example prompt and sign-up link', () => {
    renderHero()

    expect(
      screen.getByRole('heading', { name: en.landing.hero.headline })
    ).toBeInTheDocument()
    expect(screen.getByText(en.landing.hero.tagline)).toBeInTheDocument()
    expect(screen.getByText(en.landing.hero.examplePrompt)).toBeInTheDocument()
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
})
