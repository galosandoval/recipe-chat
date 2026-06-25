import { PrismaClient } from '@prisma/client'
import { slugify } from '~/lib/utils'

const prisma = new PrismaClient()

// The column was added NOT NULL DEFAULT gen_random_uuid()::text, so unprocessed
// rows still hold a raw UUID. Idempotency guard: only humanize slugs that still
// match this default — a re-run skips already-humanized or user-edited slugs.
const UUID_DEFAULT = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

async function main() {
  await prisma.$transaction(
    async (tx) => {
      const recipes = await tx.recipe.findMany()
      const unprocessed = recipes
        .filter((recipe) => UUID_DEFAULT.test(recipe.slug))
        .toSorted((a, b) => a.name.localeCompare(b.name))
      for (const recipe of unprocessed) {
        const slug = slugify(recipe.name)
        console.log('slug', slug)

        await tx.recipe.update({
          where: { id: recipe.id },
          data: {
            slug
          }
        })
      }
      console.log(`Humanized ${unprocessed.length} slug(s).`)
    },
    {
      maxWait: 5000, // Maximum wait time for a connection from the pool (e.g., 5 seconds)
      timeout: 30000 // Maximum time the transaction can run before being canceled (e.g., 30 seconds)
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
