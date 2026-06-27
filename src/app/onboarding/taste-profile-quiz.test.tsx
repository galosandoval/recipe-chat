import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { TranslationsContext } from '~/hooks/use-translations'
import en from '../../../public/translations/en.json'
import { TasteProfileQuiz } from './taste-profile-quiz'

const mockUpsertMutate = jest.fn()
const mockSkipMutate = jest.fn()
const mockPush = jest.fn()
const mockQuery: { data: unknown; isPending: boolean } = {
  data: null,
  isPending: false
}

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush })
}))

jest.mock('~/trpc/react', () => ({
  api: {
    tasteProfile: {
      get: { useQuery: () => mockQuery },
      upsert: {
        useMutation: (opts: { onSuccess?: () => void }) => ({
          mutate: (v: unknown) => {
            mockUpsertMutate(v)
            opts?.onSuccess?.()
          },
          status: 'idle'
        })
      },
      skip: {
        useMutation: (opts: { onSuccess?: () => void }) => ({
          mutate: () => {
            mockSkipMutate()
            opts?.onSuccess?.()
          },
          status: 'idle'
        })
      }
    }
  }
}))

function buildProfile(overrides: Record<string, unknown> = {}) {
  return {
    id: 'tp_1',
    userId: 'u_1',
    createdAt: new Date(),
    updatedAt: new Date(),
    dietaryRestrictions: [],
    cuisinePreferences: ['American'],
    cookingSkill: 'intermediate',
    householdSize: 2,
    healthGoals: [],
    ...overrides
  }
}

function renderQuiz() {
  return render(
    <TranslationsContext.Provider
      value={{ translations: en as never, locale: 'en' }}
    >
      <TasteProfileQuiz />
    </TranslationsContext.Provider>
  )
}

const clickButton = (name: RegExp) =>
  fireEvent.click(screen.getByRole('button', { name }))

beforeEach(() => {
  jest.clearAllMocks()
  mockQuery.data = null
  mockQuery.isPending = false
})

describe('TasteProfileQuiz', () => {
  it('shows a loading indicator while the profile is being fetched', () => {
    mockQuery.isPending = true
    renderQuiz()
    expect(screen.getByText(en.onboarding.loading)).toBeInTheDocument()
  })

  it('pre-selects a returning user’s saved options after the loader settles', () => {
    mockQuery.data = buildProfile({ dietaryRestrictions: ['vegan'] })
    renderQuiz()
    expect(screen.getByRole('button', { name: /vegan/i })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    expect(screen.getByRole('button', { name: /^paleo$/i })).toHaveAttribute(
      'aria-pressed',
      'false'
    )
  })

  it('reflects a selection immediately, without any navigation', () => {
    renderQuiz()
    const vegan = screen.getByRole('button', { name: /vegan/i })
    expect(vegan).toHaveAttribute('aria-pressed', 'false')
    fireEvent.click(vegan)
    expect(vegan).toHaveAttribute('aria-pressed', 'true')
  })

  it('preserves a selection across Next then Back', async () => {
    renderQuiz()
    // step 0 -> dietary (defaults valid), advance to cuisines
    clickButton(/^next$/i)
    const italian = await screen.findByRole('button', { name: /italian/i })
    fireEvent.click(italian)
    // advance to skill, then go back to cuisines
    clickButton(/^next$/i)
    await screen.findByRole('button', { name: /intermediate/i })
    clickButton(/^back$/i)
    expect(
      await screen.findByRole('button', { name: /italian/i })
    ).toHaveAttribute('aria-pressed', 'true')
  })

  it('lists the chosen selections on review and finishes with those exact values', async () => {
    renderQuiz()
    // step 0 dietary
    fireEvent.click(screen.getByRole('button', { name: /vegan/i }))
    clickButton(/^next$/i)
    // step 1 cuisines
    fireEvent.click(await screen.findByRole('button', { name: /italian/i }))
    clickButton(/^next$/i)
    // step 2 skill (default intermediate)
    await screen.findByRole('button', { name: /intermediate/i })
    clickButton(/^next$/i)
    // step 3 household + goals (defaults)
    await screen.findByRole('button', { name: /balanced/i })
    clickButton(/^next$/i)
    // step 4 review
    expect(await screen.findByText(en.onboarding.reviewTitle)).toBeInTheDocument()
    expect(screen.getByText('vegan')).toBeInTheDocument()
    expect(screen.getByText('Italian')).toBeInTheDocument()

    clickButton(/^finish$/i)
    await waitFor(() => expect(mockUpsertMutate).toHaveBeenCalledTimes(1))
    expect(mockUpsertMutate).toHaveBeenCalledWith({
      dietaryRestrictions: ['vegan'],
      cuisinePreferences: ['Italian'],
      cookingSkill: 'intermediate',
      householdSize: 2,
      healthGoals: []
    })
    expect(mockPush).toHaveBeenCalledWith('/chat')
  })
})
