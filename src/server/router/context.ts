// src/server/router/context.ts
import * as trpc from '@trpc/server'
import * as trpcNext from '@trpc/server/adapters/next'
import { prisma } from '../db/client'

export const createContext = async (
  opts?: trpcNext.CreateNextContextOptions
) => {
  return {
    req: opts?.req,
    prisma,
    recipe: prisma.recipe,
    list: prisma.list
  }
}
export type Context = trpc.inferAsyncReturnType<typeof createContext>
