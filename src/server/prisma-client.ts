import { PrismaPg } from '@prisma/adapter-pg'
import { type Prisma, PrismaClient } from '~/generated/prisma/client'

type CreatePrismaClientOptions = Prisma.PrismaClientBaseOptions & {
  /** Defaults to `DATABASE_PRISMA_URL` (the pooled connection). */
  connectionString?: string
  /** Cap on the underlying `pg` pool — used to pin a client to one session. */
  maxConnections?: number
}

/**
 * Build a Prisma client wired to the `pg` driver adapter.
 *
 * Since Prisma 7 the client no longer reads the datasource URL from
 * `schema.prisma`: `new PrismaClient()` throws unless an adapter is supplied,
 * and the adapter owns the connection string. Every client in the app, the
 * seed/data-migration scripts and the test helpers goes through here so that
 * wiring lives in exactly one place.
 */
export function createPrismaClient({
  connectionString,
  maxConnections,
  ...options
}: CreatePrismaClientOptions = {}): PrismaClient {
  const url = connectionString ?? process.env.DATABASE_PRISMA_URL

  if (!url) {
    throw new Error(
      'DATABASE_PRISMA_URL must be set to create a Prisma client (or pass connectionString).'
    )
  }

  const adapter = new PrismaPg({ connectionString: url, max: maxConnections })

  return new PrismaClient({ ...options, adapter })
}
