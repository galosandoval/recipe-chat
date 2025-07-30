import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.$transaction(
    async (tx) => {
      const messages = await tx.message.findMany()
      for (const message of messages) {
        const recipeId = message.recipeId
        if (recipeId) {
          await tx.recipesOnMessages.create({
            data: { recipeId, messageId: message.id }
          })
        }
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
