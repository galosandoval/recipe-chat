/**
 * @jest-environment node
 */
import { PrismaPg } from '@prisma/adapter-pg'
import { createPrismaClient } from './prisma-client'

jest.mock('@prisma/adapter-pg', () => ({
  PrismaPg: jest.fn()
}))

jest.mock('~/generated/prisma/client', () => ({
  PrismaClient: jest.fn()
}))

const adapterMock = PrismaPg as unknown as jest.Mock

/** The adapter config `createPrismaClient` handed to `PrismaPg`. */
function adapterConfig() {
  return adapterMock.mock.calls[0][0]
}

const MANAGED_URL =
  'postgres://default:pw@ep-test-pooler.us-east-1.postgres.vercel-storage.com/verceldb?pgbouncer=true&connect_timeout=15'
const LOCAL_URL = 'postgresql://postgres:pw@127.0.0.1:5432/recipe-chat'

describe('createPrismaClient', () => {
  beforeEach(() => {
    adapterMock.mockClear()
  })

  it('turns TLS on for a managed host whose URL omits sslmode', () => {
    createPrismaClient({ connectionString: MANAGED_URL })

    expect(adapterConfig().ssl).toEqual({ rejectUnauthorized: false })
  })

  it('leaves a local database on plain TCP', () => {
    createPrismaClient({ connectionString: LOCAL_URL })

    expect(adapterConfig().ssl).toBeUndefined()
  })

  it('leaves an explicit sslmode in the URL untouched', () => {
    createPrismaClient({ connectionString: `${MANAGED_URL}&sslmode=disable` })

    expect(adapterConfig().ssl).toBeUndefined()
  })

  it('falls back to DATABASE_PRISMA_URL', () => {
    process.env.DATABASE_PRISMA_URL = MANAGED_URL

    createPrismaClient()

    expect(adapterConfig().connectionString).toBe(MANAGED_URL)
  })

  it('throws when no connection string is available', () => {
    process.env.DATABASE_PRISMA_URL = ''

    expect(() => createPrismaClient()).toThrow(
      'DATABASE_PRISMA_URL must be set'
    )
  })
})
