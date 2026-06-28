import { type PrismaClient } from '@prisma/client'
import { TasteProfileAccess } from '~/server/api/data-access/taste-profile-access'
import type { TasteProfileSchema } from '~/schemas/taste-profile-schema'

export async function getTasteProfile(userId: string, prisma?: PrismaClient) {
  const access = new TasteProfileAccess(prisma)
  return await access.getByUserId(userId)
}

export async function upsertTasteProfile(
  userId: string,
  data: TasteProfileSchema,
  prisma: PrismaClient
) {
  const access = new TasteProfileAccess(prisma)
  return await access.upsert(userId, data)
}
