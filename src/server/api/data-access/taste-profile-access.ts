import type { TasteProfileSchema } from '~/schemas/taste-profile-schema'
import { DataAccess } from './data-access'

export class TasteProfileAccess extends DataAccess {
  async getByUserId(userId: string) {
    return await this.prisma.tasteProfile.findUnique({ where: { userId } })
  }

  async upsert(userId: string, data: TasteProfileSchema) {
    return await this.prisma.tasteProfile.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data
    })
  }
}
