import { z } from 'zod'
import { t } from './trpc'

export const helloRouter = t.router({
  hello: t.procedure
    .input(
      z
        .object({
          text: z.string().nullish()
        })
        .nullish()
    )
    .query(({ input }) => {
      return {
        greeting: `hello ${input?.text ?? 'world'}`
      }
    })
})
