import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { Suspense, type ReactNode } from 'react'
import { QueryHarness } from '~/lib/query-harness'
import {
  RecipeInitialDataProvider,
  useRecipe,
  useRecipeFromCache,
  type RecipeByIdData
} from './use-recipe'

// Every consumer reads the slug from the route.
jest.mock('next/navigation', () => ({
  useParams: () => ({ slug: 'pasta' }),
  useRouter: () => ({ push: jest.fn() })
}))

const recipe = {
  id: 'r1',
  name: 'Pasta',
  slug: 'pasta',
  description: 'Tasty pasta',
  ingredients: [],
  instructions: []
} as unknown as RecipeByIdData

function Harness({
  children,
  onOp
}: {
  children: ReactNode
  onOp: (path: string) => void
}) {
  return (
    <QueryHarness onOp={onOp} responses={{ 'recipes.bySlug': recipe }}>
      {children}
    </QueryHarness>
  )
}

function ShowRecipe() {
  const { data } = useRecipe()
  return <div>name: {data?.name}</div>
}

function ShowFromCache() {
  const { data } = useRecipeFromCache()
  return <div>cache: {data?.name ?? 'empty'}</div>
}

describe('useRecipe seeding (#545)', () => {
  it('resolves the suspense query from seeded data without a network request', async () => {
    const onOp = jest.fn()
    render(
      <Harness onOp={onOp}>
        <RecipeInitialDataProvider slug='pasta' recipe={recipe}>
          <Suspense fallback={<div>loading</div>}>
            <ShowRecipe />
          </Suspense>
        </RecipeInitialDataProvider>
      </Harness>
    )

    expect(await screen.findByText('name: Pasta')).toBeInTheDocument()
    // The heart of the fix: with the cache seeded, `useSuspenseQuery` never hits
    // the transport — so the unauthenticated SSR refetch can't happen.
    expect(onOp).not.toHaveBeenCalled()
  })

  it('fetches when the provider is absent (guards against regressing the seed)', async () => {
    const onOp = jest.fn()
    render(
      <Harness onOp={onOp}>
        <Suspense fallback={<div>loading</div>}>
          <ShowRecipe />
        </Suspense>
      </Harness>
    )

    expect(await screen.findByText('name: Pasta')).toBeInTheDocument()
    expect(onOp).toHaveBeenCalledWith('recipes.bySlug')
  })
})

describe('useRecipeFromCache (#545)', () => {
  it('never issues a request and reflects seeded cache data', async () => {
    const onOp = jest.fn()
    render(
      <Harness onOp={onOp}>
        <RecipeInitialDataProvider slug='pasta' recipe={recipe}>
          <ShowFromCache />
        </RecipeInitialDataProvider>
      </Harness>
    )

    expect(await screen.findByText('cache: Pasta')).toBeInTheDocument()
    expect(onOp).not.toHaveBeenCalled()
  })

  it('returns no data (and still never fetches) when the cache is empty', () => {
    const onOp = jest.fn()
    render(
      <Harness onOp={onOp}>
        <ShowFromCache />
      </Harness>
    )

    expect(screen.getByText('cache: empty')).toBeInTheDocument()
    expect(onOp).not.toHaveBeenCalled()
  })
})
