import { type PrismaClient } from '@prisma/client'
import { FiltersAccess } from '~/server/api/data-access/filters-access'
import {
  type CheckFilterSchema,
  type SaveFiltersSchema
} from '~/schemas/filters-schema'

export async function getAllFilters(userId: string, prisma: PrismaClient) {
  const filtersDataAccess = new FiltersAccess(prisma)
  return await filtersDataAccess.getByUserId(userId)
}

export async function updateFilterCheckStatus(
  input: CheckFilterSchema,
  prisma: PrismaClient
) {
  const filtersDataAccess = new FiltersAccess(prisma)
  return await filtersDataAccess.updateFilterCheckStatus(input)
}

export async function saveFilters(
  input: SaveFiltersSchema & { userId: string },
  prisma: PrismaClient
) {
  const filtersDataAccess = new FiltersAccess(prisma)
  return await filtersDataAccess.saveFilters(input.userId, input.filters)
}
