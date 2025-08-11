import { DataAccess } from './data-access'

export class InstructionsAccess extends DataAccess {
  async deleteInstructionsByRecipeId(recipeId: string) {
    return await this.prisma.instruction.deleteMany({ where: { recipeId } })
  }
}
