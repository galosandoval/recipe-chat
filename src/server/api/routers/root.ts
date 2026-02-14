import { chatsRouter } from './chats-router'
import { filtersRouter } from './filters-router'
import { listsRouter } from './lists-router'
import { recipesRouter } from './recipes-router'
import { userRouter } from './users-router'
import { createCallerFactory, createTRPCRouter } from '../trpc'
import { ingredientsRouter } from './ingredients-router'

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
  filters: filtersRouter,
  ingredients: ingredientsRouter
})

// export type definition of API
export type AppRouter = typeof appRouter

export const createCaller = createCallerFactory(appRouter)
