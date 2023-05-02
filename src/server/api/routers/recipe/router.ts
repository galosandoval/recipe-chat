import { z } from 'zod'
import { Recipe } from '@prisma/client'
import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from 'openai'
import { TRPCError } from '@trpc/server'
import * as cheerio from 'cheerio'

import { createTRPCRouter, protectedProcedure } from 'server/api/trpc'
import { GeneratedRecipe, LinkedData, createRecipeSchema } from './interface'

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

  byIds: protectedProcedure
    .input(z.array(z.number()))
    .query(async ({ input, ctx }) => {
      return ctx.prisma.recipe.findMany({ where: { id: { in: input } } })
    }),

  parseRecipeUrl: protectedProcedure
    .input(z.string())
    .mutation(async ({ input }) => {
      const response = await fetch(input)
      const text = await response.text()

      const $ = cheerio.load(text)
      const jsonRaw =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ($("script[type='application/ld+json']")[0].children[0] as any)
          ?.data as string

      const jsonRawNoSpaces = jsonRaw.replace(/\n/g, '')
      const parsed = JSON.parse(jsonRawNoSpaces) as LinkedData

      if ('@graph' in parsed) {
        const recipeField = parsed['@graph'].find((f) => {
          const field = f['@type']
          if (Array.isArray(field)) {
            const asArray = field.find((f) => f === 'Recipe')
            if (asArray) return true
          }

          if (typeof field === 'string') {
            return field === 'Recipe'
          }

          return false
        })
        if (recipeField) {
          return recipeField
        }

        throw new TRPCError({
          message: 'Did not find linked data in @graph',
          code: 'INTERNAL_SERVER_ERROR',
          cause: parsed
        })
      } else if ('@type' in parsed) {
        const field = parsed['@type']
        if (Array.isArray(field)) {
          const asArray = field.find((f) => f === 'Recipe')
          if (asArray) return parsed
        }

        if (typeof field === 'string') {
          return parsed
        }
      } else if (Array.isArray(parsed)) {
        const recipeField = parsed.find((f) => {
          const field = f['@type']
          if (Array.isArray(field)) {
            const asArray = field.find((f) => f === 'Recipe')
            if (asArray) return true
          }

          if (typeof field === 'string') {
            return field === 'Recipe'
          }

          return false
        })
        if (recipeField) {
          return recipeField
        }
      }
      console.log('parsed', parsed)
      throw new TRPCError({
        message: 'Did not find linked data',
        code: 'INTERNAL_SERVER_ERROR',
        cause: parsed
      })
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

  ingredientsAndInstructions: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      return ctx.prisma.recipe.findFirst({
        where: { id: { equals: input.id } },
        select: {
          ingredients: true,
          instructions: true
        }
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

        if (content) {
          const startOfBracket = content.indexOf('{')
          let endOfBraket = content.length
          for (let i = content.length || 0; i >= 0; i--) {
            const element = content[i]
            if (element === '}') {
              endOfBraket = i
              break
            }
          }
          const sliced = content.slice(startOfBracket, endOfBraket + 1)

          return JSON.parse(sliced) as GeneratedRecipe
        } else {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `ChatGPT returned content incorrectly. Content: ${content}`,
            cause: { payload: input.message }
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

// export function parseHtml(html: string) {
//   let openScriptIdx = 0
//   let closeScriptIdx = 0
//   let foundLinkedData = false
//   for (let i = 0; i < html.length - 4; i++) {
//     const char1 = html[i]
//     const char2 = html[i + 1]
//     const char3 = html[i + 2]
//     const char4 = html[i + 3]
//     const char5 = html[i + 4]

//     if (
//       char1 === 'l' &&
//       char2 === 'd' &&
//       char3 === '+' &&
//       char4 === 'j' &&
//       char5 === 's'
//     ) {
//       foundLinkedData = true
//       openScriptIdx = i + 9
//     } else if (
//       foundLinkedData &&
//       char1 === '<' &&
//       char2 === '/' &&
//       char3 === 's' &&
//       char4 === 'c' &&
//       char5 === 'r'
//     ) {
//       closeScriptIdx = i
//       break
//     }
//   }

//   console.log(
//     'parsed recipe',
//     JSON.parse(html.slice(openScriptIdx, closeScriptIdx)) as ScrapedRecipe
//   )
//   return JSON.parse(
//     html.slice(openScriptIdx, closeScriptIdx)
//   )[0] as ScrapedRecipe
// }
