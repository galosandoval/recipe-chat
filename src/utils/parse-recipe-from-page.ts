import { Page } from 'puppeteer'

export async function parseRecipe(page: Page) {
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
    instructions,
    ingredients,
    names,
    descriptions,
    parsingType: 'iterated'
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

// // img
// const images = await page.evaluate(() =>
//   Array.from(document.querySelectorAll('img'), (e) => ({
//     line: e.attri('src')
//   })).reverse()
// )

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
