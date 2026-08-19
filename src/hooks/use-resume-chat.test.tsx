import '@testing-library/jest-dom'
import { StrictMode } from 'react'
import { render, screen } from '@testing-library/react'
import { useChatStore } from '~/components/chat/chat-store'
import { RECIPES_CONTEXT, type ChatContext } from '~/schemas/chats-schema'

/** The context's auto-resume chat, as the server would resolve it. */
let resumable: { id: string } | null = null

jest.mock('next-auth/react', () => ({
  useSession: () => ({ status: 'authenticated', data: { user: { id: 'u1' } } })
}))

jest.mock('~/trpc/react', () => ({
  api: {
    useUtils: () => ({
      chats: {
        getResumableChat: { setData: jest.fn() },
        getMessagesById: { setData: jest.fn() }
      }
    }),
    chats: {
      getResumableChat: {
        useQuery: () => ({ data: resumable, isSuccess: true })
      }
    }
  }
}))

// Imported after the mocks so the hook picks them up.
import { useResumeChat } from './use-resume-chat'

function ChatSurface({ context }: { context: ChatContext }) {
  useResumeChat(context)
  const chatId = useChatStore((s) => s.chatId)

  return <div data-testid='chat-id'>{chatId}</div>
}

const RECIPE_DETAIL_CONTEXT: ChatContext = {
  page: 'recipe-detail',
  recipe: {
    id: 'recipe-1',
    name: 'Lemon Garlic Shrimp Pasta',
    slug: 'lemon-garlic-shrimp-pasta',
    description: null,
    ingredients: [],
    cuisine: null,
    course: null
  }
}

describe('useResumeChat', () => {
  beforeEach(() => {
    resumable = null
    useChatStore.getState().reset()
  })

  it('adopts the context auto-resume chat', () => {
    resumable = { id: 'resumable-chat' }

    render(<ChatSurface context={RECIPES_CONTEXT} />)

    expect(screen.getByTestId('chat-id')).toHaveTextContent('resumable-chat')
  })

  // React's dev-only double invoke re-runs every mount effect, including the
  // one that blanks `chatId` on entering a context. A chat opened from Chat
  // History has to survive that second pass — it didn't, and the user landed
  // back on a fresh chat.
  it('keeps a chat opened from Chat History across a repeated effect pass', () => {
    resumable = { id: 'resumable-chat' }
    useChatStore.getState().setPendingChat({
      chatId: 'chat-from-history',
      scope: { page: 'recipes', recipeId: null }
    })

    render(
      <StrictMode>
        <ChatSurface context={RECIPES_CONTEXT} />
      </StrictMode>
    )

    expect(screen.getByTestId('chat-id')).toHaveTextContent('chat-from-history')
    expect(useChatStore.getState().pendingChat).toBeNull()
  })

  it('leaves a pending chat alone until its own context mounts', () => {
    useChatStore.getState().setPendingChat({
      chatId: 'chat-from-history',
      scope: { page: 'recipe-detail', recipeId: 'recipe-1' }
    })

    // Recipe detail renders the `recipes` context first, until the recipe
    // itself loads — the pending chat must not be consumed there.
    const { rerender } = render(<ChatSurface context={RECIPES_CONTEXT} />)
    expect(screen.getByTestId('chat-id')).toHaveTextContent('')
    expect(useChatStore.getState().pendingChat).not.toBeNull()

    rerender(<ChatSurface context={RECIPE_DETAIL_CONTEXT} />)
    expect(screen.getByTestId('chat-id')).toHaveTextContent('chat-from-history')
    expect(useChatStore.getState().pendingChat).toBeNull()
  })

  it('falls back to auto-resume once the user leaves that context', () => {
    resumable = { id: 'resumable-chat' }
    useChatStore.getState().setPendingChat({
      chatId: 'chat-from-history',
      scope: { page: 'recipes', recipeId: null }
    })

    const { rerender } = render(<ChatSurface context={RECIPES_CONTEXT} />)
    expect(screen.getByTestId('chat-id')).toHaveTextContent('chat-from-history')

    rerender(<ChatSurface context={RECIPE_DETAIL_CONTEXT} />)
    expect(screen.getByTestId('chat-id')).toHaveTextContent('resumable-chat')
  })
})
