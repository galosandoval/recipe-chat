import * as trpcNext from '@trpc/server/adapters/next'
import { appRouter } from '../../../server/router/_app'
import { createContext } from '../../../server/router/context'

// export const t = initTRPC.create({
//   transformer: superjson
// })
// export const appRouter = t.router({
//   hello: t.procedure
//     .input(
//       z
//         .object({
//           text: z.string().nullish()
//         })
//         .nullish()
//     )
//     .query(({ input }) => {
//       return {
//         greeting: `hello ${input?.text ?? 'world'}`
//       }
//     })
// })

// // export type definition of API
// export type AppRouter = typeof appRouter

// export API handler
export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext
})
// // src/pages/api/trpc/[trpc].ts
// import { createNextApiHandler } from '@trpc/server/adapters/next'
// import { env } from '../../../env/server.mjs'
// import { appRouter } from '../../../server/router'
// import { createContext } from '../../../server/router/context'

// // export API handler
// export default createNextApiHandler({
//   router: appRouter,
//   createContext,
//   onError:
//     env.NODE_ENV === 'development'
//       ? ({ path, error }) => {
//           console.error(`❌ tRPC failed on ${path}: ${error}`)
//         }
//       : undefined
// })
