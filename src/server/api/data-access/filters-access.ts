import {
  type CheckFilterSchema,
  type DeleteFilterSchema,
  type CreateFilterSchema
} from '~/schemas/filters-schema'
import { DataAccess } from './data-access'

export class FiltersAccess extends DataAccess {
  async getByUserId(userId: string) {
    return await this.prisma.filter.findMany({ where: { userId } })
  }

  async createFilter({ name, filterId, userId }: CreateFilterSchema) {
    return await this.prisma.filter.create({
      data: { userId, name: name, checked: true, id: filterId }
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
