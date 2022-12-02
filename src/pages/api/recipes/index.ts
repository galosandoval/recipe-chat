import type { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'
import prisma from '../../../lib/prisma'

const RecipeSchema = z.object({
  userId: z.number()
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const response = await RecipeSchema.safeParseAsync(req.body)
  if (!response.success) {
    return res.status(400).send(response.error)
  }

  const { userId } = response.data

  const userRecipes = await getRecipesBy(userId)
  res.json(userRecipes)
}

async function getRecipesBy(userId: number) {
  return await prisma.recipesOnList.findMany({
    where: { userId: { equals: userId } },
    select: {
      recipe: { include: { ingredients: true, instructions: true } }
    }
  })
}
