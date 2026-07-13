import '@testing-library/jest-dom'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithTranslations, en } from '~/lib/test-translations'
import type { RecipeByIdData } from '~/hooks/use-recipe'

const mockEdit = jest.fn()
const mockInvalidate = jest.fn(() => Promise.resolve())

let recipeData: RecipeByIdData

jest.mock('~/hooks/use-no-sleep', () => ({ useNoSleep: () => {} }))

jest.mock('~/hooks/use-recipe', () => ({
  useRecipe: () => ({ data: recipeData, isLoading: false, isError: false })
}))

jest.mock('next/navigation', () => ({
  useParams: () => ({ slug: 'pasta' }),
  usePathname: () => '/recipes/pasta'
}))

// Heavy read-view children are exercised by their own suites; stub them so this
// test stays focused on the inline edit-mode seam.
jest.mock('./ingredients-check-list', () => ({
  IngredientsCheckList: () => <div data-testid='ingredients-check-list' />
}))
jest.mock('~/components/add-image-dropdown', () => ({
  AddImageDropdown: () => <div data-testid='add-image-dropdown' />
}))
jest.mock('~/components/parallax-container', () => ({
  ParallaxContainer: () => <div data-testid='parallax' />
}))
jest.mock('./update-recipe-image', () => ({
  UpdateImage: () => <div data-testid='update-image' />
}))

jest.mock('~/trpc/react', () => ({
  api: {
    useUtils: () => ({
      recipes: { bySlug: { invalidate: mockInvalidate } }
    }),
    recipes: {
      edit: {
        useMutation: (opts: { onSuccess?: (slug: string) => void }) => ({
          isPending: false,
          mutate: (vars: { id: string }) => {
            mockEdit(vars)
            opts?.onSuccess?.('pasta')
          }
        })
      }
    }
  }
}))

// Imported after the mocks so the component picks them up.
import { RecipeById } from './recipe-by-id'

function ingredient(id: string, rawString: string) {
  return {
    id,
    rawString,
    quantity: null,
    unit: null,
    itemName: null,
    preparation: null,
    listId: null,
    recipeId: 'recipe-1',
    checked: false
  }
}

function makeRecipe(overrides: Partial<RecipeByIdData> = {}): RecipeByIdData {
  return {
    id: 'recipe-1',
    name: 'Pasta',
    description: 'Tasty pasta',
    imgUrl: null,
    prepTime: null,
    cookTime: null,
    prepMinutes: 10,
    cookMinutes: 20,
    servings: 4,
    notes: 'Use fresh basil',
    cuisine: 'Italian',
    course: 'Dinner',
    dietTags: ['vegan'],
    flavorTags: ['savory'],
    ingredients: [
      ingredient('i1', '2 cups flour'),
      ingredient('i2', '1 cup water')
    ],
    instructions: [
      { id: 'in1', description: 'Mix', recipeId: 'recipe-1' },
      { id: 'in2', description: 'Cook', recipeId: 'recipe-1' }
    ],
    ...overrides
  } as unknown as RecipeByIdData
}

const editButton = () =>
  screen.getByRole('button', { name: en.recipes.byId.edit })
const saveButton = () =>
  screen.getByRole('button', { name: en.recipes.byId.save })
const cancelButton = () =>
  screen.getByRole('button', { name: en.recipes.byId.cancel })

function enterEditMode() {
  renderWithTranslations(<RecipeById />)
  fireEvent.click(editButton())
}

beforeEach(() => {
  jest.clearAllMocks()
  recipeData = makeRecipe()
})

