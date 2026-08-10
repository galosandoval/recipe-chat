/**
 * @jest-environment node
 */
import { parseRecipePage, RecipePageParseError } from '~/lib/parse-recipe-page'

/** Wraps a JSON-LD payload in the minimal page markup a real site would emit. */
function pageWithJsonLd(jsonLd: string): string {
  return `<!doctype html><html><head><title>Recipe</title>
<script type="application/ld+json">${jsonLd}</script>
</head><body><h1>Recipe</h1></body></html>`
}

const RECIPE_NODE = {
  '@type': 'Recipe',
  name: 'Classic Carbonara',
  description: 'Roman pasta',
  recipeIngredient: ['200g spaghetti', '2 eggs', '100g pancetta'],
  recipeInstructions: [{ text: 'Boil pasta' }, { text: 'Emulsify eggs' }]
}

describe('parseRecipePage', () => {
  it('extracts the Recipe node from a page with complete @graph JSON-LD', () => {
    const html = pageWithJsonLd(
      JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [{ '@type': 'WebPage', name: 'A blog post' }, RECIPE_NODE]
      })
    )

    const result = parseRecipePage(html)

    expect(result.name).toBe('Classic Carbonara')
    expect(result.recipeIngredient).toEqual([
      '200g spaghetti',
      '2 eggs',
      '100g pancetta'
    ])
    expect(result.recipeInstructions).toEqual([
      { text: 'Boil pasta' },
      { text: 'Emulsify eggs' }
    ])
  })

  it('extracts a top-level Recipe object (no @graph wrapper)', () => {
    const html = pageWithJsonLd(
      JSON.stringify({ '@context': 'https://schema.org', ...RECIPE_NODE })
    )

    const result = parseRecipePage(html)

    expect(result.name).toBe('Classic Carbonara')
  })

  it('extracts the Recipe node when @type is an array of types', () => {
    const html = pageWithJsonLd(
      JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [{ ...RECIPE_NODE, '@type': ['Recipe', 'NewsArticle'] }]
      })
    )

    const result = parseRecipePage(html)

    expect(result.name).toBe('Classic Carbonara')
  })

  it('extracts the Recipe node from a top-level array of nodes', () => {
    const html = pageWithJsonLd(
      JSON.stringify([
        { '@context': 'https://schema.org', '@type': 'Organization' },
        { '@context': 'https://schema.org', ...RECIPE_NODE }
      ])
    )

    const result = parseRecipePage(html)

    expect(result.name).toBe('Classic Carbonara')
  })

  it('returns partial data as-is when optional fields are missing', () => {
    const html = pageWithJsonLd(
      JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Recipe',
        name: 'Bare Recipe'
      })
    )

    const result = parseRecipePage(html)

    expect(result.name).toBe('Bare Recipe')
    expect(result.recipeIngredient).toBeUndefined()
    expect(result.recipeInstructions).toBeUndefined()
  })

  it('throws when the page has no JSON-LD script block', () => {
    const html =
      '<!doctype html><html><body><h1>No data here</h1></body></html>'

    expect(() => parseRecipePage(html)).toThrow(RecipePageParseError)
  })

  it('throws when the @graph has no Recipe node', () => {
    const html = pageWithJsonLd(
      JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [{ '@type': 'WebPage', name: 'Just a page' }]
      })
    )

    expect(() => parseRecipePage(html)).toThrow('Did not find linked data')
  })

  it('throws when the JSON-LD block is malformed', () => {
    const html = pageWithJsonLd('{ this is not valid json }')

    expect(() => parseRecipePage(html)).toThrow(RecipePageParseError)
  })
})
