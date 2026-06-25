import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Pre-migration recipes had no `saved` value, so treat them all as saved.
  // Idempotency guard: `saved` is BOOLEAN NOT NULL DEFAULT false, so `IS NULL`
  // matches nothing on a re-run — the update is a no-op and never re-saves a
  // recipe the user has since unsaved.
  const updated = await prisma.$executeRaw`
    UPDATE "Recipe" SET saved = true WHERE saved IS NULL
  `
  console.log(`Set saved = true on ${updated} recipe(s).`)
}

main()
  .catch(async (e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => {
    prisma.$disconnect()
  })