describe('RecipeById inline edit mode', () => {
  it('surfaces the Recipe Facets as badges in the reading view', () => {
    renderWithTranslations(<RecipeById />)
    expect(screen.getByText('Italian')).toBeInTheDocument()
    expect(screen.getByText('Dinner')).toBeInTheDocument()
    expect(screen.getByText('vegan')).toBeInTheDocument()
    expect(screen.getByText('savory')).toBeInTheDocument()
  })

  it('omits the Facet badges when the Recipe has no Facets', () => {
    recipeData = makeRecipe({
      cuisine: null,
      course: null,
      dietTags: [],
      flavorTags: []
    })
    renderWithTranslations(<RecipeById />)
    expect(screen.queryByText('Italian')).not.toBeInTheDocument()
  })

  it('flips into edit mode and seeds every field from the Recipe', () => {
    enterEditMode()

    expect(screen.getByDisplayValue('Pasta')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Tasty pasta')).toBeInTheDocument()
    // Testing Library collapses newlines in display-value queries, so assert the
    // raw textarea value directly.
    expect(screen.getByLabelText(en.recipes.ingredients)).toHaveValue(
      '2 cups flour\n1 cup water'
    )
    expect(screen.getByLabelText(en.recipes.instructions)).toHaveValue(
      'Mix\nCook'
    )
    expect(screen.getByDisplayValue('Use fresh basil')).toBeInTheDocument()
    // Facet tag rows seed as editable inputs.
    expect(screen.getByDisplayValue('vegan')).toBeInTheDocument()
    expect(screen.getByDisplayValue('savory')).toBeInTheDocument()
  })

  it('stages edits locally without firing the mutation', () => {
    enterEditMode()
    fireEvent.change(screen.getByDisplayValue('Pasta'), {
      target: { value: 'Spaghetti' }
    })
    expect(screen.getByDisplayValue('Spaghetti')).toBeInTheDocument()
    expect(mockEdit).not.toHaveBeenCalled()
  })

  it('commits name, ingredient, and Facet edits in a single edit call', async () => {
    enterEditMode()

    fireEvent.change(screen.getByDisplayValue('Pasta'), {
      target: { value: 'Spaghetti' }
    })

    // Add a diet tag via the add-row and remove the seeded one.
    fireEvent.change(
      screen.getByPlaceholderText(en.recipes.byId.facets.dietPlaceholder),
      { target: { value: 'spicy' } }
    )
    fireEvent.keyDown(
      screen.getByPlaceholderText(en.recipes.byId.facets.dietPlaceholder),
      { key: 'Enter' }
    )
    fireEvent.click(
      screen.getByRole('button', { name: `${en.common.delete} vegan` })
    )

    fireEvent.click(saveButton())

    await waitFor(() => expect(mockEdit).toHaveBeenCalledTimes(1))
    const payload = mockEdit.mock.calls[0][0]
    expect(payload.newName).toBe('Spaghetti')
    expect(payload.newDietTags).toEqual(['spicy'])
    expect(payload.newFlavorTags).toEqual(['savory'])
    expect(payload.newCuisine).toBe('Italian')
    expect(payload.newCourse).toBe('Dinner')
  })

  it('returns to the reading view after a successful save', async () => {
    enterEditMode()
    fireEvent.change(screen.getByDisplayValue('Pasta'), {
      target: { value: 'Spaghetti' }
    })
    fireEvent.click(saveButton())

    await waitFor(() => expect(editButton()).toBeInTheDocument())
    expect(screen.queryByDisplayValue('Spaghetti')).not.toBeInTheDocument()
  })

  it('prompts to discard when cancelling with unsaved changes', () => {
    enterEditMode()
    fireEvent.change(screen.getByDisplayValue('Pasta'), {
      target: { value: 'Spaghetti' }
    })
    fireEvent.click(cancelButton())

    expect(screen.getByText(en.recipes.byId.discardTitle)).toBeInTheDocument()

    fireEvent.click(
      screen.getByRole('button', { name: en.recipes.byId.discardConfirm })
    )
    expect(mockEdit).not.toHaveBeenCalled()
    expect(editButton()).toBeInTheDocument()
  })

  it('exits edit mode without a prompt when nothing changed', () => {
    enterEditMode()
    fireEvent.click(cancelButton())
    expect(
      screen.queryByText(en.recipes.byId.discardTitle)
    ).not.toBeInTheDocument()
    expect(editButton()).toBeInTheDocument()
  })
})
