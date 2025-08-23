import { PrismaClient } from '@prisma/client'
import type { ITXClientDenyList } from '@prisma/client/runtime/library'

type Prisma = Omit<PrismaClient, ITXClientDenyList>

export abstract class DataAccess {
  constructor(protected readonly prisma: Prisma = new PrismaClient()) {}

  transaction<T>(callback: (prisma: Prisma) => Promise<T>) {
    return (this.prisma as PrismaClient).$transaction(callback)
  }
}
