import { PrismaClient } from '@prisma/client'
import { initialFilters } from '~/utils/stock-filters'

const prisma = new PrismaClient()

/**
 * This one-time migration is to add stock filters for each user
 */
async function main() {
  await prisma.$transaction(
    async (tx) => {
      const users = await tx.user.findMany()
      for (const user of users) {
        const filters = await tx.filter.findMany({
          where: {
            userId: user.id
          }
        })
        if (filters.length > 0) continue

        await tx.user.update({
          where: { id: user.id },
          data: {
            filter: {
              createMany: {
                data: initialFilters.map((filter) => ({
                  name: filter
                }))
              }
            }
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
