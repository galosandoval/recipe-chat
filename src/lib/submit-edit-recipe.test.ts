import { submitEditRecipe } from './submit-edit-recipe'
import type {
  EditRecipeFormValues,
  RecipeToEdit
} from '~/schemas/recipes-schema'

function recipe(overrides: Partial<RecipeToEdit> = {}): RecipeToEdit {
  return {
    id: 'recipe-1',
    name: 'Pasta',
    description: 'Tasty',
    prepMinutes: 10,
    cookMinutes: 20,
    notes: '',
    cuisine: 'Italian',
    course: 'Dinner',
    dietTags: ['vegan'],
    flavorTags: ['savory'],
    ingredients: [],
    instructions: [],
    ...overrides
  } as RecipeToEdit
}

function values(
  overrides: Partial<EditRecipeFormValues> = {}
): EditRecipeFormValues {
  return {
    name: 'Pasta',
    description: 'Tasty',
    ingredients: '',
    instructions: '',
    prepMinutes: 10,
    cookMinutes: 20,
    notes: '',
    cuisine: 'Italian',
    course: 'Dinner',
    dietTags: ['vegan'],
    flavorTags: ['savory'],
    ...overrides
  }
}

describe('submitEditRecipe facets', () => {
  it('passes through the staged cuisine/course as the new facet values', () => {
    const result = submitEditRecipe(
      recipe(),
      values({ cuisine: 'Thai', course: 'Lunch' })
    )

    expect(result.newCuisine).toBe('Thai')
    expect(result.newCourse).toBe('Lunch')
    expect(result.cuisine).toBe('Italian')
    expect(result.course).toBe('Dinner')
  })

  it('emits cleared cuisine/course as empty strings while keeping the old value for the diff', () => {
    const result = submitEditRecipe(
      recipe(),
      values({ cuisine: '', course: '' })
    )

    expect(result.newCuisine).toBe('')
    expect(result.newCourse).toBe('')
    expect(result.cuisine).toBe('Italian')
  })

  it('carries added, removed, and reordered diet/flavor tags', () => {
    const result = submitEditRecipe(
      recipe(),
      values({
        dietTags: ['gluten-free', 'vegan'],
        flavorTags: []
      })
    )

    expect(result.newDietTags).toEqual(['gluten-free', 'vegan'])
    expect(result.newFlavorTags).toEqual([])
    expect(result.dietTags).toEqual(['vegan'])
    expect(result.flavorTags).toEqual(['savory'])
  })
})
