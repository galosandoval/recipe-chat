/**
 * @jest-environment node
 */
import { PrismaClient } from '@prisma/client'
import {
  DB_SERIAL_LOCK_KEY,
  acquireDbSerialLock,
  releaseDbSerialLock,
  disconnectDbSerialLock
} from '~/server/api/test-db-lock'

// This suite drives the lock directly, so it is exempted from the auto-serialize
// hook in jest.setup.ts (which keys off the `/server/api/` path).

/**
 * A second, independent Postgres session standing in for "another Jest worker".
 * Pinned to a single connection so its advisory lock behaves like the helper's.
 */
function rivalSession() {
  const url = new URL(process.env.DATABASE_PRISMA_URL as string)
  url.searchParams.set('connection_limit', '1')
  return new PrismaClient({ datasourceUrl: url.toString() })
}

const tick = () => new Promise((resolve) => setTimeout(resolve, 50))

afterEach(async () => {
  // Disconnecting drops the session and releases any lock it still holds.
  await disconnectDbSerialLock()
})

describe('db serial lock', () => {
  it('blocks a rival session until the holder releases', async () => {
    const rival = rivalSession()
    try {
      await acquireDbSerialLock()

      let rivalAcquired = false
      const rivalAcquire = rival
        .$executeRawUnsafe('SELECT pg_advisory_lock($1)', DB_SERIAL_LOCK_KEY)
        .then(() => {
          rivalAcquired = true
        })

      // While we hold the lock, the rival session must stay blocked.
      await tick()
      expect(rivalAcquired).toBe(false)

      // Releasing lets the rival through.
      await releaseDbSerialLock()
      await rivalAcquire
      expect(rivalAcquired).toBe(true)

      await rival.$executeRawUnsafe(
        'SELECT pg_advisory_unlock($1)',
        DB_SERIAL_LOCK_KEY
      )
    } finally {
      await rival.$disconnect()
    }
  })
})
