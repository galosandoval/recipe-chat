import puppeteer from 'puppeteer'

type LinkedData = {
  author: {
    name: string
    url: string
  }[]
  cookTime: string
  description: string
  headline: string
  image: {
    height: number
    url: string
    width: number
  }
  name: string
  recipeIngredient: string[]
  recipeInstructions: {
    text: string
  }[]
  recipeYield: number
  totalTime: string
  url: string
}

export type PartialLD = Partial<LinkedData>

export async function parseRecipeUrl(url: string) {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto(url)

  const script = await page.evaluate(() =>
    Array.from(document.querySelectorAll('script'), (e) => {
      if (e.type.includes('application/ld+json')) return { script: e.innerHTML }
    }).filter(Boolean)
  )

  await browser.close()

  return (JSON.parse(script[0]?.script || '')[0] as PartialLD) || {}
}
