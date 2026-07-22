import '@testing-library/jest-dom'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithTranslations, en } from '~/lib/test-translations'

const mockReplace = jest.fn()
let searchParamsValue = new URLSearchParams()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
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
    mockReplace.mockClear()
    searchParamsValue = new URLSearchParams()
  })

  it('renders both List and Pantry tabs', () => {
    renderWithTranslations(<ListsView />)

    expect(screen.getByRole('tab', { name: en.nav.list })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: en.nav.pantry })).toBeInTheDocument()
  })

  it('defaults to the List tab when no tab param is present', () => {
    renderWithTranslations(<ListsView />)

    expect(screen.getByText('list-content')).toBeInTheDocument()
    expect(screen.queryByText('pantry-content')).not.toBeInTheDocument()
    expect(screen.getByRole('tab', { name: en.nav.list })).toHaveAttribute(
      'aria-selected',
      'true'
    )
  })

  it('swaps to pantry content on tap and returns to the list', () => {
    renderWithTranslations(<ListsView />)

    fireEvent.click(screen.getByRole('tab', { name: en.nav.pantry }))
    expect(screen.getByText('pantry-content')).toBeInTheDocument()
    expect(screen.queryByText('list-content')).not.toBeInTheDocument()
    expect(mockReplace).toHaveBeenCalledWith('/lists?tab=pantry', {
      scroll: false
    })

    fireEvent.click(screen.getByRole('tab', { name: en.nav.list }))
    expect(screen.getByText('list-content')).toBeInTheDocument()
    expect(screen.queryByText('pantry-content')).not.toBeInTheDocument()
    expect(mockReplace).toHaveBeenCalledWith('/lists?tab=list', {
      scroll: false
    })
  })

  it('honors an initial tab=pantry param', () => {
    searchParamsValue = new URLSearchParams('tab=pantry')
    renderWithTranslations(<ListsView />)

    expect(screen.getByText('pantry-content')).toBeInTheDocument()
    expect(screen.queryByText('list-content')).not.toBeInTheDocument()
  })

  it('passes the active tab to the chat fab context', () => {
    renderWithTranslations(<ListsView />)
    expect(screen.getByTestId('chat-fab')).toHaveTextContent('list')

    fireEvent.click(screen.getByRole('tab', { name: en.nav.pantry }))
    expect(screen.getByTestId('chat-fab')).toHaveTextContent('pantry')
  })
})
