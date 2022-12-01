import type { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'
import prisma from '../../../lib/prisma'

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
  )
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
    instructions
  } = response.data
  const newRecipe = await createRecipe({
    name,
    address,
    author,
    description,
    imgUrl
  })
  const createIngredientsParams = ingredients.map((ingredient) => ({
    ...ingredient,
    recipeId: newRecipe.id
  }))
  const newIngredientsReponse = createIngredients(createIngredientsParams)
  const createInstructionsParams = instructions.map((instruction) => ({
    ...instruction,
    recipeId: newRecipe.id
  }))
  const newInstructionsResponse = createInstructions(createInstructionsParams)

  const responses = await Promise.all([
    newIngredientsReponse,
    newInstructionsResponse
  ])

  const result = {
    ...newRecipe,
    ingredients: responses[0],
    instructions: responses[1]
  }
  res.json(result)
}

async function createRecipe(
  data: Omit<z.infer<typeof RecipeSchema>, 'ingredients' | 'instructions'>
) {
  const result = await prisma.recipe.create({ data })
  return result
}

async function createIngredients(
  data: {
    name: string
    recipeId: number
  }[]
) {
  return await prisma.ingredient.createMany({ data })
}

async function createInstructions(
  data: {
    description: string
    recipeId: number
  }[]
) {
  return await prisma.instruction.createMany({ data })
}
