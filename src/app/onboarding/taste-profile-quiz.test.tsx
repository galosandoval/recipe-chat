import '@testing-library/jest-dom'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithTranslations, en } from '~/lib/test-translations'
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
    useUtils: () => ({
      tasteProfile: { get: { invalidate: jest.fn() } }
    }),
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
  return renderWithTranslations(<TasteProfileQuiz />)
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
    expect(
      await screen.findByText(en.onboarding.reviewTitle)
    ).toBeInTheDocument()
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

  it('no longer offers a "None" dietary option', () => {
    renderQuiz()
    expect(
      screen.queryByRole('button', { name: /^none$/i })
    ).not.toBeInTheDocument()
  })

  /** Walks the wizard from the cuisine step to the end, leaving defaults. */
  async function finishFromCuisines() {
    clickButton(/^next$/i) // cuisines -> skill
    await screen.findByRole('button', { name: /intermediate/i })
    clickButton(/^next$/i) // skill -> household
    await screen.findByRole('button', { name: /balanced/i })
    clickButton(/^next$/i) // household -> review
    await screen.findByText(en.onboarding.reviewTitle)
    clickButton(/^finish$/i)
  }

  it('completes with zero cuisines selected and submits an empty array', async () => {
    renderQuiz()
    clickButton(/^next$/i) // dietary -> cuisines
    await screen.findByRole('button', { name: /italian/i })
    await finishFromCuisines()
    await waitFor(() => expect(mockUpsertMutate).toHaveBeenCalledTimes(1))
    expect(mockUpsertMutate.mock.calls[0][0]).toMatchObject({
      cuisinePreferences: []
    })
  })

  it('adds a custom dietary value, shows it selected, and submits it', async () => {
    renderQuiz()
    const input = screen.getByLabelText(en.onboarding.dietaryCustomLabel)
    fireEvent.change(input, { target: { value: 'pescatarian' } })
    fireEvent.click(screen.getByRole('button', { name: en.onboarding.add }))
    expect(
      screen.getByRole('button', { name: /pescatarian/i })
    ).toHaveAttribute('aria-pressed', 'true')

    clickButton(/^next$/i) // dietary -> cuisines
    await screen.findByRole('button', { name: /italian/i })
    await finishFromCuisines()
    await waitFor(() => expect(mockUpsertMutate).toHaveBeenCalledTimes(1))
    expect(mockUpsertMutate.mock.calls[0][0]).toMatchObject({
      dietaryRestrictions: ['pescatarian']
    })
  })

  it('adds a custom cuisine via Enter and submits it', async () => {
    renderQuiz()
    clickButton(/^next$/i) // dietary -> cuisines
    const input = await screen.findByLabelText(en.onboarding.cuisineCustomLabel)
    fireEvent.change(input, { target: { value: 'Vietnamese' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(screen.getByRole('button', { name: /vietnamese/i })).toHaveAttribute(
      'aria-pressed',
      'true'
    )

    await finishFromCuisines()
    await waitFor(() => expect(mockUpsertMutate).toHaveBeenCalledTimes(1))
    expect(mockUpsertMutate.mock.calls[0][0]).toMatchObject({
      cuisinePreferences: ['Vietnamese']
    })
  })

  it('rejects blank and duplicate custom additions', () => {
    renderQuiz()
    const input = screen.getByLabelText(en.onboarding.dietaryCustomLabel)
    const add = () =>
      fireEvent.click(screen.getByRole('button', { name: en.onboarding.add }))

    // blank
    fireEvent.change(input, { target: { value: '  ' } })
    add()
    // duplicate of a preset (case-insensitive)
    fireEvent.change(input, { target: { value: 'VEGAN' } })
    add()
    expect(screen.getAllByRole('button', { name: /vegan/i })).toHaveLength(1)
  })

  it('pre-selects saved custom values for a returning user', () => {
    mockQuery.data = buildProfile({
      dietaryRestrictions: ['pescatarian'],
      cuisinePreferences: ['Cajun']
    })
    renderQuiz()
    expect(
      screen.getByRole('button', { name: /pescatarian/i })
    ).toHaveAttribute('aria-pressed', 'true')
  })

  it('shows "None" on review for empty dietary and cuisine rows', async () => {
    renderQuiz()
    clickButton(/^next$/i) // dietary (empty) -> cuisines
    await screen.findByRole('button', { name: /italian/i })
    clickButton(/^next$/i) // cuisines (empty) -> skill
    await screen.findByRole('button', { name: /intermediate/i })
    clickButton(/^next$/i) // skill -> household
    await screen.findByRole('button', { name: /balanced/i })
    clickButton(/^next$/i) // household -> review
    await screen.findByText(en.onboarding.reviewTitle)

    /** The value cell (`dd`) for a given review row label. */
    const rowValue = (label: string) =>
      screen.getByText(label).nextElementSibling
    expect(
      rowValue(en.onboarding.reviewLabels.dietaryRestrictions)
    ).toHaveTextContent(en.onboarding.noneSelected)
    expect(
      rowValue(en.onboarding.reviewLabels.cuisinePreferences)
    ).toHaveTextContent(en.onboarding.noneSelected)
  })

  it('treats a legacy "none" profile as no restrictions (no chip, empty submit)', async () => {
    mockQuery.data = buildProfile({
      dietaryRestrictions: ['none'],
      cuisinePreferences: []
    })
    renderQuiz()
    expect(
      screen.queryByRole('button', { name: /^none$/i })
    ).not.toBeInTheDocument()

    clickButton(/^next$/i) // dietary -> cuisines
    await screen.findByRole('button', { name: /italian/i })
    await finishFromCuisines()
    await waitFor(() => expect(mockUpsertMutate).toHaveBeenCalledTimes(1))
    expect(mockUpsertMutate.mock.calls[0][0]).toMatchObject({
      dietaryRestrictions: []
    })
  })

  it('surfaces a visible error on Next when a step fails validation', async () => {
    mockQuery.data = buildProfile({ cookingSkill: 'expert' })
    renderQuiz()
    clickButton(/^next$/i) // dietary -> cuisines
    await screen.findByRole('button', { name: /italian/i })
    clickButton(/^next$/i) // cuisines -> skill (invalid cookingSkill)
    await screen.findByText(en.onboarding.cookingSkillTitle)
    clickButton(/^next$/i) // attempt skill -> household, should fail

    expect(await screen.findByRole('alert')).toHaveTextContent(/cooking skill/i)
    // still on the skill step, not advanced to household
    expect(
      screen.queryByRole('button', { name: /balanced/i })
    ).not.toBeInTheDocument()
  })
})
