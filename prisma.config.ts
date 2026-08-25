import 'dotenv/config'
import { defineConfig } from 'prisma/config'

/**
 * Direct (non-pooling) connection used by the Prisma CLI for migrations and
 * introspection. The app itself connects through the pooled URL via the
 * `@prisma/adapter-pg` driver adapter in `src/server/db.ts` — since Prisma 7
 * the datasource block in `schema.prisma` no longer carries any URLs.
 */
const migrationUrl =
  process.env.DATABASE_URL_NON_POOLING ?? process.env.DATABASE_PRISMA_URL ?? ''

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: migrationUrl
  },
  migrations: {
    path: 'prisma/migrations',
    seed: 'bun prisma/seed.ts'
  }
})
