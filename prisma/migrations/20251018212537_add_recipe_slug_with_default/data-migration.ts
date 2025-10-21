import { PrismaClient } from '@prisma/client'
import { slugify } from '~/lib/utils'

const prisma = new PrismaClient()

async function main() {
  await prisma.$transaction(
    async (tx) => {
      const recipes = await tx.recipe.findMany()
      const sorted = recipes.toSorted((a, b) => a.name.localeCompare(b.name))
      for (const recipe of sorted) {
        const slug = slugify(recipe.name)
        console.log('slug', slug)

        await tx.recipe.update({
          where: { id: recipe.id },
          data: {
            slug
          }
        })
      }
      console.log('updated all recipes')
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
