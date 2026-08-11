import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { Suspense } from 'react'
import { api } from '~/trpc/react'
import { QueryHarness } from '~/lib/query-harness'
import {
  RecipesInitialDataProvider,
  type RecipesFirstPage
} from './recipes-initial-data'
import { RECIPES_PER_PAGE_LIMIT } from './recipes-constants'

const firstPage = {
  items: [{ id: 'r1', name: 'Pasta' }],
  nextCursor: 'r2'
} as unknown as RecipesFirstPage

/** Mirrors InfiniteRecipes' query — same input, same limit constant. */
function ShowRecipes() {
  const [data] = api.recipes.infiniteRecipes.useSuspenseInfiniteQuery(
    { limit: RECIPES_PER_PAGE_LIMIT, search: '' },
    { getNextPageParam: (lastPage) => lastPage.nextCursor }
  )
  return <div>seeded: {data.pages[0]?.items[0]?.name}</div>
}

describe('RecipesInitialDataProvider (#590)', () => {
  it('resolves the suspense infinite query from seeded data, with no requests', async () => {
    const onOp = jest.fn()
    render(
      <QueryHarness onOp={onOp}>
        <RecipesInitialDataProvider firstPage={firstPage}>
          <Suspense fallback={<div>loading</div>}>
            <ShowRecipes />
          </Suspense>
        </RecipesInitialDataProvider>
      </QueryHarness>
    )

    expect(await screen.findByText('seeded: Pasta')).toBeInTheDocument()
    expect(onOp).not.toHaveBeenCalled()
  })

  it('fetches when the provider is absent (guards against regressing the seed)', async () => {
    const onOp = jest.fn()
    render(
      <QueryHarness
        onOp={onOp}
        responses={{ 'recipes.infiniteRecipes': firstPage }}
      >
        <Suspense fallback={<div>loading</div>}>
          <ShowRecipes />
        </Suspense>
      </QueryHarness>
    )

    expect(await screen.findByText('seeded: Pasta')).toBeInTheDocument()
    expect(onOp).toHaveBeenCalledWith('recipes.infiniteRecipes')
  })
})
