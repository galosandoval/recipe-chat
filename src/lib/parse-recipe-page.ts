import * as cheerio from 'cheerio'
import type {
  LinkedData,
  LinkedDataRecipeField
} from '~/schemas/recipes-schema'

/**
 * Thrown when recipe page content contains no usable Recipe JSON-LD. Callers map
 * this to their transport's error (the tRPC procedure turns it into a
 * `TRPCError`) so the missing-linked-data path stays observable to the client.
 */
export class RecipePageParseError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message)
    this.name = 'RecipePageParseError'
    if (options?.cause !== undefined) {
      this.cause = options.cause
    }
  }
}

/**
 * Extracts the structured Recipe fields from a recipe page's HTML by reading its
 * `application/ld+json` block. Pure — it performs no IO, so the caller owns
 * fetching the URL and this is unit-testable with captured page content.
 *
 * @param html - The full recipe page HTML.
 * @returns The JSON-LD Recipe field (name, ingredients, instructions, facets).
 * @throws {RecipePageParseError} When the page has no Recipe linked data.
 */
export function parseRecipePage(html: string): LinkedDataRecipeField {
  const $ = cheerio.load(html)
  const jsonRaw = (
    $("script[type='application/ld+json']")[0] as unknown as
      | { children: { data: string }[] }
      | undefined
  )?.children[0]?.data

  if (!jsonRaw) {
    throw new RecipePageParseError('Did not find linked data')
  }

  let parsed: LinkedData
  try {
    parsed = JSON.parse(jsonRaw.replace(/\n/g, '')) as LinkedData
  } catch (cause) {
    throw new RecipePageParseError('Failed to parse linked data JSON', {
      cause
    })
  }

  if ('@graph' in parsed) {
    const recipeField = findRecipeField(parsed['@graph'])
    if (recipeField) {
      return recipeField
    }
    throw new RecipePageParseError('Did not find linked data in @graph', {
      cause: parsed
    })
  }

  if (Array.isArray(parsed)) {
    const recipeField = findRecipeField(parsed)
    if (recipeField) {
      return recipeField
    }
  } else if ('@type' in parsed && isRecipeType(parsed['@type'])) {
    return parsed
  }

  throw new RecipePageParseError('Did not find linked data', { cause: parsed })
}

/** Whether a JSON-LD `@type` value marks the node as a Recipe. */
function isRecipeType(field: LinkedDataRecipeField['@type']): boolean {
  if (Array.isArray(field)) {
    return field.some((type) => type === 'Recipe')
  }
  return field === 'Recipe'
}

/** The first Recipe-typed node in a `@graph` or top-level array of nodes. */
function findRecipeField(
  candidates: LinkedDataRecipeField[]
): LinkedDataRecipeField | undefined {
  return candidates.find((candidate) => isRecipeType(candidate['@type']))
}
