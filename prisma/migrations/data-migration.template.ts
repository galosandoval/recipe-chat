// Template for a `data-migration.ts`. Copy into your migration folder and fill in
// the idempotency seam below. See ./README.md for the convention this enforces.
//
// The runner records success on exit 0 and may re-run on failure — so a second run
// against an already-migrated DB MUST be a no-op.
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const BATCH_SIZE = 50

// --- Idempotency seam -------------------------------------------------------
// Return ONLY the rows still needing work. The guard (WHERE ... IS NULL /
// NOT EXISTS) is what makes a re-run a no-op. Adjust the table/columns/guard.
const findUnprocessed = () =>
  prisma.$queryRaw<{ id: string }[]>`
    SELECT t.id AS "id"
    FROM "YourTable" t
    WHERE t."someField" IS NULL
  `
// ----------------------------------------------------------------------------

async function main() {
  // Fail fast if a prerequisite is missing, BEFORE touching data. (Drop this
  // block if the migration needs no external dependency.)
  if (!process.env.SOME_REQUIRED_ENV) {
    console.error('SOME_REQUIRED_ENV is not set — cannot migrate. Aborting.')
    process.exit(1)
  }

  const unprocessed = await findUnprocessed()

  let processed = 0
  for (let i = 0; i < unprocessed.length; i += BATCH_SIZE) {
    const batch = unprocessed.slice(i, i + BATCH_SIZE)
    await prisma.$transaction(
      async (tx) => {
        for (const row of batch) {
          // Set the field the guard checks to a non-null value so the row is
          // excluded on a re-run. Replace the placeholder with your real value.
          const computedValue = `TODO: replace with value derived from ${row.id}`
          await tx.$executeRaw`
            UPDATE "YourTable"
            SET "someField" = ${computedValue}
            WHERE id = ${row.id}
          `
        }
      },
      { maxWait: 5000, timeout: 20000 }
    )
    processed += batch.length
    console.log(`Processed ${processed}/${unprocessed.length}…`)
  }

  // Verify the work landed. Worth doing when a write can fail silently (e.g. an
  // external API call that swallows errors). For a plain UPDATE that throws on
  // failure the catch handler already exits non-zero, so this is optional.
  const stillUnprocessed = await findUnprocessed()
  const done = unprocessed.length - stillUnprocessed.length
  if (unprocessed.length > 0 && done === 0) {
    console.error(
      `Migrated 0 of ${unprocessed.length} rows — writes are failing silently. Aborting.`
    )
    process.exit(1)
  }

  console.log(
    `Done. Migrated ${done}/${unprocessed.length}; ${stillUnprocessed.length} still unprocessed.`
  )
}

main()
  .catch(async (e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => {
    prisma.$disconnect()
  })
