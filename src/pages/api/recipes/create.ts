import type { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma'

const RecipeSchema = z.object({
  description: z.string().optional(),
  name: z.string(),
  imgUrl: z.string().optional(),
  author: z.string().optional(),
  address: z.string().optional(),
  ingredients: z.array(
    z.object({
      name: z.string()
    })
  ),
  instructions: z.array(
    z.object({
      description: z.string()
    })
  ),
  userId: z.number(),
  listId: z.number().optional()
})

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const response = await RecipeSchema.safeParseAsync(req.body)
  if (!response.success) {
    return res.status(400).send(response.error)
  }

  const {
    name,
    address,
    author,
    description,
    imgUrl,
    ingredients,
    instructions,
    listId,
    userId
  } = response.data
  const newRecipe = await createRecipe({
    name,
    address,
    author,
    description,
    imgUrl,
    ingredients,
    instructions,
    userId,
    listId
  })

  res.json(newRecipe)
}

async function createRecipe(data: z.infer<typeof RecipeSchema>) {
  const { userId, listId, ingredients, instructions, ...rest } = data
  const result = await prisma.recipe.create({
    data: {
      ...rest,
      instructions: {
        create: instructions
      },
      ingredients: {
        create: ingredients
      },
      onLists: { create: { userId, listId } }
    },
    include: {
      ingredients: true,
      instructions: true,
      onLists: true
    }
  })
  return result
}
