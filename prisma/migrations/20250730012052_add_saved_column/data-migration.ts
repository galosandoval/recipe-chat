import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.$transaction(
    async (tx) => {
      const recipes = await tx.recipe.findMany()
      for (const recipe of recipes) {
        await tx.recipe.update({
          where: { id: recipe.id },
          data: {
            // set all recipes to saved because before this migration, the saved column was not set
            // this is a one-time migration and we can set all recipes to saved
            saved: true
          }
        })
      }
    },
    {
      maxWait: 5000, // Maximum wait time for a connection from the pool (e.g., 5 seconds)
      timeout: 20000 // Maximum time the transaction can run before being canceled (e.g., 20 seconds)
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
