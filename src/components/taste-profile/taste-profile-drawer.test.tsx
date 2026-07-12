import '@testing-library/jest-dom'
import { screen, fireEvent, waitFor, act } from '@testing-library/react'
import { renderWithTranslations, en } from '~/lib/test-translations'
import { TasteProfileDrawer } from './taste-profile-drawer'
import { useTasteProfileDrawerStore } from './taste-profile-drawer-store'

const mockUpsertMutate = jest.fn()
const mockSkipMutate = jest.fn()
const mockQuery: { data: unknown; isPending: boolean } = {
  data: null,
  isPending: false
}

jest.mock('next-auth/react', () => ({
  useSession: () => ({ status: 'authenticated' })
}))

// Stand in for the overlay so the wrapper's open/close logic is testable without
// fighting Vaul/Radix portals: render children when open and expose a dismiss.
jest.mock('~/components/drawer-dialog', () => ({
  DrawerDialog: ({
    children,
    open,
    onOpenChange
  }: {
    children: React.ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
  }) =>
    open ? (
      <div>
        <button onClick={() => onOpenChange?.(false)}>mock-dismiss</button>
        {children}
      </div>
    ) : null
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

const clickButton = (name: RegExp) =>
  fireEvent.click(screen.getByRole('button', { name }))

beforeEach(() => {
  jest.clearAllMocks()
  mockQuery.data = null
  mockQuery.isPending = false
  act(() => useTasteProfileDrawerStore.getState().close())
})

/** Walks the quiz from the opened first step through Finish, leaving defaults. */
async function finishQuiz() {
  clickButton(/^next$/i) // dietary -> cuisines
  await screen.findByRole('button', { name: /italian/i })
  clickButton(/^next$/i) // cuisines -> skill
  await screen.findByRole('button', { name: /intermediate/i })
  clickButton(/^next$/i) // skill -> household
  await screen.findByRole('button', { name: /balanced/i })
  clickButton(/^next$/i) // household -> review
  await screen.findByText(en.onboarding.reviewTitle)
  clickButton(/^finish$/i)
}

describe('TasteProfileDrawer', () => {
  it('auto-opens for an authenticated user with no saved profile', async () => {
    renderWithTranslations(<TasteProfileDrawer />)
    expect(
      await screen.findByText(en.onboarding.dietaryRestrictionsTitle)
    ).toBeInTheDocument()
  })

  it('no longer renders a Skip button', async () => {
    renderWithTranslations(<TasteProfileDrawer />)
    await screen.findByText(en.onboarding.dietaryRestrictionsTitle)
    expect(
      screen.queryByRole('button', { name: /^skip$/i })
    ).not.toBeInTheDocument()
  })

  it('saves sensible defaults once when dismissed mid-quiz', async () => {
    renderWithTranslations(<TasteProfileDrawer />)
    await screen.findByText(en.onboarding.dietaryRestrictionsTitle)

    clickButton(/mock-dismiss/i)
    await waitFor(() => expect(mockSkipMutate).toHaveBeenCalledTimes(1))
    expect(mockUpsertMutate).not.toHaveBeenCalled()
  })

  it('does not double-save when the quiz is completed', async () => {
    renderWithTranslations(<TasteProfileDrawer />)
    await screen.findByText(en.onboarding.dietaryRestrictionsTitle)

    await finishQuiz()
    await waitFor(() => expect(mockUpsertMutate).toHaveBeenCalledTimes(1))
    expect(mockSkipMutate).not.toHaveBeenCalled()
    // Finishing closes the overlay, so the quiz unmounts.
    expect(
      screen.queryByText(en.onboarding.dietaryRestrictionsTitle)
    ).not.toBeInTheDocument()
  })

  it('stays closed for a returning user who already has a profile', () => {
    mockQuery.data = returningProfile()
    renderWithTranslations(<TasteProfileDrawer />)
    expect(
      screen.queryByText(en.onboarding.dietaryRestrictionsTitle)
    ).not.toBeInTheDocument()
  })

  it('does not clobber an existing profile when dismissed mid-edit', async () => {
    mockQuery.data = returningProfile()
    renderWithTranslations(<TasteProfileDrawer />)
    // Returning user opens via a deliberate trigger (e.g. the edit menu entry).
    act(() => useTasteProfileDrawerStore.getState().open())
    await screen.findByText(en.onboarding.dietaryRestrictionsTitle)

    clickButton(/mock-dismiss/i)
    expect(mockSkipMutate).not.toHaveBeenCalled()
    expect(mockUpsertMutate).not.toHaveBeenCalled()
  })
})

function returningProfile() {
  return {
    id: 'tp_1',
    dietaryRestrictions: [],
    cuisinePreferences: ['American'],
    cookingSkill: 'intermediate',
    householdSize: 2,
    healthGoals: []
  }
}
