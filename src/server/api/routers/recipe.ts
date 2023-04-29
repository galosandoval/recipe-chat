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

export const recipeRouter = createTRPCRouter({
  entity: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx?.session?.user.id
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

        return ctx.prisma.recipe.create({
          data: {
            userId: ctx.session?.user.id,
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
      }
    }),

  byId: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      return ctx.prisma.recipe.findFirst({
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
        {
          role: 'user',
          content: 'What should I make for dinner tonight?'
        },
        {
          role: 'assistant',
          content:
            '{"name": "Mushroom Risotto","prepTime": "10 minutes","cookTime": "30 minutes","description":"A classic version of the Italian rice dish with earthy and savory mushrooms.","ingredients": ["1 cup Arborio rice","4 tablespoons unsalted butter, divided","1 onion, chopped","2 garlic cloves, minced","8 oz. mushrooms, sliced","4 cups chicken or vegetable broth","1/2 cup dry white wine","1/2 cup grated Parmesan cheese","Salt and pepper, to taste"],"instructions": ["1. In a large saucepan, melt 2 tablespoons of butter over medium heat. Add the onion and garlic and sauté until soft, about 2 minutes.","2. Add the mushrooms and sauté until browned and tender, about 5 minutes.","3. In another saucepan, heat the broth over medium heat until it comes to a simmer.","4. Add the rice to the mushroom mixture and stir to coat. Toast the rice for 2-3 minutes until it becomes translucent around the edges.","5. Add the wine and stir until it is absorbed by the rice.","6. Add the simmering broth, one ladleful at a time, stirring constantly and allowing the rice to absorb the liquid before adding more.","7. Repeat this process for about 20-25 minutes, or until the rice is tender but still firm to the bite.","8. Remove the risotto from heat and stir in the remaining butter and Parmesan cheese until it is melted and creamy.","9. Season with salt and pepper to taste and garnish with additional grated Parmesan cheese or chopped parsley, if desired."]}'
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

        if (content && content.startsWith('{') && content.endsWith('}')) {
          return JSON.parse(content) as GeneratedRecipe
        } else {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `ChatGPT returned content incorrectly. Content: ${content}`,
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
