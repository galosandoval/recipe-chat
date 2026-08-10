import { tasteProfileAccess } from '~/server/api/data-access/taste-profile-access'
import type { TasteProfileSchema } from '~/schemas/taste-profile-schema'

export async function getTasteProfile(userId: string) {
  return await tasteProfileAccess.getByUserId(userId)
}

export async function upsertTasteProfile(
  userId: string,
  data: TasteProfileSchema
) {
  return await tasteProfileAccess.upsert(userId, data)
}
