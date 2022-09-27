import { listsRouter } from './list'
import { helloRouter } from './example'
import { t } from './trpc'

export const appRouter = t.router({
  lists: listsRouter,
  hello: helloRouter
})

// export type definition of API
export type AppRouter = typeof appRouter
