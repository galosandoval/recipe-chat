import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'

jest.mock('next/navigation', () => ({
  usePathname: () => '/recipes/pasta'
}))

import { FabStack } from './fab-stack'
import { useFabStackStore } from './fab-stack-store'

beforeEach(() => {
  useFabStackStore.setState({ fabs: [] })
})

describe('FabStack', () => {
  it('renders nothing when no FAB is registered', () => {
    const { container } = render(<FabStack />)
    expect(container.querySelectorAll('button')).toHaveLength(0)
  })

  it('renders each registered FAB with its aria-label and click handler', () => {
    const onClick = jest.fn()
    useFabStackStore.getState().register({
      id: 'edit',
      priority: 1,
      ariaLabel: 'Edit recipe',
      icon: <span>icon</span>,
      onClick
    })
    render(<FabStack />)

    const button = screen.getByRole('button', { name: 'Edit recipe' })
    button.click()
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('renders FABs in priority order (lowest priority first in the DOM)', () => {
    const { register } = useFabStackStore.getState()
    register({
      id: 'edit',
      priority: 2,
      ariaLabel: 'Edit',
      icon: null,
      onClick: () => {}
    })
    register({
      id: 'chat',
      priority: 1,
      ariaLabel: 'Chat',
      icon: null,
      onClick: () => {}
    })
    render(<FabStack />)

    const labels = screen
      .getAllByRole('button')
      .map((b) => b.getAttribute('aria-label'))
    expect(labels).toEqual(['Chat', 'Edit'])
  })

  it('renders a custom `render` FAB instead of the default button', () => {
    useFabStackStore.getState().register({
      id: 'add',
      priority: 1,
      render: () => (
        <button type='button' aria-label='Add recipe'>
          add
        </button>
      )
    })
    render(<FabStack />)
    expect(
      screen.getByRole('button', { name: 'Add recipe' })
    ).toBeInTheDocument()
  })
})
