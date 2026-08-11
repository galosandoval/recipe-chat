import 'server-only'

import { headers } from 'next/headers'
import { cache } from 'react'

import { createCaller } from '~/server/api/routers/root'
import { createTRPCContext } from '~/server/api/trpc'

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a tRPC call from a React Server Component.
 */
const createContext = cache(async () => {
  const heads = new Headers(await headers())
  heads.set('x-trpc-source', 'rsc')

  return createTRPCContext({
    headers: heads
  })
})

/**
 * Server-side caller: `await api.recipes.bySlug({ slug })` returns data directly.
 *
 * Deliberately a plain caller rather than `createHydrationHelpers`, so there is
 * no `prefetch`/`HydrateClient` to reach for. That pattern broke three times the
 * same way (#545, #590): client components read with `useSuspenseQuery`, which
 * runs during the server-render pass before hydration warms the cache, so it
 * refetches over HTTP with no session cookie and `protectedProcedure` answers
 * `UNAUTHORIZED`. Fetch here, then seed the client cache during render — see
 * `useSeedQueryCache` and the `*InitialDataProvider` next to each page.
 */
export const api = createCaller(createContext)
