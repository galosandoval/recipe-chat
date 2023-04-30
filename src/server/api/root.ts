import { authRouter } from './routers/authRouter'
import { listRouter } from './routers/listRouter'
import { recipeRouter } from './routers/recipeRouter'
import { createTRPCRouter } from './trpc'

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  recipe: recipeRouter,
  auth: authRouter,
  list: listRouter
})

// export type definition of API
export type AppRouter = typeof appRouter
