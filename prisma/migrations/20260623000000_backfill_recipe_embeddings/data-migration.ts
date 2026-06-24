import { PrismaClient } from '@prisma/client'
import { embedRecipeById } from '../../../src/server/api/use-cases/embed-recipe-use-case'

const prisma = new PrismaClient()

const BATCH_SIZE = 25

async function main() {
  // Recipes that own a user but have no embedding yet — these were created while
  // the embedding insert was silently failing (see issue #481). Idempotent:
  // re-running only embeds recipes still missing a RecipeVector row.
  const missing = await prisma.$queryRaw<{ id: string; userId: string }[]>`
    SELECT r.id AS "id", r."userId" AS "userId"
    FROM "Recipe" r
    WHERE r."userId" IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM "RecipeVector" v WHERE v."recipeId" = r.id
      )
  `

  let processed = 0
  for (let i = 0; i < missing.length; i += BATCH_SIZE) {
    const batch = missing.slice(i, i + BATCH_SIZE)
    // embedRecipeById is non-blocking: a failed embed is logged and the recipe
    // simply stays missing, so a later re-run retries it.
    await Promise.all(
      batch.map((recipe) => embedRecipeById(recipe.id, recipe.userId, prisma))
    )
    processed += batch.length
    console.log(`Embedded ${processed}/${missing.length} recipes…`)
  }

  console.log(`Done. Backfilled embeddings for ${missing.length} recipes.`)
}

main()
  .catch(async (e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => {
    prisma.$disconnect()
  })
