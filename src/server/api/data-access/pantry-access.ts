import { type Pantry } from '@prisma/client'
import { DataAccess } from './data-access'

export class PantryAccess extends DataAccess {
  async getPantryByUserId(userId: string) {
    return this.prisma.pantry.findUnique({
      where: { userId },
      include: { ingredients: { orderBy: { id: 'asc' } } }
    })
  }

  async getOrCreatePantry(userId: string): Promise<Pantry> {
    return this.prisma.pantry.upsert({
      where: { userId },
      create: { userId },
      update: {}
    })
  }

  async createPantryIngredient(data: {
    id: string
    pantryId: string
    rawString: string
    quantity: number | null
    unit: string | null
    unitType: 'volume' | 'weight' | 'count' | null
    itemName: string | null
    preparation: string | null
  }) {
    return this.prisma.ingredient.create({
      data: {
        ...data,
        recipeId: null,
        listId: null,
        checked: false
      }
    })
  }

  async updatePantryIngredient(
    id: string,
    data: {
      rawString?: string
      quantity?: number | null
      unit?: string | null
      unitType?: 'volume' | 'weight' | 'count' | null
      itemName?: string | null
      preparation?: string | null
    }
  ) {
    return this.prisma.ingredient.update({
      where: { id },
      data
    })
  }

  async deletePantryIngredients(ingredientIds: string[]) {
    await this.prisma.ingredient.deleteMany({
      where: { id: { in: ingredientIds }, pantryId: { not: null } }
    })
  }
}
