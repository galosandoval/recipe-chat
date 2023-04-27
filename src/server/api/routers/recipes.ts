import { z } from 'zod'
import { Recipe } from '@prisma/client'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from 'openai'
import { TRPCError } from '@trpc/server'
import { parseHtml } from '../../helpers/parseRecipeUrlHelper'

const createRecipeSchema = z.object({
  description: z.string().optional(),
  name: z.string(),
  imgUrl: z.string().optional(),
  author: z.string().optional(),
  address: z.string().optional(),
  ingredients: z.array(z.string()),
  instructions: z.array(z.string()),
  url: z.string().optional()
})

export type CreateRecipeParams = z.infer<typeof createRecipeSchema>

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
    .mutation(async ({ input }) => {
      const response = await fetch(input)
      const html = await response.text()
      if (html.indexOf('ld+json') > 0) {
      }
      return parseHtml(html)
    }),

  create: protectedProcedure
    .input(createRecipeSchema)
    .mutation(async ({ input, ctx }) => {
      {
        const { ingredients, instructions, ...rest } = input

        const result = await ctx.prisma.recipe.create({
          data: {
            userId: parseInt(ctx.session?.user.id || ''),
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
    }),

  byId: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      return await ctx.prisma.recipe.findFirst({
        where: { id: { equals: input.id } },
        select: { ingredients: true, instructions: true }
      })
    }),

  generate: protectedProcedure
    .input(z.object({ message: z.string() }))
    .mutation(async ({ input }) => {
      const messages = [
        {
          role: 'system',
          content:
            'You are a helpful assistant that only responds with recipes. The response you give should contain the name of the recipe, a description, preparation time, cook time, ingredients and instructions. The reponse format should strictly be a javascript object with the following keys: name, prepTime, cookTime, description, ingredients, instructions.'
        },
        { role: 'user', content: `${input.message}` }
      ] satisfies ChatCompletionRequestMessage[]

      const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY
      })
      const openai = new OpenAIApi(configuration)

      try {
        const completion = await openai.createChatCompletion({
          model: 'gpt-3.5-turbo',
          messages
        })

        const content = completion.data.choices[0].message?.content
        const objectStart = content?.indexOf('{') || -1
        if (content && objectStart >= 0) {
          const objectEnd = content.indexOf('}')

          const parsedRecipe = JSON.parse(
            JSON.parse(
              JSON.stringify(content.slice(objectStart, objectEnd + 1))
                .replace('name', '\\"name\\"')
                .replace('description', '\\"description\\"')
                .replace('ingredients', '\\"ingredients\\"')
                .replace('instructions', '\\"instructions\\"')
                .replace('prepTime', '\\"prepTime\\"')
                .replace('cookTime', '\\"cookTime\\"')
            )
          ) as GeneratedRecipe
          return parsedRecipe
        } else {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'ChatGPT returned content incorrectly. Try again.',
            cause: content
          })
        }
      } catch (error) {
        console.log('Error:', error)
      }

      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'ChatGPT returned content incorrectly. Try again.'
      })
    })
})

export type GeneratedRecipe = {
  name: string
  ingredients: string[]
  instructions: string[]
  description: string
  prepTime: string
  cookTime: string
}
