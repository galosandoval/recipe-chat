import { act, renderHook } from '@testing-library/react'
import * as aiReact from '@ai-sdk/react'
import { api } from '~/trpc/react'
import { toast } from '~/components/toast'
import { useChatStore } from './chat-store'
import { useChatSession } from './use-chat-session'
import { STREAM_TIMEOUT } from '~/constants/chat'
import type { MessageWithRecipes, RecipeDTO } from '~/schemas/chats-schema'

jest.mock('next-auth/react', () => ({
  useSession: () => ({
    status: 'authenticated',
    data: { user: { id: 'user-1' } }
  })
}))

jest.mock('~/hooks/use-translations', () => ({
  useTranslations: () => ({
    chat: {
      generateRecipe: 'Generate a recipe for',
      generationIncomplete: 'Recipe generation incomplete'
    }
  })
}))

jest.mock('~/components/toast', () => ({
  toast: { error: jest.fn(), success: jest.fn() }
}))

// Fake transport: the ai-sdk useChat is substituted so a whole turn can be
// driven without the network. The test reads `lastOptions` to fire onFinish.
jest.mock('@ai-sdk/react', () => {
  const state: { messages: unknown[]; status: string; lastOptions: unknown } = {
    messages: [],
    status: 'ready',
    lastOptions: null
  }
  const append = jest.fn()
  const stop = jest.fn()
  const setMessages = jest.fn()
  return {
    useChat: (options: unknown) => {
      state.lastOptions = options
      return {
        messages: state.messages,
        append,
        stop,
        status: state.status,
        setMessages
      }
    },
    __transport: { state, append, stop, setMessages }
  }
})

jest.mock('~/trpc/react', () => {
  const upsertMutate = jest.fn()
  const generatedMutate = jest.fn()
  const invalidate = jest.fn()
  const getData = jest.fn(() => [])
  const utils = {
    chats: { getMessagesById: { invalidate } },
    recipes: { invalidate },
    filters: { getByUserId: { getData } }
  }
  return {
    api: {
      useUtils: () => utils,
      chats: {
        upsert: { useMutation: () => ({ mutate: upsertMutate }) },
        generated: { useMutation: () => ({ mutate: generatedMutate }) },
        getMessagesById: {
          useQuery: () => ({ status: 'idle', data: undefined, error: null })
        }
      },
      filters: {
        getByUserId: {
          useQuery: () => ({ data: [], status: 'success' }),
          getData
        }
      },
      __upsertMutate: upsertMutate,
      __generatedMutate: generatedMutate
    }
  }
})

const transport = (
  aiReact as unknown as { __transport: ReturnType<() => unknown> }
).__transport as {
  state: { messages: unknown[]; status: string; lastOptions: unknown }
  append: jest.Mock
  stop: jest.Mock
  setMessages: jest.Mock
}
const upsertMutate = (api as unknown as { __upsertMutate: jest.Mock })
  .__upsertMutate
const generatedMutate = (api as unknown as { __generatedMutate: jest.Mock })
  .__generatedMutate

function fireOnFinish(message: {
  content?: string
  toolInvocations?: unknown[]
}) {
  const options = transport.state.lastOptions as {
    onFinish: (m: unknown) => void
  }
  act(() => {
    options.onFinish({ content: message.content ?? '', ...message })
  })
}

function card(name: string, id: string): RecipeDTO {
  return {
    id,
    name,
    slug: name.toLowerCase(),
    description: 'A tasty ' + name,
    ingredients: [],
    instructions: [],
    prepMinutes: null,
    cookMinutes: null,
    servings: null,
    cuisine: 'thai',
    course: 'main',
    dietTags: [],
    flavorTags: [],
    mainIngredients: [],
    techniques: [],
    saved: false
  }
}

function assistantWithCard(name: string, id: string): MessageWithRecipes {
  return {
    id: 'assistant-options',
    content: 'here are options',
    role: 'assistant',
    chatId: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    recipes: [card(name, id)]
  }
}

beforeEach(() => {
  useChatStore.getState().reset()
  transport.state.messages = []
  transport.state.status = 'ready'
  transport.append.mockClear()
  transport.stop.mockClear()
  transport.setMessages.mockClear()
  upsertMutate.mockClear()
  generatedMutate.mockClear()
  ;(toast.error as jest.Mock).mockClear()
})

