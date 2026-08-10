import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    // Backend integration tests exercise the data-access layer through this
    // same client, so query logging would drown their output.
    log: process.env.NODE_ENV === 'test' ? [] : ['query']
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
