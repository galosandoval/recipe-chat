import {
  type CheckFilterSchema,
  type DraftFilterSchema
} from '~/schemas/filters-schema'
import { DataAccess } from './data-access'

export class FiltersAccess extends DataAccess {
  async getByUserId(userId: string) {
    return await this.prisma.filter.findMany({ where: { userId } })
  }

  /**
   * Reconciles a user's persisted filters against the desired set in a single
   * transaction: creates filters absent from the DB (defaulting `checked: true`),
   * deletes persisted filters absent from the payload, and renames filters whose
   * name changed. `checked` is left untouched on persisting rows. Idempotent.
   */
  async saveFilters(userId: string, filters: DraftFilterSchema[]) {
    return await this.transaction(async (tx) => {
      const existing = await tx.filter.findMany({ where: { userId } })
      const existingById = new Map(existing.map((f) => [f.id, f]))
      const desiredIds = new Set(filters.map((f) => f.id))

      const idsToDelete = existing
        .filter((f) => !desiredIds.has(f.id))
        .map((f) => f.id)
      if (idsToDelete.length > 0) {
        await tx.filter.deleteMany({
          where: { userId, id: { in: idsToDelete } }
        })
      }

      for (const filter of filters) {
        const persisted = existingById.get(filter.id)
        if (!persisted) {
          await tx.filter.create({
            data: {
              id: filter.id,
              name: filter.name,
              userId,
              checked: true
            }
          })
        } else if (persisted.name !== filter.name) {
          await tx.filter.update({
            where: { id: filter.id },
            data: { name: filter.name }
          })
        }
      }

      return await tx.filter.findMany({ where: { userId } })
    })
  }

  async updateFilterCheckStatus(input: CheckFilterSchema) {
    return await this.prisma.filter.update({
      where: { id: input.filterId },
      data: { checked: input.checked }
    })
  }
}
