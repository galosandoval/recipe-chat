import { authRouter } from './routers/auth'
import { listRouter } from './routers/list'
import { recipeRouter } from './routers/recipe'
import { createTRPCRouter } from './trpc'

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  recipes: recipeRouter,
  auth: authRouter,
  list: listRouter
})

// export type definition of API
export type AppRouter = typeof appRouter
