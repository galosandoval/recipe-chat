import type { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma'
import puppeteer from 'puppeteer'

// Pass the browser instance to the scraper controller

export const RecipeSchema = z.object({
  description: z.string().optional(),
  name: z.string(),
  imgUrl: z.string().optional(),
  author: z.string().optional(),
  address: z.string().optional(),
  ingredients: z
    .array(
      z.object({
        name: z.string()
      })
    )
    .optional(),
  instructions: z
    .array(
      z.object({
        description: z.string()
      })
    )
    .optional(),
  userId: z.number(),
  listId: z.number().optional(),
  url: z.string().optional()
})

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const parsedRequest = await RecipeSchema.safeParseAsync(req.body)
  if (!parsedRequest.success) {
    return res.status(400).send(parsedRequest.error)
  }
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  const url = parsedRequest.data.url
  if (url) {
    await page.goto(url)
    console.log('url', url)
  }

  // ingredients
  const unorderedLists = await page.evaluate(() =>
    Array.from(document.querySelectorAll('ul'), (e) => ({
      line: e.innerText
    })).reverse()
  )

  const reducedUnorderedLists = unorderedLists.reduce(
    (lists: string[][], toReduce) => {
      const lines = toReduce.line
        .split('\n')
        .reduce((potentialIngredients: string[], toFilter) => {
          if (toFilter.length > 4) {
            potentialIngredients.push(toFilter.trim())
          }

          return potentialIngredients
        }, [])

      if (lines.length > 5) {
        lists.push(lines)
      }

      return lists
    },
    []
  )

  console.log('imp', reducedUnorderedLists)

  // names

  const h1s = await page.evaluate(() =>
    Array.from(document.querySelectorAll('h1'), (e) => ({
      h1: e.innerText
    }))
  )
  const names = h1s.map((element) => element.h1)
  console.log('names', names)

  await browser.close()
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
  } = parsedRequest.data
  // const newRecipe = await createRecipe({
  //   name,
  //   address,
  //   author,
  //   description,
  //   imgUrl,
  //   ingredients,
  //   instructions,
  //   userId,
  //   listId
  // })

  res.json(parsedRequest)
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
