import '@testing-library/jest-dom'
import { screen } from '@testing-library/react'
import { renderWithTranslations, en } from '~/lib/test-translations'

let mockPathname = '/chat'
let mockSession: { data: unknown } = { data: { user: { id: '1' } } }

jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
  useParams: () => ({ slug: 'seeded-recipe' }),
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
  useSearchParams: () => new URLSearchParams()
}))

jest.mock('next-auth/react', () => ({
  useSession: () => mockSession,
  signOut: jest.fn()
}))

// The real settings menu drags in tRPC and a pile of dialogs; the sidebar only
// needs to surface its trigger, so stub it to a labelled button.
jest.mock('./settings-dropdown-menu', () => ({
  NavDropdownMenu: () => <button aria-label={en.nav.settings}>settings</button>
}))

// Imported after the mocks so the components pick them up.
import { AppSidebar, BottomNav } from './app-header'

describe('AppSidebar', () => {
  beforeEach(() => {
    mockPathname = '/chat'
    mockSession = { data: { user: { id: '1' } } }
  })

  it('renders the nav affordances with their accessible names', () => {
    renderWithTranslations(<AppSidebar />)

    expect(
      screen.getByRole('button', { name: en.nav.chat })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: en.nav.recipes })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: en.nav.lists })
    ).toBeInTheDocument()
  })

  it('surfaces the settings menu and chat-history affordance', () => {
    renderWithTranslations(<AppSidebar />)

    expect(
      screen.getByRole('button', { name: en.nav.settings })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: en.chat.history.title })
    ).toBeInTheDocument()
  })

  it('marks the active tab with aria-current="page"', () => {
    mockPathname = '/recipes'
    renderWithTranslations(<AppSidebar />)

    expect(
      screen.getByRole('button', { name: en.nav.recipes })
    ).toHaveAttribute('aria-current', 'page')
    expect(
      screen.getByRole('button', { name: en.nav.chat })
    ).not.toHaveAttribute('aria-current')
  })

  it('is hidden below md and shown at md+', () => {
    const { container } = renderWithTranslations(<AppSidebar />)

    const aside = container.querySelector('aside')
    expect(aside).toHaveClass('hidden', 'md:flex')
  })

  it('does not render when signed out', () => {
    mockSession = { data: null }
    const { container } = renderWithTranslations(<AppSidebar />)

    expect(container.querySelector('aside')).not.toBeInTheDocument()
  })

  it('does not render on the recipe detail screen', () => {
    mockPathname = '/recipes/seeded-recipe'
    const { container } = renderWithTranslations(<AppSidebar />)

    expect(container.querySelector('aside')).not.toBeInTheDocument()
  })
})

describe('BottomNav', () => {
  beforeEach(() => {
    mockPathname = '/chat'
    mockSession = { data: { user: { id: '1' } } }
  })

  it('keeps the active tab treatment and aria-current after the sidebar move', () => {
    renderWithTranslations(<BottomNav />)

    expect(screen.getByRole('button', { name: en.nav.chat })).toHaveAttribute(
      'aria-current',
      'page'
    )
    expect(
      screen.getByRole('button', { name: en.nav.recipes })
    ).not.toHaveAttribute('aria-current')
  })

  it('does not render on the recipe detail screen', () => {
    mockPathname = '/recipes/seeded-recipe'
    renderWithTranslations(<BottomNav />)

    expect(
      screen.queryByRole('button', { name: en.nav.chat })
    ).not.toBeInTheDocument()
  })
})
