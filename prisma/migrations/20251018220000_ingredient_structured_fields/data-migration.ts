import { PrismaClient } from '@prisma/client'
import { parseIngredientName } from '../../../src/lib/parse-ingredient'

const prisma = new PrismaClient()

const BATCH_SIZE = 50

async function main() {
  const ingredients = await prisma.ingredient.findMany({
    select: { id: true, name: true }
  })

  let updated = 0
  for (let i = 0; i < ingredients.length; i += BATCH_SIZE) {
    const batch = ingredients.slice(i, i + BATCH_SIZE)
    await prisma.$transaction(
      async (tx) => {
        for (const ing of batch) {
          const parsed = parseIngredientName(ing.name)
          await tx.ingredient.update({
            where: { id: ing.id },
            data: {
              quantity: parsed.quantity,
              unit: parsed.unit,
              unit_type: parsed.unit_type,
              item_name: parsed.item_name,
              preparation: parsed.preparation,
              raw_string: parsed.raw_string
            }
          })
        }
      },
      { maxWait: 5000, timeout: 15000 }
    )
    updated += batch.length
    console.log(`Updated ${updated}/${ingredients.length} ingredients…`)
  }

  console.log(
    `Done. Updated ${ingredients.length} ingredients with structured fields and raw_string backfill.`
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
