import { PrismaPg } from '@prisma/adapter-pg'
import { type Prisma, PrismaClient } from '~/generated/prisma/client'

type CreatePrismaClientOptions = Prisma.PrismaClientBaseOptions & {
  /** Defaults to `DATABASE_PRISMA_URL` (the pooled connection). */
  connectionString?: string
  /** Cap on the underlying `pg` pool — used to pin a client to one session. */
  maxConnections?: number
}

/** Hosts that serve plain TCP, where forcing TLS would break the connection. */
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1', '0.0.0.0'])

/**
 * Decide whether the adapter must turn TLS on for `url`.
 *
 * Prisma 6's Rust engine negotiated TLS by default; `node-postgres` — which
 * owns the connection since the move to driver adapters — defaults to plain
 * TCP instead. Managed Postgres (Neon, and Vercel Postgres on top of it)
 * refuses insecure connections with SQLSTATE 28000, which Prisma reports as
 * `P1010 "User was denied access on the database"` — an authentication error
 * for what is really a missing `sslmode`. Vercel's injected
 * `DATABASE_PRISMA_URL` carries no `sslmode`, and the storage integration
 * rewrites that variable, so the default cannot live in the environment.
 *
 * An explicit `sslmode` in the URL always wins, and local databases are left
 * on plain TCP.
 */
function needsTls(url: string): boolean {
  let host: string

  try {
    host = new URL(url).hostname
  } catch {
    // Not a parseable URL — leave the connection exactly as given rather than
    // layering a guess on top of a string `pg` may still understand.
    return false
  }

  if (/[?&]sslmode=/.test(url)) return false

  return !LOCAL_HOSTS.has(host)
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

  const adapter = new PrismaPg({
    connectionString: url,
    max: maxConnections,
    // Managed providers terminate the handshake before presenting a
    // certificate chain the public CA bundle can verify, so verification is
    // off; the transport is still encrypted.
    ...(needsTls(url) ? { ssl: { rejectUnauthorized: false } } : {})
  })

  return new PrismaClient({ ...options, adapter })
}
