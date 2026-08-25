import '@testing-library/jest-dom'
import { screen } from '@testing-library/react'
import { renderWithTranslations, en } from '~/lib/test-translations'
import { RouteProvider } from '~/lib/test-route-provider'

jest.mock('~/trpc/react', () => ({
  api: {
    subscription: {
      getInfo: {
        useQuery: () => ({ data: undefined, isLoading: false })
      },
      createCheckout: {
        useMutation: () => ({ mutate: jest.fn(), status: 'idle' })
      },
      createPortalSession: {
        useMutation: () => ({ mutate: jest.fn(), status: 'idle' })
      }
    }
  }
}))

// Imported after the mock so the page picks it up.
import SubscriptionPage from './page'

const original = process.env.NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED

afterEach(() => {
  process.env.NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED = original
})

function renderPage() {
  return renderWithTranslations(
    <RouteProvider url='/subscription'>
      <SubscriptionPage />
    </RouteProvider>
  )
}

describe('subscription page while subscriptions are disabled', () => {
  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED
  })

  it('says subscriptions are not available yet', async () => {
    renderPage()

    expect(
      await screen.findByText(en.subscription.unavailableMessage)
    ).toBeInTheDocument()
  })

  it('shows no tiers, prices, or checkout button', async () => {
    renderPage()
    await screen.findByText(en.subscription.unavailableMessage)

    expect(screen.queryByText(en.subscription.starter)).not.toBeInTheDocument()
    expect(screen.queryByText(en.subscription.premium)).not.toBeInTheDocument()
    expect(
      screen.queryByText(en.subscription.subscribe)
    ).not.toBeInTheDocument()
    expect(
      screen.queryByText(en.subscription.manageBilling)
    ).not.toBeInTheDocument()
  })
})

describe('subscription page while subscriptions are enabled', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED = 'true'
  })

  it('shows the tier grid with a way to subscribe', async () => {
    renderPage()

    expect(await screen.findByText(en.subscription.starter)).toBeInTheDocument()
    expect(screen.getByText(en.subscription.premium)).toBeInTheDocument()
    expect(screen.getAllByText(en.subscription.subscribe)).toHaveLength(2)
    expect(
      screen.queryByText(en.subscription.unavailableMessage)
    ).not.toBeInTheDocument()
  })
})
