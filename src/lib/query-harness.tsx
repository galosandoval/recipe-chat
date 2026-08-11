import { type ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { observable } from '@trpc/server/observable'
import { api } from '~/trpc/react'

/**
 * Renders `children` against a real React Query cache wired to a tRPC client
 * whose single terminal link records every operation and answers it from
 * `responses` (keyed by procedure path).
 *
 * `onOp` therefore fires once per genuine network request — the exact thing
 * #545/#590 are about (an unauthenticated server-render refetch of a protected
 * procedure). A page that seeds its caches correctly should drive that count to
 * zero.
 */
export function QueryHarness({
  children,
  onOp,
  responses = {}
}: {
  children: ReactNode
  onOp?: (path: string) => void
  responses?: Record<string, unknown>
}) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: 30 * 1000 } }
  })
  const trpcClient = api.createClient({
    links: [
      () =>
        ({ op }) =>
          observable((observer) => {
            onOp?.(op.path)
            observer.next({ result: { data: responses[op.path] ?? null } })
            observer.complete()
          })
    ]
  })
  return (
    <QueryClientProvider client={queryClient}>
      <api.Provider client={trpcClient} queryClient={queryClient}>
        {children}
      </api.Provider>
    </QueryClientProvider>
  )
}
