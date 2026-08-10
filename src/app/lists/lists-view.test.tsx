import '@testing-library/jest-dom'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithTranslations, en } from '~/lib/test-translations'

let searchParamsValue = new URLSearchParams()

// Stands in for Next's history sync: `pushState` updates the URL, and Next
// re-renders consumers of `useSearchParams` from it.
const mockPushState = jest.fn(
  (_state: unknown, _title: string, url: string) => {
    searchParamsValue = new URLSearchParams(url.split('?')[1] ?? '')
  }
)

jest.mock('next/navigation', () => ({
  useSearchParams: () => searchParamsValue,
  usePathname: () => '/lists'
}))

jest.mock('~/app/list/list-by-user-id', () => ({
  ListByUserId: () => <div>list-content</div>
}))

jest.mock('~/app/pantry/pantry-by-user-id', () => ({
  PantryByUserId: () => <div>pantry-content</div>
}))

jest.mock('~/components/chat-panel', () => ({
  ChatFab: ({ context }: { context: { page: string } }) => (
    <div data-testid='chat-fab'>{context.page}</div>
  )
}))

jest.mock('~/hooks/use-resume-chat', () => ({
  useResumeChat: () => undefined
}))

// Imported after the mocks so the component picks them up.
import { ListsView } from './lists-view'

describe('ListsView', () => {
  beforeEach(() => {
    mockPushState.mockClear()
    searchParamsValue = new URLSearchParams()
    window.history.pushState = mockPushState as unknown as History['pushState']
  })

  it('renders both Grocery List and Pantry tabs', () => {
    renderWithTranslations(<ListsView />)

    expect(screen.getByRole('tab', { name: en.nav.list })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: en.nav.pantry })).toBeInTheDocument()
  })

  it('defaults to the Grocery List tab when no tab param is present', () => {
    renderWithTranslations(<ListsView />)

    expect(screen.getByText('list-content')).toBeInTheDocument()
    expect(screen.queryByText('pantry-content')).not.toBeInTheDocument()
    expect(screen.getByRole('tab', { name: en.nav.list })).toHaveAttribute(
      'aria-selected',
      'true'
    )
  })

  it('swaps to pantry content on tap and returns to the list', () => {
    const { rerender } = renderWithTranslations(<ListsView />)

    fireEvent.click(screen.getByRole('tab', { name: en.nav.pantry }))
    expect(mockPushState).toHaveBeenCalledWith(null, '', '/lists?tab=pantry')
    rerender(<ListsView />)
    expect(screen.getByText('pantry-content')).toBeInTheDocument()
    expect(screen.queryByText('list-content')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('tab', { name: en.nav.list }))
    expect(mockPushState).toHaveBeenCalledWith(null, '', '/lists?tab=list')
    rerender(<ListsView />)
    expect(screen.getByText('list-content')).toBeInTheDocument()
    expect(screen.queryByText('pantry-content')).not.toBeInTheDocument()
  })

  it('follows the tab param when history changes (back/forward)', () => {
    const { rerender } = renderWithTranslations(<ListsView />)
    expect(screen.getByText('list-content')).toBeInTheDocument()

    // Simulates popping back to an entry whose URL carries `tab=pantry`.
    searchParamsValue = new URLSearchParams('tab=pantry')
    rerender(<ListsView />)

    expect(screen.getByText('pantry-content')).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: en.nav.pantry })).toHaveAttribute(
      'aria-selected',
      'true'
    )
  })

  it('honors an initial tab=pantry param', () => {
    searchParamsValue = new URLSearchParams('tab=pantry')
    renderWithTranslations(<ListsView />)

    expect(screen.getByText('pantry-content')).toBeInTheDocument()
    expect(screen.queryByText('list-content')).not.toBeInTheDocument()
  })

  it('passes the active tab to the chat fab context', () => {
    const { rerender } = renderWithTranslations(<ListsView />)
    expect(screen.getByTestId('chat-fab')).toHaveTextContent('list')

    fireEvent.click(screen.getByRole('tab', { name: en.nav.pantry }))
    rerender(<ListsView />)
    expect(screen.getByTestId('chat-fab')).toHaveTextContent('pantry')
  })
})
