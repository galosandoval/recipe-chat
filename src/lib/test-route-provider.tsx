import type { ReactNode } from 'react'
import { SessionProvider } from 'next-auth/react'
import type { Session } from 'next-auth'
import { AppRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import {
  PathParamsContext,
  PathnameContext,
  SearchParamsContext
} from 'next/dist/shared/lib/hooks-client-context.shared-runtime'

/** Far enough out that `SessionProvider` never treats it as stale mid-test. */
export const testSession: Session = {
  user: { id: 'user-1', listId: 'list-1', subscriptionTier: 'FREE' },
  expires: '2099-01-01T00:00:00.000Z'
}

/**
 * Feeds the real `usePathname`/`useSearchParams`/`useParams` off a URL instead
 * of mocking them, so a route is expressed the way it is in the address bar and
 * the component runs the same navigation hooks it does in the app.
 *
 * Pass `session={null}` to render as a signed-out visitor, and `params` for
 * routes with dynamic segments (e.g. `{ slug: 'pesto' }`).
 */
export function RouteProvider({
  url,
  session = testSession,
  params = {},
  children
}: {
  url: string
  session?: Session | null
  params?: Record<string, string>
  children: ReactNode
}) {
  const { pathname, searchParams } = new URL(url, 'http://localhost')

  return (
    <AppRouterContext.Provider value={{ push: jest.fn() } as never}>
      <PathnameContext.Provider value={pathname}>
        <SearchParamsContext.Provider value={searchParams}>
          <PathParamsContext.Provider value={params}>
            <SessionProvider session={session} refetchInterval={0}>
              {children}
            </SessionProvider>
          </PathParamsContext.Provider>
        </SearchParamsContext.Provider>
      </PathnameContext.Provider>
    </AppRouterContext.Provider>
  )
}
