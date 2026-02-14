import { PrismaClient } from '@prisma/client'
import { parseIngredientName } from '../../../src/lib/parse-ingredient'

const prisma = new PrismaClient()

const BATCH_SIZE = 50

async function main() {
  // Table still has "name" at migration time; Prisma client no longer does, so use raw query
  const ingredients = await prisma.$queryRaw<{ id: string; name: string }[]>`
    SELECT id, name FROM "Ingredient"
  `

  let updated = 0
  for (let i = 0; i < ingredients.length; i += BATCH_SIZE) {
    const batch = ingredients.slice(i, i + BATCH_SIZE)
    await prisma.$transaction(
      async (tx) => {
        for (const ing of batch) {
          const parsed = parseIngredientName(ing.name)
          // Use raw SQL: at migration time columns are still unit_type/item_name (before rename migration)
          await tx.$executeRaw`
            UPDATE "Ingredient"
            SET quantity = ${parsed.quantity},
                unit = ${parsed.unit},
                unit_type = ${parsed.unitType}::"IngredientUnitType",
                item_name = ${parsed.itemName},
                preparation = ${parsed.preparation},
                raw_string = ${parsed.rawString}
            WHERE id = ${ing.id}
          `
        }
      },
      { maxWait: 5000, timeout: 15000 }
    )
    updated += batch.length
    console.log(`Updated ${updated}/${ingredients.length} ingredients…`)
  }

  console.log(
    `Done. Updated ${ingredients.length} ingredients with structured fields and rawString backfill.`
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
