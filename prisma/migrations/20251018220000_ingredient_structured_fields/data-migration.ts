import { PrismaClient } from '@prisma/client'
import { parseIngredientName } from '../../../src/lib/parse-ingredient'

const prisma = new PrismaClient()

async function main() {
  const ingredients = await prisma.ingredient.findMany({
    select: { id: true, name: true }
  })

  await prisma.$transaction(
    async (tx) => {
      for (const ing of ingredients) {
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
      console.log(
        `Updated ${ingredients.length} ingredients with structured fields and raw_string backfill.`
      )
    },
    {
      maxWait: 5000,
      timeout: 60000
    }
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
