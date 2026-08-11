import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { Suspense } from 'react'
import { api } from '~/trpc/react'
import { QueryHarness } from '~/lib/query-harness'
import { useSeedQueryCache } from './use-seed-query-cache'

function Seeder({ children }: { children: React.ReactNode }) {
  const utils = api.useUtils()
  useSeedQueryCache(() => {
    utils.tasteProfile.get.setData(undefined, null)
  })
  return <>{children}</>
}

function ShowProfile() {
  const [profile] = api.tasteProfile.get.useSuspenseQuery()
  return <div>profile: {profile === null ? 'none' : 'some'}</div>
}

describe('useSeedQueryCache', () => {
  it('seeds during render, so a suspense query resolves without a request', async () => {
    const onOp = jest.fn()
    render(
      <QueryHarness onOp={onOp}>
        <Seeder>
          <Suspense fallback={<div>loading</div>}>
            <ShowProfile />
          </Suspense>
        </Seeder>
      </QueryHarness>
    )

    expect(await screen.findByText('profile: none')).toBeInTheDocument()
    expect(onOp).not.toHaveBeenCalled()
  })

  it('runs the seed exactly once per mount, not on every render', () => {
    const seed = jest.fn()
    function Probe({ n }: { n: number }) {
      useSeedQueryCache(seed)
      return <div>n: {n}</div>
    }
    const { rerender } = render(
      <QueryHarness>
        <Probe n={1} />
      </QueryHarness>
    )
    rerender(
      <QueryHarness>
        <Probe n={2} />
      </QueryHarness>
    )

    expect(screen.getByText('n: 2')).toBeInTheDocument()
    expect(seed).toHaveBeenCalledTimes(1)
  })
})
