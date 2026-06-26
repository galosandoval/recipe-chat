/**
 * @jest-environment node
 */
import { toRecipeWriteData } from '~/schemas/recipes-schema'

describe('toRecipeWriteData', () => {
  it('passes through every present scalar + facet field', () => {
    expect(
      toRecipeWriteData({
        description: 'Roman pasta',
        prepMinutes: 10,
        cookMinutes: 20,
        servings: 4,
        cuisine: 'italian',
        course: 'dinner',
        dietTags: ['gluten-free'],
        flavorTags: ['savory'],
        mainIngredients: ['egg', 'pancetta'],
        techniques: ['emulsify']
      })
    ).toEqual({
      description: 'Roman pasta',
      prepMinutes: 10,
      cookMinutes: 20,
      servings: 4,
      cuisine: 'italian',
      course: 'dinner',
      dietTags: ['gluten-free'],
      flavorTags: ['savory'],
      mainIngredients: ['egg', 'pancetta'],
      techniques: ['emulsify']
    })
  })

  it('normalizes null and missing fields to undefined so Prisma skips them', () => {
    const result = toRecipeWriteData({
      description: null,
      cuisine: null,
      dietTags: null
    })

    // null collapses to undefined (Prisma "do not touch this column")
    expect(result.description).toBeUndefined()
    expect(result.cuisine).toBeUndefined()
    expect(result.dietTags).toBeUndefined()
    // fields that weren't supplied are undefined too
    expect(result.servings).toBeUndefined()
    expect(result.techniques).toBeUndefined()
  })

  it('strips unknown keys (id/slug/name/url/messageId/relations) from the payload', () => {
    const result = toRecipeWriteData({
      // identity + relation + non-column keys callers may spread in
      id: 'recipe-1',
      slug: 'carbonara',
      name: 'Carbonara',
      url: 'https://example.com',
      messageId: 'msg-1',
      ingredients: ['egg'],
      instructions: ['mix'],
      saved: true,
      cuisine: 'italian'
    } as Parameters<typeof toRecipeWriteData>[0])

    expect(result).not.toHaveProperty('id')
    expect(result).not.toHaveProperty('slug')
    expect(result).not.toHaveProperty('name')
    expect(result).not.toHaveProperty('url')
    expect(result).not.toHaveProperty('messageId')
    expect(result).not.toHaveProperty('ingredients')
    expect(result).not.toHaveProperty('instructions')
    expect(result).not.toHaveProperty('saved')
    expect(result.cuisine).toBe('italian')
  })
})
