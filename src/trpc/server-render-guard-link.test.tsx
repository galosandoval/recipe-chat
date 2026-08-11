import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { observable } from '@trpc/server/observable'
import { api } from '~/trpc/react'
import {
  createServerRenderGuardLink,
  SERVER_RENDER_QUERY_ERROR
} from './server-render-guard-link'

function Harness({
  isServerRender,
  onOp
}: {
  isServerRender: boolean
  onOp: jest.Mock
}) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  })
  const trpcClient = api.createClient({
    links: [
      createServerRenderGuardLink(() => isServerRender),
      () =>
        ({ op }) =>
          observable((observer) => {
            onOp(op.path)
            observer.next({ result: { data: null } })
            observer.complete()
          })
    ]
  })
  return (
    <QueryClientProvider client={queryClient}>
      <api.Provider client={trpcClient} queryClient={queryClient}>
        <ShowProfile />
      </api.Provider>
    </QueryClientProvider>
  )
}

function ShowProfile() {
  const { error, isSuccess } = api.tasteProfile.get.useQuery()
  if (error) return <div>error: {error.message}</div>
  return <div>{isSuccess ? 'ok' : 'pending'}</div>
}

describe('createServerRenderGuardLink (#590)', () => {
  it('fails a server-render request loudly with a named error, before it goes out', async () => {
    const onOp = jest.fn()
    render(<Harness isServerRender onOp={onOp} />)

    expect(
      await screen.findByText(new RegExp(SERVER_RENDER_QUERY_ERROR))
    ).toBeInTheDocument()
    // Never reaches the transport: the point is to stop the cookie-less request,
    // not to let it come back as a confusing UNAUTHORIZED.
    expect(onOp).not.toHaveBeenCalled()
  })

  it('passes browser requests straight through', async () => {
    const onOp = jest.fn()
    render(<Harness isServerRender={false} onOp={onOp} />)

    expect(await screen.findByText('ok')).toBeInTheDocument()
    expect(onOp).toHaveBeenCalledWith('tasteProfile.get')
  })
})
