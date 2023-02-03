import puppeteer, { Page } from 'puppeteer'

export type ParsedRecipe = {
  instructions: string[][]
  ingredients: string[][]
  names: string[]
  descriptions: string[]
}

export async function parseRecipeUrl(url: string) {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto(url)

  // console.log('response', response.text())

  // const script = await page.evaluate(() =>
  //   Array.from(document.querySelectorAll('script'), (e) => {
  //     if (e.type.includes('application/ld+json')) return { script: e.innerText }
  //   })
  // )
  // console.log('script', script)
  // const recipe = await parseRecipe(page)

  // await browser.close()

  // return recipe
  return [] as any
}

async function parseRecipe(page: Page): Promise<ParsedRecipe> {
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
  const orderedLists = await page.evaluate(() =>
    Array.from(document.querySelectorAll('ol'), (e) => ({
      line: e.innerText
    })).reverse()
  )

  return orderedLists.reduce((lists: string[][], toReduce) => {
    const lines = toReduce.line
      .split('\n')
      .reduce((potentialInstructions: string[], toFilter) => {
        console.log('toFIlter', toFilter)
        if (toFilter.trim().length > 6) {
          potentialInstructions.push(toFilter.trim())
        }

        return potentialInstructions
      }, [])

    if (lines.length) {
      lists.push(lines)
    }

    return lists
  }, [])
}

async function parseIngredients(page: Page) {
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
          if (toFilter.length > 6) {
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
