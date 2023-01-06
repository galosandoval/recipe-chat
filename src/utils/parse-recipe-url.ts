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

  const recipe = await parseRecipe(page)

  await browser.close()

  const mockData = {
    instructions: [
      [
        'Budgeting',
        'Cheap vegetarian recipes',
        'Cheap vegan recipes',
        'Cheap meals for two',
        'Cheap healthy meals',
        'Entertainment',
        'Dinner party desserts',
        'Sharing platters',
        'Canape recipes',
        'Easy cocktails',
        'Mocktail recipes',
        'Health',
        'Healthy vegetarian recipes',
        'Healthy winter recipes',
        'Gluten-free',
        'Dairy-free',
        'Nutracheck',
        'Wellness',
        'How to sleep better',
        'Gut friendly recipes',
        'High protein recipes',
        'Help cure a cold',
        'Olive Magazine',
        'Sunday roast ideas',
        'Easy baking recipes',
        'Healthy soup recipes',
        'Easy one-pot recipes'
      ],
      [
        'Nutracheck.co.uk',
        'OliveMagazine.com',
        'RadioTimes.com',
        'HistoryExtra.com',
        'GardenersWorld.com',
        'MadeForMums.com',
        'TheRecommended.com'
      ],
      [
        'About us',
        'Contact Us',
        'Privacy Policy',
        'Terms & Conditions',
        'Cookies Policy',
        'Complaints escalation',
        'Advertise',
        'Manage Privacy Settings'
      ],
      [
        'Visit us on Facebook',
        'Visit us on Twitter',
        'Visit us on Instagram',
        'Visit us on Pinterest',
        'Visit us on Youtube',
        'Visit us on Rss'
      ],
      [
        'STEP 1',
        'Heat a large saucepan and dry-fry 2 tsp cumin seeds and a pinch of chilli flakes for 1 min, or until they start to jump around the pan and release their aromas.',
        'STEP 2',
        'Scoop out about half with a spoon and set aside. Add 2 tbsp olive oil, 600g coarsely grated carrots, 140g split red lentils, 1l hot vegetable stock and 125ml milk to the pan and bring to the boil.',
        'STEP 3',
        'Simmer for 15 mins until the lentils have swollen and softened.',
        'STEP 4',
        'Whizz the soup with a stick blender or in a food processor until smooth (or leave it chunky if you prefer).',
        'STEP 5',
        'Season to taste and finish with a dollop of plain yogurt and a sprinkling of the reserved toasted spices. Serve with warmed naan breads.'
      ],
      [
        '2 tsp cumin seeds',
        'pinch chilli flakes',
        '2 tbsp olive oil',
        '600g carrots, washed and coarsely grated (no need to peel)',
        '140g split red lentils',
        '1l hot vegetable stock (from a cube is fine)',
        "125ml milk (to make it dairy-free, see 'try' below)",
        'plain yogurt and naan bread, to serve'
      ],
      [
        'Recipes',
        'How to',
        'Health',
        'Inspiration',
        'Reviews',
        'Budget recipes',
        'Christmas Kitchen',
        'Subscribe now',
        'Good Food subscribers club',
        'Download our app',
        'Wine Club',
        'Roast timer',
        'Gift guides',
        'Videos',
        'Podcast'
      ]
    ],
    ingredients: [
      [
        'Budgeting',
        'Cheap vegetarian recipes',
        'Cheap vegan recipes',
        'Cheap meals for two',
        'Cheap healthy meals',
        'Entertainment',
        'Dinner party desserts',
        'Sharing platters',
        'Canape recipes',
        'Easy cocktails',
        'Mocktail recipes',
        'Health',
        'Healthy vegetarian recipes',
        'Healthy winter recipes',
        'Gluten-free',
        'Dairy-free',
        'Nutracheck',
        'Wellness',
        'How to sleep better',
        'Gut friendly recipes',
        'High protein recipes',
        'Help cure a cold',
        'Olive Magazine',
        'Sunday roast ideas',
        'Easy baking recipes',
        'Healthy soup recipes',
        'Easy one-pot recipes'
      ],
      [
        'Nutracheck.co.uk',
        'OliveMagazine.com',
        'RadioTimes.com',
        'HistoryExtra.com',
        'GardenersWorld.com',
        'MadeForMums.com',
        'TheRecommended.com'
      ],
      [
        'About us',
        'Contact Us',
        'Privacy Policy',
        'Terms & Conditions',
        'Cookies Policy',
        'Complaints escalation',
        'Advertise',
        'Manage Privacy Settings'
      ],
      [
        'Visit us on Facebook',
        'Visit us on Twitter',
        'Visit us on Instagram',
        'Visit us on Pinterest',
        'Visit us on Youtube',
        'Visit us on Rss'
      ],
      [
        'STEP 1',
        'Heat a large saucepan and dry-fry 2 tsp cumin seeds and a pinch of chilli flakes for 1 min, or until they start to jump around the pan and release their aromas.',
        'STEP 2',
        'Scoop out about half with a spoon and set aside. Add 2 tbsp olive oil, 600g coarsely grated carrots, 140g split red lentils, 1l hot vegetable stock and 125ml milk to the pan and bring to the boil.',
        'STEP 3',
        'Simmer for 15 mins until the lentils have swollen and softened.',
        'STEP 4',
        'Whizz the soup with a stick blender or in a food processor until smooth (or leave it chunky if you prefer).',
        'STEP 5',
        'Season to taste and finish with a dollop of plain yogurt and a sprinkling of the reserved toasted spices. Serve with warmed naan breads.'
      ],
      [
        '2 tsp cumin seeds',
        'pinch chilli flakes',
        '2 tbsp olive oil',
        '600g carrots, washed and coarsely grated (no need to peel)',
        '140g split red lentils',
        '1l hot vegetable stock (from a cube is fine)',
        "125ml milk (to make it dairy-free, see 'try' below)",
        'plain yogurt and naan bread, to serve'
      ],
      [
        'Recipes',
        'How to',
        'Health',
        'Inspiration',
        'Reviews',
        'Budget recipes',
        'Christmas Kitchen',
        'Subscribe now',
        'Good Food subscribers club',
        'Download our app',
        'Wine Club',
        'Roast timer',
        'Gift guides',
        'Videos',
        'Podcast'
      ]
    ],
    names: [
      'Spiced carrot & lentil soup',
      'Ingredients',
      'Sponsored content',
      'Comments, questions and tips (815)',
      'Magazine Subscription',
      'Sponsored content'
    ],
    descriptions: [
      "A delicious, spicy blend packed full of iron and low in fat to boot. It's ready in under half an hour, or can be made in a slow cooker",
      'This is a modal window.',
      'Beginning of dialog window. Escape will cancel and close the window.',
      'End of dialog window.',
      'This is a modal window. This modal can be closed by pressing the Escape key or activating the close button.',
      'Heat a large saucepan and dry-fry 2 tsp cumin seeds and a pinch of chilli flakes for 1 min, or until they start to jump around the pan and release their aromas.'
    ]
  }

  return mockData
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
