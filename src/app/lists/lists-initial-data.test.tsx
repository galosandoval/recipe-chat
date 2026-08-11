import '@testing-library/jest-dom'
import { screen } from '@testing-library/react'
import { Suspense } from 'react'
import { QueryHarness } from '~/lib/query-harness'
import { renderWithTranslations } from '~/lib/test-translations'

const userId = 'u1'

// `useUserId` reads this, and its result becomes part of the query key — the
// one thing a hand-written mirror of the queries could never get wrong.
jest.mock('next-auth/react', () => ({
  useSession: () => ({ data: { user: { id: 'u1' } }, status: 'authenticated' })
}))

// Imported after the mock so the components pick it up.
import {
  ListsInitialDataProvider,
  type ListsInitialData
} from './lists-initial-data'
import { ListByUserId } from '~/app/list/list-by-user-id'
import { PantryByUserId } from '~/app/pantry/pantry-by-user-id'

const seed: ListsInitialData = {
  groceryList: {
    ingredients: [{ id: 'i1', rawString: 'eggs', checked: false }]
  },
  pantry: { id: 'p1', ingredients: [{ id: 'i2', rawString: 'flour' }] },
  user: { id: userId, preferredWeightUnit: null, preferredVolumeUnit: null }
} as unknown as ListsInitialData

function ListsSurfaces() {
  return (
    <>
      <ListByUserId />
      <PantryByUserId />
    </>
  )
}

describe('ListsInitialDataProvider (#590)', () => {
  it('renders the real /lists surfaces from seeded data, with no requests', async () => {
    const onOp = jest.fn()
    renderWithTranslations(
      <QueryHarness onOp={onOp}>
        <ListsInitialDataProvider userId={userId} data={seed}>
          <Suspense fallback={<div>loading</div>}>
            <ListsSurfaces />
          </Suspense>
        </ListsInitialDataProvider>
      </QueryHarness>
    )

    expect(await screen.findByText('eggs')).toBeInTheDocument()
    expect(await screen.findByText('flour')).toBeInTheDocument()
    // The whole point: no unauthenticated server-render round trip.
    expect(onOp).not.toHaveBeenCalled()
  })

  it('fetches when the provider is absent (guards against regressing the seed)', async () => {
    const onOp = jest.fn()
    renderWithTranslations(
      <QueryHarness
        onOp={onOp}
        responses={{
          'lists.byUserId': seed.groceryList,
          'pantry.byUserId': seed.pantry,
          'users.get': seed.user
        }}
      >
        <Suspense fallback={<div>loading</div>}>
          <ListsSurfaces />
        </Suspense>
      </QueryHarness>
    )

    expect(await screen.findByText('eggs')).toBeInTheDocument()
    expect(onOp).toHaveBeenCalledWith('lists.byUserId')
  })
})
