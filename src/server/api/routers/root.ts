import { chatRouter } from './chat/router'
import { filterRouter } from './filter/router'
import { listRouter } from './list/router'
import { recipeRouter } from './recipe/router'
import { userRouter } from './user/router'
import { createTRPCRouter } from '../trpc'

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  recipes: recipeRouter,
  lists: listRouter,
  chats: chatRouter,
  users: userRouter,
  filters: filterRouter
})

// export type definition of API
export type AppRouter = typeof appRouter
