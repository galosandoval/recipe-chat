import { TRPCClientError, type TRPCLink } from '@trpc/client'
import { observable } from '@trpc/server/observable'
import type { AppRouter } from '~/server/api/routers/root'

export const SERVER_RENDER_QUERY_ERROR = 'ServerRenderQueryError'

/**
 * Dev-only guard that makes the #545/#590 mistake loud at the moment it happens.
 *
 * A client query that runs during the server-render pass (in practice:
 * `useSuspenseQuery` against an unseeded cache) goes out over HTTP with no
 * session cookie, so `protectedProcedure` answers `UNAUTHORIZED` — a symptom
 * three routes' worth of debugging away from the cause. This link refuses the
 * request instead and names it, pointing at the fix.
 *
 * Nothing should legitimately fetch during that pass: pages fetch in their RSC
 * and seed the cache (`useSeedQueryCache`), and `useQuery`/mutations don't fire
 * server-side.
 */
export function createServerRenderGuardLink(
  isServerRender: () => boolean = () => typeof window === 'undefined'
): TRPCLink<AppRouter> {
  return () =>
    ({ op, next }) =>
      observable((observer) => {
        if (isServerRender()) {
          observer.error(
            TRPCClientError.from(
              new Error(
                `${SERVER_RENDER_QUERY_ERROR}: "${op.path}" ran during the server render pass, where the request carries no session cookie and a protected procedure answers UNAUTHORIZED. Fetch it in the page's RSC and seed the cache with useSeedQueryCache instead.`
              )
            )
          )
          return
        }
        return next(op).subscribe(observer)
      })
}
