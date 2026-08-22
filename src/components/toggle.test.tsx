import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import { CircleDotIcon } from 'lucide-react'
import { DecorativeToggle, Toggle } from './toggle'

describe('Toggle', () => {
  it('reports its pressed state and calls back when pressed', () => {
    const onPressedChange = jest.fn()
    render(
      <Toggle
        id='limes'
        pressed={false}
        label='limes'
        onPressedChange={onPressedChange}
      />
    )

    const toggle = screen.getByRole('button', { name: 'limes' })
    expect(toggle).toHaveAttribute('data-state', 'off')

    fireEvent.click(toggle)

    expect(onPressedChange).toHaveBeenCalledWith(true)
  })
})

describe('DecorativeToggle', () => {
  it('shows the row without offering a control', () => {
    render(<DecorativeToggle pressed label='limes' />)

    expect(screen.getByText('limes')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('carries the same checked styling hook as the real row', () => {
    const { container } = render(<DecorativeToggle pressed label='limes' />)

    expect(container.querySelector('[data-state="on"]')).toBeInTheDocument()
  })

  it('lets a caller replace the checked mark', () => {
    const { container } = render(
      <DecorativeToggle
        pressed
        label='limes'
        icon={<CircleDotIcon data-testid='custom-mark' />}
      />
    )

    expect(screen.getByTestId('custom-mark')).toBeInTheDocument()
    expect(container.querySelector('svg.lucide-circle-check')).toBeNull()
  })
})
