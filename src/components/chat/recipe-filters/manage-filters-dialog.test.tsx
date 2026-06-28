import '@testing-library/jest-dom'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithTranslations, en } from '~/lib/test-translations'
import type { Filter } from '@prisma/client'

const mockSave = jest.fn()
const mockInvalidate = jest.fn()
const mockToastError = jest.fn()

let mockFilters: Filter[] = []

jest.mock('~/hooks/use-user-id', () => ({
  useUserId: () => 'user-1'
}))

jest.mock('~/components/toast', () => ({
  toast: { error: (msg: string) => mockToastError(msg), success: jest.fn() }
}))

jest.mock('~/trpc/react', () => ({
  api: {
    useUtils: () => ({
      filters: { getByUserId: { invalidate: mockInvalidate } }
    }),
    filters: {
      getByUserId: {
        useQuery: () => ({
          data: mockFilters,
          status: 'success',
          fetchStatus: 'idle'
        })
      },
      save: {
        useMutation: (opts: { onSuccess?: () => void }) => ({
          isPending: false,
          mutate: (
            vars: unknown,
            callOpts?: { onSuccess?: () => void }
          ) => {
            mockSave(vars)
            opts?.onSuccess?.()
            callOpts?.onSuccess?.()
          }
        })
      }
    }
  }
}))

// Imported after the mocks so the component picks them up.
import { ManageFiltersDialog } from './manage-filters-dialog'

function filter(name: string, overrides: Partial<Filter> = {}): Filter {
  return {
    id: `id-${name}`,
    name,
    userId: 'user-1',
    checked: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  }
}

function openDialog() {
  renderWithTranslations(<ManageFiltersDialog />)
  fireEvent.click(screen.getByRole('button', { name: en.filters.manage }))
}

const addInput = () => screen.getByPlaceholderText(en.filters.placeholder)
const saveButton = () => screen.getByRole('button', { name: en.common.save })
const removeButton = (name: string) =>
  screen.getByRole('button', { name: `${en.common.delete} ${name}` })

/** Stages a new filter and waits for the async (zod) validation to settle. */
async function addFilter(name: string) {
  fireEvent.change(addInput(), { target: { value: name } })
  fireEvent.click(screen.getByRole('button', { name: en.filters.add }))
  // The staged filter gets its own remove control once the add commits.
  return screen.findByRole('button', { name: `${en.common.delete} ${name}` })
}

beforeEach(() => {
  jest.clearAllMocks()
  mockFilters = [filter('vegan'), filter('quick', { checked: false })]
})

describe('ManageFiltersDialog', () => {
  it('renders each persisted filter as an editable input with a remove control', () => {
    openDialog()
    expect(screen.getByDisplayValue('vegan')).toBeInTheDocument()
    expect(screen.getByDisplayValue('quick')).toBeInTheDocument()
    expect(removeButton('vegan')).toBeInTheDocument()
  })

  it('stages a rename locally without firing a mutation', () => {
    openDialog()
    fireEvent.change(screen.getByDisplayValue('vegan'), {
      target: { value: 'vegano' }
    })
    expect(screen.getByDisplayValue('vegano')).toBeInTheDocument()
    expect(mockSave).not.toHaveBeenCalled()
  })

  it('stages an added filter locally without firing a mutation', async () => {
    openDialog()
    await addFilter('spicy')
    expect(removeButton('spicy')).toBeInTheDocument()
    expect(mockSave).not.toHaveBeenCalled()
  })

  it('stages a removal locally without firing a mutation', () => {
    openDialog()
    fireEvent.click(removeButton('quick'))
    expect(screen.queryByDisplayValue('quick')).not.toBeInTheDocument()
    expect(mockSave).not.toHaveBeenCalled()
  })

  it('commits add, remove, and rename in a single save call', async () => {
    openDialog()
    fireEvent.change(screen.getByDisplayValue('vegan'), {
      target: { value: 'vegano' }
    })
    fireEvent.click(removeButton('quick'))
    await addFilter('spicy')

    fireEvent.click(saveButton())

    await waitFor(() => expect(mockSave).toHaveBeenCalledTimes(1))
    const { filters } = mockSave.mock.calls[0][0] as {
      filters: { id: string; name: string }[]
    }
    expect(filters.map((f) => f.name).sort()).toEqual(['spicy', 'vegano'])
    expect(filters).toContainEqual({ id: 'id-vegan', name: 'vegano' })
  })

  it('blocks Save and shows an inline error when a rename collides', async () => {
    openDialog()
    // Rename 'quick' to collide with the persisted 'vegan'.
    fireEvent.change(screen.getByDisplayValue('quick'), {
      target: { value: 'vegan' }
    })
    fireEvent.click(saveButton())

    expect(
      await screen.findByText(en.filters.nameAlreadyExists)
    ).toBeInTheDocument()
    expect(mockSave).not.toHaveBeenCalled()
  })

  it('closes without a discard prompt when there are no changes', () => {
    openDialog()
    fireEvent.click(screen.getByRole('button', { name: en.common.cancel }))
    expect(screen.queryByText(en.filters.discardTitle)).not.toBeInTheDocument()
    expect(screen.queryByText(en.filters.manage)).not.toBeInTheDocument()
  })

  it('prompts to discard staged changes and discards on confirm', async () => {
    openDialog()
    await addFilter('spicy')

    fireEvent.click(screen.getByRole('button', { name: en.common.cancel }))
    expect(screen.getByText(en.filters.discardTitle)).toBeInTheDocument()

    fireEvent.click(
      screen.getByRole('button', { name: en.filters.discardConfirm })
    )
    expect(mockSave).not.toHaveBeenCalled()
    expect(screen.queryByText(en.filters.manage)).not.toBeInTheDocument()
  })

  it('keeps the draft when the discard prompt is dismissed', async () => {
    openDialog()
    await addFilter('spicy')

    fireEvent.click(screen.getByRole('button', { name: en.common.cancel }))
    fireEvent.click(
      screen.getByRole('button', { name: en.filters.discardKeep })
    )

    expect(removeButton('spicy')).toBeInTheDocument()
  })

  it('rejects a duplicate add without staging it', async () => {
    openDialog()
    fireEvent.change(addInput(), { target: { value: 'vegan' } })
    fireEvent.click(screen.getByRole('button', { name: en.filters.add }))

    expect(
      await screen.findByText(en.filters.nameAlreadyExists)
    ).toBeInTheDocument()
    // The duplicate was not staged: still exactly one 'vegan' row (its remove
    // control), so no new filter entered the draft.
    expect(
      screen.getAllByRole('button', { name: `${en.common.delete} vegan` })
    ).toHaveLength(1)
    expect(mockSave).not.toHaveBeenCalled()
  })
})
