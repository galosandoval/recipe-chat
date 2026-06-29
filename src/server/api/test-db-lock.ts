import { PrismaClient } from '@prisma/client'

/**
 * Postgres advisory-lock key shared by every backend integration test. A single
 * key means all DB-touching suites contend on one global lock, so there is no
 * lock-ordering deadlock possible — only one worker mutates the shared test DB
 * at a time. The value encodes issue #502 for traceability; it is otherwise
 * arbitrary and must simply be stable across processes.
 */
export const DB_SERIAL_LOCK_KEY = 4011502

/**
 * Pin the lock client to a single Postgres connection. A session-level advisory
 * lock lives on the connection that acquired it, so acquire and release must run
 * on the *same* connection — a multi-connection pool could release on a different
 * one and leave the lock dangling.
 */
function singleConnectionUrl(): string {
  const base = process.env.DATABASE_PRISMA_URL
  if (!base) {
    throw new Error(
      'DATABASE_PRISMA_URL must be set for backend integration tests'
    )
  }
  const url = new URL(base)
  url.searchParams.set('connection_limit', '1')
  return url.toString()
}

/**
 * A dedicated, single-connection Prisma client used only to hold the cross-worker
 * advisory lock. Kept separate from `testPrisma` (which pools connections for the
 * suites' actual queries) so the lock's session is never shared or recycled.
 */
let lockClient: PrismaClient | null = null

function client(): PrismaClient {
  if (!lockClient) {
    lockClient = new PrismaClient({ datasourceUrl: singleConnectionUrl() })
  }
  return lockClient
}

/**
 * Block until this worker holds the global integration-test lock. Jest runs test
 * files in parallel workers by default; without serialization their concurrent
 * writes/truncates against the shared Postgres DB deadlock (`40P01`) or clobber
 * each other's rows. Acquiring this lock before each test makes even a bare
 * `npx jest` (full parallel run) safe, while leaving non-DB unit suites parallel.
 */
export async function acquireDbSerialLock(): Promise<void> {
  await client().$executeRawUnsafe(
    'SELECT pg_advisory_lock($1)',
    DB_SERIAL_LOCK_KEY
  )
}

/** Release the global integration-test lock so the next waiting worker proceeds. */
export async function releaseDbSerialLock(): Promise<void> {
  await client().$executeRawUnsafe(
    'SELECT pg_advisory_unlock($1)',
    DB_SERIAL_LOCK_KEY
  )
}

/** Close the lock connection at suite teardown; releases any locks it still holds. */
export async function disconnectDbSerialLock(): Promise<void> {
  if (lockClient) {
    await lockClient.$disconnect()
    lockClient = null
  }
}
