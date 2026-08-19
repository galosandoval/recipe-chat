import { screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { SessionProvider } from 'next-auth/react'
import type { Session } from 'next-auth'
import { AppRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import {
  PathParamsContext,
  PathnameContext,
  SearchParamsContext
} from 'next/dist/shared/lib/hooks-client-context.shared-runtime'
import { BottomNav } from './app-header'
import { renderWithTranslations, en } from '~/lib/test-translations'

/** Far enough out that `SessionProvider` never treats it as stale mid-test. */
const session: Session = {
  user: { id: 'user-1', listId: 'list-1', subscriptionTier: 'FREE' },
  expires: '2099-01-01T00:00:00.000Z'
}

/**
 * Feeds the real `usePathname`/`useSearchParams`/`useParams` off a URL instead
 * of mocking them, so a route is expressed the way it is in the address bar and
 * the component runs the same navigation hooks it does in the app.
 */
function RouteProvider({
  url,
  children
}: {
  url: string
  children: ReactNode
}) {
  const { pathname, searchParams } = new URL(url, 'http://localhost')

  return (
    <AppRouterContext.Provider value={{ push: jest.fn() } as never}>
      <PathnameContext.Provider value={pathname}>
        <SearchParamsContext.Provider value={searchParams}>
          <PathParamsContext.Provider value={{}}>
            <SessionProvider session={session} refetchInterval={0}>
              {children}
            </SessionProvider>
          </PathParamsContext.Provider>
        </SearchParamsContext.Provider>
      </PathnameContext.Provider>
    </AppRouterContext.Provider>
  )
}

const renderNav = (url: string) =>
  renderWithTranslations(
    <RouteProvider url={url}>
      <BottomNav />
    </RouteProvider>
  )

const currentTab = () => document.querySelector('[aria-current="page"]')

const tabFor = (label: string) => screen.getByText(label).closest('button')!

it('marks the tab matching the current route as the current page', () => {
  renderNav('/recipes')

  expect(currentTab()?.textContent).toBe(en.nav.recipes)
})

it('marks a tab current on nested routes under it', () => {
  renderNav('/chat/history?scope=recipes')

  expect(currentTab()?.textContent).toBe(en.nav.chat)
})

/**
 * The bug was never the `aria-current` logic — it was that the active plate
 * (`bg-card`) sat 0.005 lightness off `--background` and so read as unstyled.
 * Pin the plate itself, or the same invisible highlight can come back green.
 */
it('gives only the current tab a filled plate', () => {
  renderNav('/lists')

  expect(tabFor(en.nav.lists).className).toContain('bg-primary')
  expect(tabFor(en.nav.chat).className).not.toContain('bg-primary')
  expect(document.querySelectorAll('[aria-current="page"]')).toHaveLength(1)
})
