import { type PrismaClient } from '@prisma/client'
import type { ITXClientDenyList } from '@prisma/client/runtime/library'
import { prisma as db } from '~/server/db'

type Prisma = Omit<PrismaClient, ITXClientDenyList>

export abstract class DataAccess {
  constructor(protected readonly prisma: Prisma = db) {}

  transaction<T>(callback: (prisma: Prisma) => Promise<T>) {
    return (this.prisma as PrismaClient).$transaction(callback)
  }
}
