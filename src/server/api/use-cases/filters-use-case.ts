import { filtersAccess } from '~/server/api/data-access/filters-access'
import {
  type CheckFilterSchema,
  type SaveFiltersSchema
} from '~/schemas/filters-schema'

export async function getAllFilters(userId: string) {
  return await filtersAccess.getByUserId(userId)
}

export async function updateFilterCheckStatus(input: CheckFilterSchema) {
  return await filtersAccess.updateFilterCheckStatus(input)
}

export async function saveFilters(
  input: SaveFiltersSchema & { userId: string }
) {
  return await filtersAccess.saveFilters(input.userId, input.filters)
}
