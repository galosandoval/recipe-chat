import { mergeRouters } from '../trpc'
import { recipesRouter } from './recipes'

export const appRouter = mergeRouters(recipesRouter)

// export type definition of API
export type AppRouter = typeof appRouter
