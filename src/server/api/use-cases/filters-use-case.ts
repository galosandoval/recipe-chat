import { type PrismaClient } from '@prisma/client'
import { FiltersAccess } from '~/server/api/data-access/filters-access'
import {
  type CreateFilterSchemaWithPrisma,
  type CheckFilterSchema,
  type DeleteFilterSchema
} from '~/server/api/schemas/filters-schema'

export async function getAllFilters(userId: string, prisma: PrismaClient) {
  const filtersDataAccess = new FiltersAccess(prisma)
  return await filtersDataAccess.getByUserId(userId)
}

export async function createFilter(
  name: string,
  filterId: string,
  userId: string,
  chatId: string,
  prisma: PrismaClient
) {
  const filtersDataAccess = new FiltersAccess(prisma)
  return await filtersDataAccess.createFilter({
    name,
    filterId,
    userId,
    chatId
  })
}

export async function deleteFilter(
  input: DeleteFilterSchema,
  prisma: PrismaClient
) {
  const filtersDataAccess = new FiltersAccess(prisma)
  return await filtersDataAccess.deleteFilter(input)
}

export async function updateFilterCheckStatus(
  input: CheckFilterSchema,
  prisma: PrismaClient
) {
  const filtersDataAccess = new FiltersAccess(prisma)
  return await filtersDataAccess.updateFilterCheckStatus(input)
}
