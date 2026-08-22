import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { LandingSection } from './landing-section'

// `motion/react` is mocked globally (see jest.setup.ts), so the section's Reveal
// renders as plain DOM — its contents must be in the document rather than left
// invisible waiting on a scroll animation.
describe('LandingSection', () => {
  it('renders its heading, description and contents', () => {
    render(
      <LandingSection
        heading='It knows your kitchen'
        description='Shaped by your pantry.'
      >
        <p>a card</p>
      </LandingSection>
    )

    expect(
      screen.getByRole('heading', { name: 'It knows your kitchen' })
    ).toBeInTheDocument()
    expect(screen.getByText('Shaped by your pantry.')).toBeInTheDocument()
    expect(screen.getByText('a card')).toBeInTheDocument()
  })

  it('gives its contents a single entrance to stagger off', () => {
    const { container } = render(
      <LandingSection heading='Heading' description='Description'>
        <p>a card</p>
      </LandingSection>
    )

    expect(container.querySelectorAll('[data-reveal]')).toHaveLength(1)
  })
})
