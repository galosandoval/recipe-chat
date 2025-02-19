import { type PrismaClient } from '@prisma/client'
import { FiltersDataAccess } from '~/server/api/data-access/filters'
import {
  CreateFilterSchema,
  CheckFilterSchema,
  DeleteFilterSchema
} from '~/server/api/schemas/filters'

export async function getAllFilters(userId: string, prisma: PrismaClient) {
  const filtersDataAccess = new FiltersDataAccess(prisma)
  return await filtersDataAccess.getByUserId(userId)
}

export async function createFilter(
  input: CreateFilterSchema,
  userId: string,
  prisma: PrismaClient
) {
  const filtersDataAccess = new FiltersDataAccess(prisma)
  return await filtersDataAccess.createFilter(input, userId)
}

export async function deleteFilter(
  input: DeleteFilterSchema,
  prisma: PrismaClient
) {
  const filtersDataAccess = new FiltersDataAccess(prisma)
  return await filtersDataAccess.deleteFilter(input)
}

export async function updateFilterCheckStatus(
  input: CheckFilterSchema,
  prisma: PrismaClient
) {
  const filtersDataAccess = new FiltersDataAccess(prisma)
  return await filtersDataAccess.updateFilterCheckStatus(input)
}
