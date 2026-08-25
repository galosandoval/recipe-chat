import '@testing-library/jest-dom'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithTranslations, en } from '~/lib/test-translations'
import { RouteProvider } from '~/lib/test-route-provider'

jest.mock('~/trpc/react', () => {
  const procedure = {
    useQuery: () => ({ data: undefined, isLoading: false }),
    useMutation: () => ({ mutate: jest.fn(), status: 'idle', data: undefined })
  }
  const router = new Proxy({}, { get: () => procedure })
  const api = new Proxy(
    { useUtils: () => new Proxy({}, { get: () => router }) },
    {
      get: (target: Record<string, unknown>, prop: string) =>
        prop in target ? target[prop] : router
    }
  )
  return { api }
})

// Imported after the mock so the menu picks it up.
import { NavDropdownMenu } from './settings-dropdown-menu'

const original = process.env.NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED

afterEach(() => {
  process.env.NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED = original
})

async function openMenu() {
  renderWithTranslations(
    <RouteProvider url='/'>
      <NavDropdownMenu />
    </RouteProvider>
  )

  // The trigger is icon-only, so it is addressed by the popup it controls.
  const trigger = await screen.findByRole('button', { expanded: false })
  // jsdom has no PointerEvent, which is what Radix opens on — the keyboard path
  // opens the same menu.
  fireEvent.keyDown(trigger, { key: 'Enter' })
}

describe('settings menu subscription entry', () => {
  it('is omitted while subscriptions are disabled', async () => {
    delete process.env.NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED

    await openMenu()

    expect(await screen.findByText(en.nav.menu.preferredUnits)).toBeVisible()
    expect(screen.queryByText(en.nav.menu.subscription)).not.toBeInTheDocument()
  })

  it('is present while subscriptions are enabled', async () => {
    process.env.NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED = 'true'

    await openMenu()

    expect(await screen.findByText(en.nav.menu.subscription)).toBeVisible()
  })
})
