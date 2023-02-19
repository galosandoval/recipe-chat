import puppeteer from 'puppeteer'
import { parseRecipe } from '../../utils/parse-recipe-from-page'

export type LinkedData = {
  author?: {
    name?: string
    url?: string
  }[]
  cookTime?: string
  description?: string
  headline?: string
  image?: {
    height?: number
    url?: string
    width?: number
  }
  name?: string
  recipeIngredient?: string[]
  recipeInstructions?: {
    text?: string
  }[]
  recipeYield?: number
  totalTime?: string
  url?: string
  parsingType: 'linkedData'
}

export type IteratedData = {
  instructions: string[][]
  ingredients: string[][]
  names: string[]
  descriptions: string[]
  parsingType: 'iterated'
}

export type ScrapedRecipe = LinkedData | IteratedData

export async function parseRecipeUrl(url: string) {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto(url)

  const script = await page.evaluate(() =>
    Array.from(document.querySelectorAll('script'), (e) => {
      if (e.type.includes('application/ld+json')) return { script: e.innerHTML }
    }).filter(Boolean)
  )

  const linkedData = JSON.parse(script[0]?.script || '')[0] as LinkedData
  const linkedDataLength = Object.keys(linkedData || {})
  if (!linkedDataLength?.length) {
    const iteratedPage = (await parseRecipe(page)) as IteratedData

    await browser.close()

    return iteratedPage
  }

  await browser.close()

  linkedData.parsingType = 'linkedData'

  return linkedData || {}
}
