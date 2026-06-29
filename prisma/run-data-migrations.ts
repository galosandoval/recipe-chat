import { PrismaClient } from '@prisma/client'
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { findDataMigrations } from './find-data-migrations'

const prisma = new PrismaClient()

const MIGRATIONS_DIR = path.join(__dirname, 'migrations')

// Folders whose data-migration.ts already ran in prod before this ledger
// existed. Seeded so the runner never re-runs the non-idempotent ones. New
// migrations added after the cutover are not listed here — they run normally.
const ALREADY_APPLIED = [
  '20250219050052_filter_user_id_not_unique',
  '20250730012052_add_saved_column',
  '20251018212537_add_recipe_slug_with_default',
  '20251018220000_ingredient_structured_fields',
  '20260623000000_backfill_recipe_embeddings'
]

async function recordApplied(name: string) {
  await prisma.$executeRaw`
    INSERT INTO "_data_migrations" (name) VALUES (${name})
    ON CONFLICT (name) DO NOTHING
  `
}

async function main() {
  // Self-bootstrapping meta table (like Prisma's own _prisma_migrations) — not
  // in schema.prisma since the app never queries it.
  await prisma.$executeRawUnsafe(
    `CREATE TABLE IF NOT EXISTS "_data_migrations" (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())`
  )

  // Cutover seed: mark the pre-ledger migrations as applied so they never re-run.
  for (const name of ALREADY_APPLIED) {
    await recordApplied(name)
  }

  const all = findDataMigrations(MIGRATIONS_DIR)
  const appliedRows = await prisma.$queryRaw<
    { name: string }[]
  >`SELECT name FROM "_data_migrations"`
  const applied = new Set(appliedRows.map((row) => row.name))
  const pending = all.filter((name) => !applied.has(name))

  console.log(`${pending.length} pending data migration(s).`)

  for (const name of pending) {
    const file = path.join(MIGRATIONS_DIR, name, 'data-migration.ts')
    console.log(`Running data migration: ${file}`)
    // Subprocess (not import) preserves each migration's own main() /
    // process.exit / PrismaClient lifecycle unchanged.
    const result = spawnSync('bun', [file], {
      stdio: 'inherit',
      env: process.env
    })

    if (result.error || result.status !== 0) {
      // Do NOT record — leaving it unrecorded means it re-runs on the next push
      // instead of silently dropping out of a git diff.
      console.error(
        `Data migration failed: ${name} (exit ${result.status ?? 'spawn error'}). Stopping.`
      )
      process.exit(1)
    }

    await recordApplied(name)
  }

  console.log('Data migrations complete.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => {
    prisma.$disconnect()
  })
