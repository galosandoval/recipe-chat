import '@testing-library/jest-dom'
import { screen, fireEvent, act } from '@testing-library/react'
import { renderWithTranslations, en } from '~/lib/test-translations'
import type { RecipeByIdData } from '~/hooks/use-recipe'

let recipeData: RecipeByIdData
let subscriptionTier: string

jest.mock('~/hooks/use-recipe', () => ({
  useRecipe: () => ({ data: recipeData, isLoading: false, isError: false })
}))

jest.mock('next-auth/react', () => ({
  useSession: () => ({ data: { user: { subscriptionTier } } })
}))

const mockToastSuccess = jest.fn()
jest.mock('~/components/toast', () => ({
  toast: { success: (...args: unknown[]) => mockToastSuccess(...args) }
}))

// Imported after the mocks so the component picks them up.
import { CookMode } from './cook-mode'

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
    notes: '',
    cuisine: 'Italian',
    course: 'Dinner',
    dietTags: [],
    flavorTags: [],
    ingredients: [
      ingredient('i1', '2 cups flour'),
      ingredient('i2', '1 cup water')
    ],
    instructions: [
      {
        id: 'in1',
        description: 'Mix the flour and water.',
        recipeId: 'recipe-1'
      },
      {
        id: 'in2',
        description: 'Simmer for 20 minutes until thick.',
        recipeId: 'recipe-1'
      }
    ],
    ...overrides
  } as unknown as RecipeByIdData
}

const openButton = () =>
  screen.getByRole('button', { name: en.recipes.cookMode.open })

function open() {
  renderWithTranslations(<CookMode />)
  fireEvent.click(openButton())
}

beforeEach(() => {
  jest.clearAllMocks()
  recipeData = makeRecipe()
  subscriptionTier = 'STARTER'
})

describe('CookMode gating', () => {
  it('offers the Cook Mode trigger to a STARTER user', () => {
    renderWithTranslations(<CookMode />)
    expect(openButton()).toBeInTheDocument()
  })

  it('hides the Cook Mode trigger from a FREE user', () => {
    subscriptionTier = 'FREE'
    renderWithTranslations(<CookMode />)
    expect(
      screen.queryByRole('button', { name: en.recipes.cookMode.open })
    ).not.toBeInTheDocument()
  })
})

describe('CookMode navigation', () => {
  it('opens on the first step and steps forward and back', () => {
    open()

    expect(screen.getByText('Step 1 of 2')).toBeInTheDocument()
    expect(screen.getByText('Mix the flour and water.')).toBeInTheDocument()

    const prev = screen.getByRole('button', {
      name: en.recipes.cookMode.previous
    })
    expect(prev).toBeDisabled()

    fireEvent.click(
      screen.getByRole('button', { name: en.recipes.cookMode.next })
    )
    expect(screen.getByText('Step 2 of 2')).toBeInTheDocument()
    expect(
      screen.getByText('Simmer for 20 minutes until thick.')
    ).toBeInTheDocument()

    fireEvent.click(
      screen.getByRole('button', { name: en.recipes.cookMode.previous })
    )
    expect(screen.getByText('Step 1 of 2')).toBeInTheDocument()
  })

  it('exits back to the recipe view', () => {
    open()
    fireEvent.click(
      screen.getByRole('button', { name: en.recipes.cookMode.exit })
    )
    expect(screen.queryByText('Step 1 of 2')).not.toBeInTheDocument()
  })
})

describe('CookMode ingredients panel', () => {
  it('reveals the ingredient list on demand', () => {
    open()
    expect(screen.queryByText('2 cups flour')).not.toBeInTheDocument()

    fireEvent.click(
      screen.getByRole('button', {
        name: en.recipes.cookMode.showIngredients
      })
    )
    expect(screen.getByText('2 cups flour')).toBeInTheDocument()
    expect(screen.getByText('1 cup water')).toBeInTheDocument()
  })
})

describe('CookMode step timer', () => {
  it('offers a countdown for a step that mentions a cooking time', () => {
    jest.useFakeTimers()
    open()

    fireEvent.click(
      screen.getByRole('button', { name: en.recipes.cookMode.next })
    )
    const start = screen.getByRole('button', { name: 'Set timer: 20 minutes' })
    fireEvent.click(start)

    expect(screen.getByText('20:00')).toBeInTheDocument()
    act(() => {
      jest.advanceTimersByTime(1000)
    })
    expect(screen.getByText('19:59')).toBeInTheDocument()

    jest.useRealTimers()
  })
})
