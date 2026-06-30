import { execSync } from 'node:child_process'

/**
 * Playwright globalSetup (#523): bring the dedicated e2e database to a known
 * fixture before any spec — or the app server — boots. `migrate reset` drops the
 * schema, re-applies migrations, and runs `prisma/seed.ts`, so every local run
 * starts from the same seeded user + recipe.
 *
 * Env comes from `.env.e2e.local` (loaded by the `test:e2e` script via
 * dotenv-cli). CI is different: it preps a fresh Postgres service with explicit
 * `migrate deploy` + `seed` steps and sets the DB vars as job env, so we skip
 * the reset there and trust those steps.
 */
export default function globalSetup() {
  if (process.env.CI) return

  assertDisposableDatabase()
  execSync('bunx prisma migrate reset --force --skip-generate', {
    stdio: 'inherit'
  })
}

/**
 * Refuse to reset anything but the throwaway e2e database. This wipes the DB, so
 * a misloaded env (e.g. `.env.production` leaking through) must never reach the
 * reset — the URL has to name the e2e database on a local host.
 */
function assertDisposableDatabase() {
  const url =
    process.env.DATABASE_URL_NON_POOLING ??
    process.env.DATABASE_PRISMA_URL ??
    ''
  const isLocal = url.includes('127.0.0.1') || url.includes('localhost')
  const isE2eDb = /recipe[-_]chat[-_]e2e/.test(url)
  if (!isLocal || !isE2eDb) {
    throw new Error(
      `Refusing to reset database: expected a local recipe-chat-e2e URL, got ` +
        `"${url || '(empty)'}". Did .env.e2e.local load? Run via \`bun run test:e2e\`.`
    )
  }
}
