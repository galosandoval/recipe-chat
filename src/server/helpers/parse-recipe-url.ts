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
