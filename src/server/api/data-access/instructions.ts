import { PrismaClient, Instruction } from '@prisma/client'
import { prisma } from '~/server/db'

class InstructionsDataAccess {
  constructor(readonly prisma: PrismaClient) {}

  async deleteInstructionsByRecipeId(recipeId: string) {
    return await this.prisma.instruction.deleteMany({ where: { recipeId } })
  }
}

export const instructionsDataAccess = new InstructionsDataAccess(prisma)
