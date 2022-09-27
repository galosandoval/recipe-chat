import { listRouter } from './list'
import { helloRouter } from './example'
import { t } from './trpc'
import { recipeRouter } from './recipe'

export const appRouter = t.router({
  list: listRouter,
  recipe: recipeRouter,
  hello: helloRouter
})

// export type definition of API
export type AppRouter = typeof appRouter
