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
  url: z.string().optional()
})

export const recipesRouter = createTRPCRouter({
  entity: protectedProcedure.query(async ({ ctx }) => {
    const userId = parseInt(ctx?.session?.user.id || '')
    const recipeList = await ctx.prisma.recipe.findMany({
      where: { userId: { equals: userId } }
    })

    const entity: { [recipeId: string]: Recipe } = {}

    recipeList.forEach((element) => {
      entity[element.id] = element
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
  const { ingredients, instructions, ...rest } = input

  const result = await ctx.prisma.recipe.create({
    data: {
      ...rest,
      instructions: {
        create: instructions.map((i) => ({ description: i }))
      },
      ingredients: {
        create: ingredients.map((i) => ({ name: i }))
      }
    },
    include: {
      ingredients: true,
      instructions: true
    }
  })
  return result
}
