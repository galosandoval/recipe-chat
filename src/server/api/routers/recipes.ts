import { z } from 'zod'
import { Recipe } from '@prisma/client'
import { parseRecipeUrl } from '../../helpers/parse-recipe-url'
import { Context, createTRPCRouter, protectedProcedure } from '../trpc'

const CreateRecipeSchema = z.object({
  description: z.string().optional(),
  name: z.string(),
  imgUrl: z.string().optional(),
  author: z.string().optional(),
  address: z.string().optional(),
  ingredients: z.array(z.string()),
  instructions: z.array(z.string()),
  userId: z.number(),
  url: z.string().optional()
})

export const recipesRouter = createTRPCRouter({
  entity: protectedProcedure
    .input(
      z.object({
        userId: z.number()
      })
    )
    .query(async ({ input, ctx }) => {
      const recipeList = await ctx.prisma.recipesOnList.findMany({
        where: { userId: { equals: input.userId } },
        select: {
          recipe: true
        }
      })

      const entity: { [recipeId: string]: Recipe } = {}

      recipeList.forEach((element) => {
        entity[element.recipe.id] = element.recipe
      })

      return entity
    }),

  parseRecipeUrl: protectedProcedure
    .input(z.string())
    .mutation(({ input }) => parseRecipeUrl(input)),

  create: protectedProcedure.input(CreateRecipeSchema).mutation(createRecipe),

  byId: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      return await ctx.prisma.recipe.findFirst({
        where: { id: { equals: input.id } },
        select: { ingredients: true, instructions: true }
      })
    })
})

export type CreateRecipeParams = z.infer<typeof CreateRecipeSchema>

async function createRecipe({
  input,
  ctx
}: {
  input: CreateRecipeParams
  ctx: Context
}) {
  const { userId, ingredients, instructions, ...rest } = input
  const result = await ctx.prisma.recipe.create({
    data: {
      ...rest,
      instructions: {
        create: instructions.map((i) => ({ description: i }))
      },
      ingredients: {
        create: ingredients.map((i) => ({ name: i }))
      },
      onLists: { create: { userId } }
    },
    include: {
      ingredients: true,
      instructions: true,
      onLists: true
    }
  })
  return result
}
