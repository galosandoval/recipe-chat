import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { api } from '~/trpc/react'
import { QueryHarness } from '~/lib/query-harness'
import {
  ChatInitialDataProvider,
  type ChatInitialData
} from './chat-initial-data'

const userId = 'u1'

const seed: ChatInitialData = {
  tasteProfile: null,
  filters: [{ id: 'f1', name: 'vegan', checked: true }],
  pantry: { id: 'p1', ingredients: [] }
} as unknown as ChatInitialData

/** Mirrors what `/chat`'s welcome surfaces read on first paint. */
function ShowChatData() {
  const profile = api.tasteProfile.get.useQuery()
  const filters = api.filters.getByUserId.useQuery({ userId })
  const [pantry] = api.pantry.byUserId.useSuspenseQuery({ userId })
  return (
    <div>
      seeded: {profile.isPending ? 'pending' : String(profile.data)}/
      {filters.data?.[0]?.name}/{pantry?.id}
    </div>
  )
}

describe('ChatInitialDataProvider (#590)', () => {
  it('renders every chat query from seeded data on first paint, with no requests', () => {
    const onOp = jest.fn()
    render(
      <QueryHarness onOp={onOp}>
        <ChatInitialDataProvider userId={userId} data={seed}>
          <ShowChatData />
        </ChatInitialDataProvider>
      </QueryHarness>
    )

    // Synchronous: no loading flash, no suspense fallback, no round trip.
    expect(screen.getByText('seeded: null/vegan/p1')).toBeInTheDocument()
    expect(onOp).not.toHaveBeenCalled()
  })
})
