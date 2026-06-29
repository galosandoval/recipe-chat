import { PrismaClient } from '@prisma/client'
import { embedRecipeById } from '../../../src/server/api/use-cases/embed-recipe-use-case'

const prisma = new PrismaClient()

const BATCH_SIZE = 25

// Only saved recipes are ever searched (searchSimilar is saved-only), so embed
// only those — backfilling unsaved suggestion stubs is wasted spend.
const countMissing = () =>
  prisma.$queryRaw<{ id: string; userId: string }[]>`
    SELECT r.id AS "id", r."userId" AS "userId"
    FROM "Recipe" r
    WHERE r."userId" IS NOT NULL
      AND r.saved = true
      AND NOT EXISTS (
        SELECT 1 FROM "RecipeVector" v WHERE v."recipeId" = r.id
      )
  `

async function main() {
  // embedRecipeById swallows OpenAI errors (non-blocking by design), so without a
  // key the backfill writes zero vectors yet still "succeeds". Fail fast instead.
  if (!process.env.OPENAI_API_KEY) {
    console.error(
      'OPENAI_API_KEY is not set — backfill cannot embed. Aborting.'
    )
    process.exit(1)
  }

  // Recipes that own a user but have no embedding yet — these were created while
  // the embedding insert was silently failing (see issue #481). Idempotent:
  // re-running only embeds recipes still missing a RecipeVector row.
  const missing = await countMissing()

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

  // Verify the work actually landed. If we had recipes to embed but none of them
  // got a vector, the embeds silently failed — surface it as a failure.
  const stillMissing = await countMissing()
  const embedded = missing.length - stillMissing.length
  if (missing.length > 0 && embedded === 0) {
    console.error(
      `Backfill wrote 0 vectors for ${missing.length} recipes — embeds are failing silently. Aborting.`
    )
    process.exit(1)
  }

  console.log(
    `Done. Backfilled ${embedded}/${missing.length} recipes; ${stillMissing.length} still missing.`
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
