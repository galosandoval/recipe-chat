import { readdirSync, existsSync } from 'node:fs'
import path from 'node:path'

// Folder names under prisma/migrations that contain a data-migration.ts, sorted
// by name (the timestamp prefix gives chronological order). Kept separate from
// the runner so it can be unit-tested without triggering the runner's main().
export function findDataMigrations(migrationsDir: string): string[] {
  return readdirSync(migrationsDir)
    .filter((name) =>
      existsSync(path.join(migrationsDir, name, 'data-migration.ts'))
    )
    .sort()
}
