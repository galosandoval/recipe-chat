import '@testing-library/jest-dom'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithTranslations, en } from '~/lib/test-translations'
import { useChatStore } from '~/components/chat/chat-store'
import { useChatDrawerStore } from '~/components/chat/chat-drawer-store'

const mockPush = jest.fn()

jest.mock('~/hooks/use-app-router', () => ({
  useAppRouter: () => ({ push: mockPush })
}))

// The list renders from its RSC-provided `initialData`, so the query never has
// to resolve — this only keeps the tRPC client out of the test.
jest.mock('~/trpc/react', () => ({
  api: {
    chats: {
      getChatHistory: {
        useQuery: (_input: unknown, options: { initialData: unknown }) => ({
          data: options.initialData
        })
      }
    }
  }
}))

// Imported after the mocks so the component picks them up.
import { ChatHistory } from './chat-history'

type Chat = Parameters<typeof ChatHistory>[0]['initialChats'][number]

function buildChat(overrides: Partial<Chat> = {}): Chat {
  return {
    id: 'chat-1',
    page: 'recipes',
    recipeId: null,
    recipe: null,
    updatedAt: new Date(),
    messages: [{ content: 'What should I make for dinner tonight?' }],
    ...overrides
  }
}

describe('ChatHistory', () => {
  beforeEach(() => {
    mockPush.mockClear()
    useChatStore.getState().reset()
    useChatDrawerStore.getState().close()
  })

  it('titles each card with the chat opening user message', () => {
    renderWithTranslations(
      <ChatHistory scope={null} initialChats={[buildChat()]} />
    )

    expect(
      screen.getByText('What should I make for dinner tonight?')
    ).toBeInTheDocument()
  })

  it('labels each card section only in the every-context list', () => {
    const chats = [buildChat(), buildChat({ id: 'chat-2', page: 'pantry' })]

    const { rerender } = renderWithTranslations(
      <ChatHistory scope={null} initialChats={chats} />
    )
    expect(screen.getByText(en.nav.chat)).toBeInTheDocument()
    expect(screen.getByText(en.nav.pantry)).toBeInTheDocument()

    rerender(
      <ChatHistory
        scope={{ page: 'pantry', recipeId: null }}
        initialChats={[chats[1]]}
      />
    )
    expect(screen.queryByText(en.nav.pantry)).not.toBeInTheDocument()
  })

  it('shows the empty state when there are no chats', () => {
    renderWithTranslations(<ChatHistory scope={null} initialChats={[]} />)

    expect(screen.getByText(en.chat.history.empty)).toBeInTheDocument()
  })

  it('reopens a general chat on the chat page', () => {
    renderWithTranslations(
      <ChatHistory scope={null} initialChats={[buildChat()]} />
    )

    fireEvent.click(screen.getByRole('button'))

    expect(useChatStore.getState().pendingChat).toEqual({
      chatId: 'chat-1',
      scope: { page: 'recipes', recipeId: null }
    })
    expect(mockPush).toHaveBeenCalledWith('/chat')
    expect(useChatDrawerStore.getState().isOpen).toBe(false)
  })

  it('reopens a pantry chat with the chat panel already open on its tab', () => {
    renderWithTranslations(
      <ChatHistory
        scope={null}
        initialChats={[buildChat({ page: 'pantry' })]}
      />
    )

    fireEvent.click(screen.getByRole('button'))

    expect(useChatStore.getState().pendingChat).toEqual({
      chatId: 'chat-1',
      scope: { page: 'pantry', recipeId: null }
    })
    expect(mockPush).toHaveBeenCalledWith('/lists?tab=pantry')
    expect(useChatDrawerStore.getState().isOpen).toBe(true)
    expect(useChatDrawerStore.getState().context).toEqual({ page: 'pantry' })
  })

  it('reopens a recipe-detail chat on that recipe page', () => {
    renderWithTranslations(
      <ChatHistory
        scope={null}
        initialChats={[
          buildChat({
            page: 'recipe-detail',
            recipeId: 'recipe-1',
            recipe: { name: 'Lemon Garlic Shrimp Pasta', slug: 'lemon-garlic' }
          })
        ]}
      />
    )

    fireEvent.click(screen.getByRole('button'))

    expect(useChatStore.getState().pendingChat).toEqual({
      chatId: 'chat-1',
      scope: { page: 'recipe-detail', recipeId: 'recipe-1' }
    })
    expect(mockPush).toHaveBeenCalledWith('/recipes/lemon-garlic')
    expect(useChatDrawerStore.getState().isOpen).toBe(true)
  })
})
