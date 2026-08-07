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

const activeStep = () => screen.getByRole('listitem', { current: 'step' })

beforeEach(() => {
  jest.clearAllMocks()
  recipeData = makeRecipe()
  subscriptionTier = 'STARTER'
  // jsdom implements neither, and the snap list uses both.
  Element.prototype.scrollIntoView = jest.fn()
  window.IntersectionObserver = undefined as never
})

describe('CookMode gating', () => {
  it('offers the Cook Mode trigger to a STARTER user', () => {
    renderWithTranslations(<CookMode />)
    expect(openButton()).toBeInTheDocument()
  })

  // Not tier-gated yet — see TODO on CookMode in cook-mode.tsx.
  it.todo('hides the Cook Mode trigger from a FREE user')
})

describe('CookMode navigation', () => {
  it('renders every step as one scrollable list', () => {
    open()

    expect(screen.getByText('Step 1 of 2')).toBeInTheDocument()
    expect(screen.getByText('Mix the flour and water.')).toBeInTheDocument()
    expect(screen.getByText('Step 2 of 2')).toBeInTheDocument()
    expect(
      screen.getByText('Simmer for 20 minutes until thick.')
    ).toBeInTheDocument()
  })

  it('opens on the first step and steps forward and back', () => {
    open()

    expect(activeStep()).toHaveTextContent('Mix the flour and water.')

    const prev = screen.getByRole('button', {
      name: en.recipes.cookMode.previous
    })
    expect(prev).toBeDisabled()

    fireEvent.click(
      screen.getByRole('button', { name: en.recipes.cookMode.next })
    )
    expect(activeStep()).toHaveTextContent('Simmer for 20 minutes until thick.')

    fireEvent.click(
      screen.getByRole('button', { name: en.recipes.cookMode.previous })
    )
    expect(activeStep()).toHaveTextContent('Mix the flour and water.')
  })

  it('scrolls the step into view when Next is pressed', () => {
    open()

    fireEvent.click(
      screen.getByRole('button', { name: en.recipes.cookMode.next })
    )
    expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start'
    })
  })

  it('exits back to the recipe view', () => {
    open()
    fireEvent.click(
      screen.getByRole('button', { name: en.recipes.cookMode.exit })
    )
    expect(screen.queryByText('Step 1 of 2')).not.toBeInTheDocument()
  })

  it('disables Next on the last step', () => {
    open()
    fireEvent.click(
      screen.getByRole('button', { name: en.recipes.cookMode.next })
    )
    expect(
      screen.getByRole('button', { name: en.recipes.cookMode.next })
    ).toBeDisabled()
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
