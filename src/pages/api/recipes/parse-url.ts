import type { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'
import puppeteer, { Page } from 'puppeteer'

// Pass the browser instance to the scraper controller

export const ParseRecipeSchema = z.object({
  url: z.string()
})

export type ParseRecipeResponse =
  | {
      instructions: string[][]
      ingredients: string[][]
      names: string[]
      descriptions: string[]
    }
  | z.ZodError<{
      url: string
    }>

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse<ParseRecipeResponse>
) {
  const parsedRequest = await ParseRecipeSchema.safeParseAsync(req.body)
  if (!parsedRequest.success) {
    return res.status(400).send(parsedRequest.error)
  }

  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  const url = parsedRequest.data.url
  await page.goto(url)

  const recipe = await parseRecipe(page)

  await browser.close()

  res.json(recipe)
}

async function parseRecipe(page: Page) {
  const parsedInstructions = parseInstructions(page)
  const parsedIngredients = parseIngredients(page)
  const parsedNames = parseNames(page)
  const parsedDescriptions = parseDescriptions(page)

  const [instructions, ingredients, names, descriptions] = await Promise.all([
    parsedInstructions,
    parsedIngredients,
    parsedNames,
    parsedDescriptions
  ])
  return {
    instructions: instructions.length ? instructions : ingredients,
    ingredients: ingredients.length ? ingredients : instructions,
    names,
    descriptions
  }
}

async function parseInstructions(page: Page) {
  // instructions
  const orderedLists = await page.evaluate(() =>
    Array.from(document.querySelectorAll('ol'), (e) => ({
      line: e.innerText
    })).reverse()
  )

  return orderedLists.reduce((lists: string[][], toReduce) => {
    const lines = toReduce.line
      .split('\n')
      .reduce((potentialIngredients: string[], toFilter) => {
        if (toFilter.length > 4) {
          potentialIngredients.push(toFilter.trim())
        }

        return potentialIngredients
      }, [])

    if (lines.length) {
      lists.push(lines)
    }

    return lists
  }, [])
}

async function parseIngredients(page: Page) {
  // ingredients
  const unorderedLists = await page.evaluate(() =>
    Array.from(document.querySelectorAll('ul'), (e) => ({
      line: e.innerText
    })).reverse()
  )

  return unorderedLists
    .reduce((lists: string[][], toReduce) => {
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
    }, [])
    .slice(0, 8)
}

async function parseNames(page: Page) {
  // names
  const names: string[] = []
  const h1s = await page.evaluate(() =>
    Array.from(document.querySelectorAll('h1'), (e) => ({
      h1: e.innerText
    }))
  )
  names.push(...h1s.map((element) => element.h1))
  const h2s = await page.evaluate(() =>
    Array.from(document.querySelectorAll('h2'), (e) => ({
      h1: e.innerText
    }))
  )
  names.push(...h2s.map((element) => element.h1))

  return names
}

async function parseDescriptions(page: Page) {
  const paragraphs = await page.evaluate(() =>
    Array.from(document.querySelectorAll('p'), (e) => ({ p: e.innerText }))
  )
  return paragraphs.map((element) => element.p).slice(0, 6)
}
