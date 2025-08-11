import { DataAccess } from './data-access'

export class RecipesOnMessagesAccess extends DataAccess {
  async create(recipeId: string, messageId: string) {
    await this.prisma.recipesOnMessages.create({
      data: { recipeId, messageId }
    })
  }
}
