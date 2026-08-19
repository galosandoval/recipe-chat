import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { Reveal } from './reveal'

// `motion/react` is mocked globally (see jest.setup.ts): motion elements render
// as plain DOM and `useReducedMotion` returns false, so this asserts the core
// guarantee — revealed content is always in the DOM, never left invisible
// waiting on an animation. The reduced-motion path is exercised end to end in
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
})
