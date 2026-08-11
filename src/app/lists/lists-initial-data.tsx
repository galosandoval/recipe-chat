'use client'

import { api, type RouterOutputs } from '~/trpc/react'
import { useSeedQueryCache } from '~/hooks/use-seed-query-cache'

export type ListsInitialData = {
  /** `lists.byUserId` is the legacy spelling of the Grocery List. */
  groceryList: RouterOutputs['lists']['byUserId']
  pantry: RouterOutputs['pantry']['byUserId']
  user: RouterOutputs['users']['get']
}

/**
 * Seeds the three queries `/lists` renders from — the Grocery List, the Pantry
 * (both tabs are fetched so switching is instant) and the user's preferred
 * units — with the data the page already fetched in its authenticated RSC.
 *
 * All three are read with `useSuspenseQuery`, so the cache must be warm before
 * the children render; see {@link useSeedQueryCache} (#590).
 */
export function ListsInitialDataProvider({
  userId,
  data,
  children
}: {
  userId: string
  data: ListsInitialData
  children: React.ReactNode
}) {
  const utils = api.useUtils()
  useSeedQueryCache(() => {
    utils.lists.byUserId.setData({ userId }, data.groceryList)
    utils.pantry.byUserId.setData({ userId }, data.pantry)
    utils.users.get.setData(undefined, data.user)
  })
  return <>{children}</>
}
