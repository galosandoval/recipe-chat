import { type PrismaClient } from '@prisma/client'
import {
  type CreateFilterSchema,
  type CheckFilterSchema,
  type DeleteFilterSchema
} from '~/schemas/filters'

export class FiltersDataAccess {
  constructor(private readonly prisma: PrismaClient) {}

  async getByUserId(userId: string) {
    return await this.prisma.filter.findMany({ where: { userId } })
  }

  async createFilter(input: CreateFilterSchema, userId: string) {
    console.log(input)
    console.log(userId)
    return await this.prisma.filter.create({
      data: { userId, name: input.name, checked: true, id: input.filterId }
    })
  }

  async deleteFilter(input: DeleteFilterSchema) {
    return await this.prisma.filter.delete({
      where: { id: input.filterId }
    })
  }

  async updateFilterCheckStatus(input: CheckFilterSchema) {
    return await this.prisma.filter.update({
      where: { id: input.filterId },
      data: { checked: input.checked }
    })
  }
}
