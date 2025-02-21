import { type PrismaClient } from '@prisma/client'

export class InstructionsDataAccess {
  constructor(private readonly prisma: PrismaClient) {}

  async deleteInstructionsByRecipeId(recipeId: string) {
    return await this.prisma.instruction.deleteMany({ where: { recipeId } })
  }
}
