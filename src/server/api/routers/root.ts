import { chatsRouter } from './chats'
import { filtersRouter } from './filters'
import { listsRouter } from './lists'
import { recipesRouter } from './recipes'
import { userRouter } from './users'
import { createCallerFactory, createTRPCRouter } from '../trpc'

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  recipes: recipesRouter,
  lists: listsRouter,
  chats: chatsRouter,
  users: userRouter,
  filters: filtersRouter
})

// export type definition of API
export type AppRouter = typeof appRouter

export const createCaller = createCallerFactory(appRouter)
