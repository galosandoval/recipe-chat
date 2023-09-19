import { chatRouter } from './routers/chat/router'
import { filterRouter } from './routers/filter/router'
import { listRouter } from './routers/list/router'
import { recipeRouter } from './routers/recipe/router'
import { userRouter } from './routers/user/router'
import { createTRPCRouter } from './trpc'

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  recipe: recipeRouter,
  list: listRouter,
  chat: chatRouter,
  user: userRouter,
  filter: filterRouter
})

// export type definition of API
export type AppRouter = typeof appRouter
