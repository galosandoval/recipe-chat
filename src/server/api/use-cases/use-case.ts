import { PrismaClient } from '@prisma/client'
import z from 'zod'

export const withPrisma = z.object({
  prisma: z.instanceof(PrismaClient)
})
