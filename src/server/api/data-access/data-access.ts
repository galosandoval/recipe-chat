import { type PrismaClient } from '@prisma/client'
import type { ITXClientDenyList } from '@prisma/client/runtime/library'
import { prisma as db } from '~/server/db'

/** A Prisma client usable either standalone or as a transaction client. */
export type Db = Omit<PrismaClient, ITXClientDenyList>

/**
 * Base for the data-access layer. Defaults to the app's Prisma singleton, so
 * each access class exports a module-level instance that use cases import
 * directly — no client is threaded through the tRPC context or use-case
 * signatures. Pass a client explicitly only to bind an access to a transaction
 * (`new RecipesAccess(tx)`); see {@link transaction}.
 */
export abstract class DataAccess {
  constructor(protected readonly prisma: Db = db) {}

  transaction<T>(callback: (tx: Db) => Promise<T>) {
    return (this.prisma as PrismaClient).$transaction(callback)
  }
}

/**
 * Transaction entry point for use cases, so they compose multi-access writes
 * without importing the Prisma client themselves. Bind each access you need to
 * the `tx` client inside the callback.
 */
export function transaction<T>(callback: (tx: Db) => Promise<T>) {
  return db.$transaction(callback)
}
