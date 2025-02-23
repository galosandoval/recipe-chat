import { createCallerFactory, createTRPCRouter } from '~/server/api/trpc'
import { filtersRouter } from './routers/filters'
import { chatsRouter } from './routers/chats'
import { listsRouter } from './routers/lists'
import { recipesRouter } from './routers/recipes'
import { usersRouter } from './routers/users'

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
	chats: chatsRouter,
	filters: filtersRouter,
	lists: listsRouter,
	recipes: recipesRouter,
	users: usersRouter
})

// export type definition of API
export type AppRouter = typeof appRouter

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter)
