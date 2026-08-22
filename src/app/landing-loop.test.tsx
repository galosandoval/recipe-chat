import '@testing-library/jest-dom'
import { screen } from '@testing-library/react'
import { renderWithTranslations, en } from '~/lib/test-translations'
import { LandingLoop } from './landing-loop'

// `motion/react` is mocked globally (see jest.setup.ts), so Reveal's children
// render as plain DOM here — which is the point: every row arrives checked in
// the document rather than waiting on a scroll animation, which is also exactly
// what a visitor asking for reduced motion sees (globals.css settles the
// reveals, so the ticks are simply already there).
const items = Object.values(en.landing.loop.items)

describe('LandingLoop', () => {
  it('renders the heading, its description and the chat reply', () => {
    renderWithTranslations(<LandingLoop />)

    expect(
      screen.getByRole('heading', { name: en.landing.loop.heading })
    ).toBeInTheDocument()
    expect(screen.getByText(en.landing.loop.description)).toBeInTheDocument()
    expect(screen.getByText(en.landing.loop.reply)).toBeInTheDocument()
  })

  it('carries every Grocery List item through to the Pantry', () => {
    renderWithTranslations(<LandingLoop />)

    expect(
      screen.getByRole('heading', { name: en.nav.list })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: en.nav.pantry })
    ).toBeInTheDocument()

    for (const item of items) {
      // Once as a Grocery List row, once as a Pantry chip.
      expect(screen.getAllByText(item)).toHaveLength(2)
    }
  })

  it('renders every Grocery List row checked', () => {
    const { container } = renderWithTranslations(<LandingLoop />)

    expect(container.querySelectorAll('[data-state="on"]')).toHaveLength(
      items.length
    )
  })

  it('shows the Grocery List before the Pantry', () => {
    const { container } = renderWithTranslations(<LandingLoop />)

    const order = Array.from(container.querySelectorAll<HTMLElement>('h2')).map(
      (heading) => heading.textContent
    )

    expect(order.indexOf(en.nav.list)).toBeLessThan(
      order.indexOf(en.nav.pantry)
    )
  })

  it('offers no pressable control — the live chat below owns that', () => {
    renderWithTranslations(<LandingLoop />)

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
