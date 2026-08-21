import '@testing-library/jest-dom'
import { screen } from '@testing-library/react'
import { renderWithTranslations, en } from '~/lib/test-translations'
import { LandingProof } from './landing-proof'

// `motion/react` is mocked globally (see jest.setup.ts), so Reveal's children
// render as plain DOM here — which is the point: the exchange must be in the
// document, never left invisible waiting on a scroll animation. The staggered
// entrance and the reduced-motion path are exercised in e2e/landing.spec.ts.
const options = [
  en.landing.proof.options.first,
  en.landing.proof.options.second
]

describe('LandingProof', () => {
  it('renders the ask, the reply and both Recipe Options', () => {
    renderWithTranslations(<LandingProof />)

    expect(
      screen.getByRole('heading', { name: en.landing.proof.heading })
    ).toBeInTheDocument()
    expect(screen.getByText(en.landing.proof.ask)).toBeInTheDocument()
    expect(screen.getByText(en.landing.proof.reply)).toBeInTheDocument()

    for (const option of options) {
      expect(
        screen.getByRole('heading', { name: option.name })
      ).toBeInTheDocument()
      expect(screen.getByText(option.description)).toBeInTheDocument()
    }
  })

  it('shows the ask before both Recipe Options', () => {
    const { container } = renderWithTranslations(<LandingProof />)

    const order = Array.from(
      container.querySelectorAll<HTMLElement>('p, h3')
    ).map((element) => element.textContent)

    expect(order.indexOf(en.landing.proof.ask)).toBeLessThan(
      order.indexOf(options[0].name)
    )
    expect(order.indexOf(options[0].name)).toBeLessThan(
      order.indexOf(options[1].name)
    )
  })

  it('offers no pressable control — the live chat below owns that', () => {
    renderWithTranslations(<LandingProof />)

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
