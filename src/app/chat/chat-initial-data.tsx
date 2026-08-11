'use client'

import { api, type RouterOutputs } from '~/trpc/react'
import { useSeedQueryCache } from '~/hooks/use-seed-query-cache'

export type ChatInitialData = {
  tasteProfile: RouterOutputs['tasteProfile']['get']
  filters: RouterOutputs['filters']['getByUserId']
  pantry: RouterOutputs['pantry']['byUserId']
}

/**
 * Seeds the queries `<ChatWelcome>` reads — the taste profile (which is `null`
 * for a brand-new user, and is what auto-opens the quiz), the user's filters and
 * the pantry — with data the page fetched in its authenticated RSC.
 *
 * Without the seed each surface fires its own request after mount and flashes a
 * loading state in, and the pantry's `useSuspenseQuery` would fetch during the
 * server-render pass without a session cookie (#590). See
 * {@link useSeedQueryCache}.
 */
export function ChatInitialDataProvider({
  userId,
  data,
  children
}: {
  userId: string
  data: ChatInitialData
  children: React.ReactNode
}) {
  const utils = api.useUtils()
  useSeedQueryCache(() => {
    utils.tasteProfile.get.setData(undefined, data.tasteProfile)
    utils.filters.getByUserId.setData({ userId }, data.filters)
    utils.pantry.byUserId.setData({ userId }, data.pantry)
  })
  return <>{children}</>
}
