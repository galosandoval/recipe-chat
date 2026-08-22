import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { Reveal } from './reveal'

// `motion/react` is mocked globally (see jest.setup.ts): motion elements render
// as plain DOM, so this asserts the core guarantee — revealed content is always
// in the DOM, never left invisible waiting on an animation. The reduced-motion
// path is CSS-driven (see globals.css) and exercised end to end in
// e2e/landing.spec.ts under Playwright's `reducedMotion: 'reduce'`.
describe('Reveal', () => {
  it('renders its children into the wrapper', () => {
    render(
      <Reveal className='reveal-wrapper'>
        <p>hello section</p>
      </Reveal>
    )

    const content = screen.getByText('hello section')
    expect(content).toBeInTheDocument()
    expect(content.parentElement).toHaveClass('reveal-wrapper')
  })

  // The reduced-motion rule in globals.css hangs off this attribute; without it
  // a reveal stays at its server-rendered `opacity: 0` for those visitors.
  it('marks the wrapper for the reduced-motion stylesheet', () => {
    render(
      <Reveal>
        <p>hello section</p>
      </Reveal>
    )

    expect(screen.getByText('hello section').parentElement).toHaveAttribute(
      'data-reveal'
    )
  })

  // A `parent`-triggered Reveal is a step of an enclosing one, so it carries the
  // same reduced-motion marker rather than falling through unprotected.
  it('marks a parent-triggered reveal too', () => {
    render(
      <Reveal trigger='parent'>
        <p>one step</p>
      </Reveal>
    )

    expect(screen.getByText('one step').parentElement).toHaveAttribute(
      'data-reveal'
    )
  })
})
