import type { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma'

// Pass the browser instance to the scraper controller

const RecipeSchema = z.object({
  description: z.string().optional(),
  name: z.string(),
  imgUrl: z.string().optional(),
  author: z.string().optional(),
  address: z.string().optional(),
  ingredients: z.array(z.string()),
  instructions: z.array(z.string()),
  userId: z.number(),
  listId: z.number().optional(),
  url: z.string().optional()
})

export type CreateRecipeParams = z.infer<typeof RecipeSchema>

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const parsedRequest = await RecipeSchema.safeParseAsync(req.body)
  if (!parsedRequest.success) {
    return res.status(400).send(parsedRequest.error)
  }

  const params = parsedRequest.data

  const newRecipe = await createRecipe(params)

  res.json(newRecipe)
}

async function createRecipe(data: CreateRecipeParams) {
  const { userId, listId, ingredients, instructions, ...rest } = data
  const result = await prisma.recipe.create({
    data: {
      ...rest,
      instructions: {
        create: instructions.map((i) => ({ description: i }))
      },
      ingredients: {
        create: ingredients.map((i) => ({ name: i }))
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
