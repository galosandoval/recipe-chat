import { type PrismaClient } from '@prisma/client'
import { FiltersAccess } from '~/server/api/data-access/filters-access'
import {
  type CheckFilterSchema,
  type DeleteFilterSchema,
  type CreateFilterSchema
} from '~/server/api/schemas/filters-schema'

export async function getAllFilters(userId: string, prisma: PrismaClient) {
  const filtersDataAccess = new FiltersAccess(prisma)
  return await filtersDataAccess.getByUserId(userId)
}

export async function createFilter(input: CreateFilterSchema, prisma: PrismaClient) {
  const filtersDataAccess = new FiltersAccess(prisma)
  return await filtersDataAccess.createFilter(input)
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
