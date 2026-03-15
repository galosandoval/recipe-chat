import { type PrismaClient } from '@prisma/client'
import { TasteProfileAccess } from '~/server/api/data-access/taste-profile-access'
import { FiltersAccess } from '~/server/api/data-access/filters-access'
import type { TasteProfileSchema } from '~/schemas/taste-profile-schema'
import { cuid } from '~/lib/createId'

export async function getTasteProfile(userId: string, prisma: PrismaClient) {
  const access = new TasteProfileAccess(prisma)
  return await access.getByUserId(userId)
}

export async function upsertTasteProfile(
  userId: string,
  data: TasteProfileSchema,
  prisma: PrismaClient
) {
  const access = new TasteProfileAccess(prisma)
  const profile = await access.upsert(userId, data)

  // Sync dietary restrictions to Filter model
  await syncDietaryFilters(userId, data.dietaryRestrictions, prisma)

  return profile
}

async function syncDietaryFilters(
  userId: string,
  dietaryRestrictions: string[],
  prisma: PrismaClient
) {
  const filtersAccess = new FiltersAccess(prisma)
  const existingFilters = await filtersAccess.getByUserId(userId)
  const existingFilterNames = new Set(
    existingFilters.map((f) => f.name.toLowerCase())
  )

  // Filter out "none" from dietary restrictions
  const restrictions = dietaryRestrictions.filter((r) => r !== 'none')

  // Create filters for new dietary restrictions
  for (const restriction of restrictions) {
    if (!existingFilterNames.has(restriction.toLowerCase())) {
      await filtersAccess.createFilter({
        name: restriction,
        filterId: cuid(),
        userId
      })
    }
  }

  // Uncheck filters that are no longer selected (only for known dietary restriction names)
  const restrictionSet = new Set(restrictions.map((r) => r.toLowerCase()))
  const dietaryFilterNames = new Set([
    'vegetarian',
    'vegan',
    'gluten-free',
    'dairy-free',
    'nut-free',
    'keto',
    'paleo',
    'halal',
    'kosher'
  ])

  for (const filter of existingFilters) {
    const name = filter.name.toLowerCase()
    if (dietaryFilterNames.has(name) && !restrictionSet.has(name)) {
      await filtersAccess.updateFilterCheckStatus({
        filterId: filter.id,
        checked: false
      })
    }
  }
}