describe('useChatSession', () => {
  it('sends a Message and streams a happy turn, persisting via upsert', () => {
    const { result } = renderHook(() => useChatSession())

    act(() => result.current.sendMessage('give me taco ideas'))

    // The user Message is added and the transport is invoked.
    const afterSend = useChatStore.getState().messages
    expect(afterSend).toHaveLength(1)
    expect(afterSend[0].role).toBe('user')
    expect(transport.append).toHaveBeenCalledTimes(1)

    fireOnFinish({
      toolInvocations: [
        {
          toolName: 'generateRecipeOptions',
          args: { message: 'here you go' },
          result: {
            message: 'here you go',
            recipes: [{ name: 'Tacos', description: 'quick tacos' }]
          }
        }
      ]
    })

    const messages = useChatStore.getState().messages
    expect(messages).toHaveLength(2)
    expect(messages[1].role).toBe('assistant')
    expect(messages[1].recipes.map((r) => r.name)).toEqual(['Tacos'])
    expect(useChatStore.getState().isStreaming).toBe(false)

    expect(upsertMutate).toHaveBeenCalledTimes(1)
    const payload = upsertMutate.mock.calls[0][0]
    expect(payload.messages).toHaveLength(2)
    expect(generatedMutate).not.toHaveBeenCalled()
  })

  it('expands a Recipe Option keeping the tapped card id and records it', () => {
    useChatStore.setState({ messages: [assistantWithCard('Curry', 'card-id')] })
    const { result } = renderHook(() => useChatSession())

    act(() =>
      result.current.generateRecipe('card-id', 'Curry', 'A tasty Curry')
    )

    expect(useChatStore.getState().pendingExpandRecipeId).toBe('card-id')
    expect(useChatStore.getState().isStreaming).toBe(true)

    fireOnFinish({
      toolInvocations: [
        {
          toolName: 'expandRecipe',
          args: {
            recipeName: 'Curry',
            details: {
              ingredients: ['coconut milk'],
              instructions: ['simmer'],
              servings: 4
            },
            message: ''
          }
        }
      ]
    })

    const messages = useChatStore.getState().messages
    const expanded = messages.at(-1)
    expect(expanded?.recipes[0].id).toBe('card-id')
    expect(expanded?.recipes[0].ingredients).toEqual(['coconut milk'])
    expect(useChatStore.getState().pendingExpandRecipeId).toBeNull()

    expect(generatedMutate).toHaveBeenCalledTimes(1)
    expect(generatedMutate.mock.calls[0][0].generated.id).toBe('card-id')
    expect(upsertMutate).not.toHaveBeenCalled()
  })

  it('rolls back the trailing Messages when an expansion fails', () => {
    useChatStore.setState({
      messages: [
        assistantWithCard('Curry', 'card-id'),
        {
          id: 'user-gen',
          content: 'Generate a recipe for Curry',
          role: 'user',
          chatId: '',
          createdAt: new Date(),
          updatedAt: new Date(),
          recipes: []
        },
        {
          id: 'assistant-placeholder',
          content: '',
          role: 'assistant',
          chatId: '',
          createdAt: new Date(),
          updatedAt: new Date(),
          recipes: []
        }
      ],
      pendingExpandRecipeId: 'card-id'
    })
    const { result } = renderHook(() => useChatSession())
    void result

    fireOnFinish({
      toolInvocations: [
        {
          toolName: 'expandRecipe',
          args: {
            recipeName: 'Curry',
            details: { ingredients: [], instructions: [], servings: 4 }
          }
        }
      ]
    })

    const messages = useChatStore.getState().messages
    expect(messages.map((m) => m.id)).toEqual(['assistant-options'])
    expect(useChatStore.getState().pendingExpandRecipeId).toBeNull()
    expect(toast.error).toHaveBeenCalledWith('Recipe generation incomplete')
    expect(upsertMutate).not.toHaveBeenCalled()
    expect(generatedMutate).not.toHaveBeenCalled()
  })

  it('runs one stream-timeout watchdog that cleans up a stuck stream', () => {
    jest.useFakeTimers()
    try {
      useChatStore.setState({
        messages: [assistantWithCard('Curry', 'card-id')]
      })
      const { result } = renderHook(() => useChatSession())

      act(() =>
        result.current.generateRecipe('card-id', 'Curry', 'A tasty Curry')
      )
      expect(useChatStore.getState().isStreaming).toBe(true)

      act(() => {
        jest.advanceTimersByTime(STREAM_TIMEOUT)
      })

      expect(transport.stop).toHaveBeenCalledTimes(1)
      expect(useChatStore.getState().isStreaming).toBe(false)
      expect(useChatStore.getState().pendingExpandRecipeId).toBeNull()
    } finally {
      jest.useRealTimers()
    }
  })
})
