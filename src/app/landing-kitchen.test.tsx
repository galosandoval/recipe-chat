import '@testing-library/jest-dom'
import { screen } from '@testing-library/react'
import { renderWithTranslations, en } from '~/lib/test-translations'
import { LandingKitchen } from './landing-kitchen'

// `motion/react` is mocked globally (see jest.setup.ts), so Reveal's children
// render as plain DOM here — which is the point: the cards must be in the
// document, never left invisible waiting on a scroll animation. The staggered
// entrance and the reduced-motion path live in CSS (see globals.css).
describe('LandingKitchen', () => {
  it('renders the heading and its description', () => {
    renderWithTranslations(<LandingKitchen />)

    expect(
      screen.getByRole('heading', { name: en.landing.kitchen.heading })
    ).toBeInTheDocument()
    expect(screen.getByText(en.landing.kitchen.description)).toBeInTheDocument()
  })

  it('shows the Taste Profile the chat welcome would show', () => {
    renderWithTranslations(<LandingKitchen />)
    const profile = en.landing.kitchen.tasteProfile

    expect(
      screen.getByRole('heading', { name: en.valueProps.yourTasteProfile })
    ).toBeInTheDocument()

    for (const chip of [
      profile.skill,
      profile.household,
      profile.cuisines.first,
      profile.cuisines.second,
      profile.dietary
    ]) {
      expect(screen.getByText(chip)).toBeInTheDocument()
    }
  })

  it('shows the pantry option on', () => {
    renderWithTranslations(<LandingKitchen />)

    expect(screen.getByText(en.valueProps.usePantry)).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: en.valueProps.chatOptions })
    ).toBeInTheDocument()
  })

  it('shows the stock filters, two of them active', () => {
    renderWithTranslations(<LandingKitchen />)

    expect(
      screen.getByRole('heading', { name: en.filters.title })
    ).toBeInTheDocument()

    for (const filter of [
      en.filters.initial['under-30-minutes'],
      en.filters.initial['one-pot'],
      en.filters.initial['kid-friendly']
    ]) {
      expect(screen.getByText(filter)).toBeInTheDocument()
    }
  })

  it('offers no pressable control — the live chat below owns that', () => {
    renderWithTranslations(<LandingKitchen />)

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
